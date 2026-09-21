const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const Cart = require('../models/Cart');
const Settings = require('../models/Settings');
const InventoryHistory = require('../models/InventoryHistory');
const ReturnRequest = require('../models/ReturnRequest');
const { sendOrderConfirmationEmail, sendOrderStatusEmail } = require('../services/emailService');
const { createNotification } = require('../services/notificationService');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res, next) => {
  try {
    const {
      items,
      shippingAddress,
      billingAddress,
      paymentMethod,
      couponCode,
      notes,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No items in order' });
    }

    if (!shippingAddress || !shippingAddress.address || !shippingAddress.pincode) {
      return res.status(400).json({ success: false, message: 'Please provide a valid shipping address' });
    }

    const settings = (await Settings.findOne()) || {
      codEnabled: true,
      maxCodAmount: 20000,
      restrictedCodPincodes: [],
      freeShippingThreshold: 999,
      standardShippingFee: 99,
      taxPercentage: 18,
    };

    // Strict Server-Side Stock & Price Validation
    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product || item.productId);
      if (!product || product.status !== 'published') {
        return res.status(400).json({ success: false, message: `Product ${item.name || ''} is currently unavailable` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Only ${product.stock} available.`,
        });
      }

      let price = product.price;
      if (item.variant && (item.variant.size || item.variant.color)) {
        const matched = product.variants.find(
          v => (!item.variant.size || v.size === item.variant.size) &&
               (!item.variant.color || v.color.toLowerCase() === item.variant.color.toLowerCase())
        );
        if (matched && matched.price > 0) {
          price = matched.price;
        }
      }

      subtotal += price * item.quantity;
      validatedItems.push({
        product: product._id,
        name: product.name,
        image: product.images[0] || '',
        price,
        quantity: item.quantity,
        variant: item.variant || {},
      });
    }

    // Coupon Validation & Discount
    let discountAmount = 0;
    let validCoupon = null;

    if (couponCode) {
      validCoupon = await Coupon.findOne({ code: couponCode.trim().toUpperCase(), isActive: true });
      if (validCoupon && subtotal >= validCoupon.minOrderValue) {
        if (validCoupon.discountType === 'percentage') {
          discountAmount = (subtotal * validCoupon.discountValue) / 100;
          if (validCoupon.maxDiscount > 0 && discountAmount > validCoupon.maxDiscount) {
            discountAmount = validCoupon.maxDiscount;
          }
        } else {
          discountAmount = Math.min(validCoupon.discountValue, subtotal);
        }
        discountAmount = Math.round(discountAmount);
      }
    }

    // Shipping & Tax Calculations
    const shippingFee = subtotal >= settings.freeShippingThreshold ? 0 : settings.standardShippingFee;
    const taxableAmount = Math.max(0, subtotal - discountAmount);
    const tax = Math.round((taxableAmount * settings.taxPercentage) / 100);
    const totalAmount = taxableAmount + shippingFee + tax;

    // COD Validations
    if (paymentMethod === 'cod') {
      if (!settings.codEnabled) {
        return res.status(400).json({ success: false, message: 'Cash on Delivery is currently disabled by store admin' });
      }
      if (totalAmount > settings.maxCodAmount) {
        return res.status(400).json({
          success: false,
          message: `Maximum allowed order amount for Cash on Delivery is ₹${settings.maxCodAmount}`,
        });
      }
      if (settings.restrictedCodPincodes && settings.restrictedCodPincodes.includes(shippingAddress.pincode)) {
        return res.status(400).json({
          success: false,
          message: `Cash on Delivery is not available in PIN code ${shippingAddress.pincode}`,
        });
      }
    }

    // Generate readable Order Number
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `ORD-${dateStr}-${randomSuffix}`;

    // Create Order Document
    const order = await Order.create({
      orderNumber,
      user: req.user._id,
      items: validatedItems,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      subtotal,
      discount: discountAmount,
      tax,
      shippingFee,
      coupon: {
        code: validCoupon ? validCoupon.code : null,
        discountAmount,
      },
      totalAmount,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
      orderStatus: 'Confirmed',
      estimatedDeliveryDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days delivery
      timeline: [
        {
          status: 'Order Placed',
          note: `Order #${orderNumber} placed successfully using ${paymentMethod.toUpperCase()}`,
          updatedAt: new Date(),
        },
        {
          status: 'Confirmed',
          note: 'Payment authorization and order verified',
          updatedAt: new Date(),
        }
      ],
    });

    // Reduce stock and record inventory history
    for (const item of validatedItems) {
      const product = await Product.findById(item.product);
      const prevStock = product.stock;
      const newStock = Math.max(0, product.stock - item.quantity);
      product.stock = newStock;
      await product.save();

      await InventoryHistory.create({
        product: product._id,
        previousQuantity: prevStock,
        newQuantity: newStock,
        quantityChanged: -item.quantity,
        action: 'order_placed',
        referenceId: order.orderNumber,
        user: req.user._id,
        notes: `Purchased in Order #${order.orderNumber}`,
      });

      // Low stock warning check
      if (newStock <= product.lowStockThreshold) {
        console.warn(`⚠️ LOW STOCK ALERT: Product "${product.name}" has only ${newStock} units left!`);
      }
    }

    // Update coupon usage records
    if (validCoupon) {
      validCoupon.usedCount += 1;
      const userIdx = validCoupon.usersUsed.findIndex(u => u.user.toString() === req.user._id.toString());
      if (userIdx > -1) {
        validCoupon.usersUsed[userIdx].times += 1;
      } else {
        validCoupon.usersUsed.push({ user: req.user._id, times: 1 });
      }
      await validCoupon.save();
    }

    // Clear user cart in DB
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

    // Send notifications and confirmation email
    sendOrderConfirmationEmail(req.user, order).catch(err => console.error('Order email error:', err.message));
    createNotification({
      userId: req.user._id,
      title: 'Order Confirmed! 📦',
      message: `Your order #${order.orderNumber} for ₹${order.totalAmount.toLocaleString('en-IN')} has been confirmed.`,
      type: 'order_placed',
      link: `/account/orders/${order._id}`,
    });

    res.status(201).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order by ID or orderNumber
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res, next) => {
  try {
    const isObjectId = req.params.id.match(/^[0-9a-fA-F]{24}$/);
    const query = isObjectId ? { _id: req.params.id } : { orderNumber: req.params.id };

    const order = await Order.findOne(query).populate('user', 'name email phone');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Allow user or admin to view
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// @desc    Public / Customer order tracking
// @route   GET /api/orders/track/:orderNumber
// @access  Public
const trackOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({ orderNumber: req.params.orderNumber.toUpperCase() })
      .select('orderNumber orderStatus timeline trackingNumber courier estimatedDeliveryDate createdAt totalAmount items shippingAddress');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order number not found' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel order (by customer)
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (['Shipped', 'Out for delivery', 'Delivered', 'Cancelled'].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled in "${order.orderStatus}" state. Please request a return after delivery.`,
      });
    }

    order.orderStatus = 'Cancelled';
    order.cancelledAt = new Date();
    order.cancellationReason = req.body.reason || 'Cancelled by customer';
    order.timeline.push({
      status: 'Order Cancelled',
      note: `Order cancelled. Reason: ${order.cancellationReason}`,
      updatedAt: new Date(),
    });

    // If paid, mark for refund
    if (order.paymentStatus === 'paid') {
      order.paymentStatus = 'refunded';
    }

    await order.save();

    // Restore inventory
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        const prev = product.stock;
        product.stock += item.quantity;
        await product.save();

        await InventoryHistory.create({
          product: product._id,
          previousQuantity: prev,
          newQuantity: product.stock,
          quantityChanged: item.quantity,
          action: 'order_cancelled',
          referenceId: order.orderNumber,
          user: req.user._id,
          notes: 'Restored after order cancellation',
        });
      }
    }

    createNotification({
      userId: order.user,
      title: 'Order Cancelled',
      message: `Your order #${order.orderNumber} has been cancelled.`,
      type: 'order_cancelled',
      link: `/account/orders/${order._id}`,
    });

    res.json({ success: true, message: 'Order has been successfully cancelled', data: order });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit return / refund request
// @route   POST /api/orders/:id/return
// @access  Private
const requestReturn = async (req, res, next) => {
  try {
    const { productId, reason, description, images = [] } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (order.orderStatus !== 'Delivered') {
      return res.status(400).json({ success: false, message: 'Returns can only be requested for delivered orders' });
    }

    const returnReq = await ReturnRequest.create({
      order: order._id,
      user: req.user._id,
      product: productId || order.items[0].product,
      reason,
      description,
      images,
      refundAmount: order.totalAmount,
    });

    order.timeline.push({
      status: 'Return Requested',
      note: `Return requested for item: ${reason}`,
      updatedAt: new Date(),
    });
    await order.save();

    res.status(201).json({
      success: true,
      message: 'Return request submitted successfully. Admin will review within 24-48 hours.',
      data: returnReq,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  trackOrder,
  cancelOrder,
  requestReturn,
};
