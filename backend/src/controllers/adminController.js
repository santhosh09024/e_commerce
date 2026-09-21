const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const ReturnRequest = require('../models/ReturnRequest');
const InventoryHistory = require('../models/InventoryHistory');
const Settings = require('../models/Settings');
const { sendOrderStatusEmail } = require('../services/emailService');
const { createNotification } = require('../services/notificationService');

// @desc    Get admin high-level dashboard metrics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res, next) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalProducts = await Product.countDocuments({ status: 'published' });

    // Status breakdown
    const pendingOrders = await Order.countDocuments({ orderStatus: { $in: ['Pending', 'Confirmed', 'Processing', 'Packed'] } });
    const deliveredOrders = await Order.countDocuments({ orderStatus: 'Delivered' });
    const cancelledOrders = await Order.countDocuments({ orderStatus: 'Cancelled' });

    // Low stock count
    const lowStockCount = await Product.countDocuments({
      $expr: { $lte: ['$stock', '$lowStockThreshold'] },
      status: 'published',
    });

    // Total sales & profit calculation
    const completedOrders = await Order.find({
      orderStatus: { $ne: 'Cancelled' },
      paymentStatus: { $in: ['paid', 'pending'] },
    });

    let totalSales = 0;
    completedOrders.forEach(o => {
      totalSales += o.totalAmount;
    });

    // Average Order Value
    const averageOrderValue = completedOrders.length > 0 ? Math.round(totalSales / completedOrders.length) : 0;

    // Recent orders
    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(6);

    res.json({
      success: true,
      data: {
        totalSales,
        totalOrders,
        totalCustomers,
        totalProducts,
        pendingOrders,
        deliveredOrders,
        cancelledOrders,
        lowStockCount,
        averageOrderValue,
        recentOrders,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get sales analytics & chart data
// @route   GET /api/admin/analytics
// @access  Private/Admin
const getAnalytics = async (req, res, next) => {
  try {
    const { timeRange = 'monthly' } = req.query;

    // Aggregate monthly sales for the current year
    const monthlySales = await Order.aggregate([
      {
        $match: {
          orderStatus: { $ne: 'Cancelled' },
        },
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { '_id': 1 } },
    ]);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedMonthly = months.map((monthName, idx) => {
      const found = monthlySales.find(m => m._id === idx + 1);
      return {
        name: monthName,
        revenue: found ? found.revenue : 0,
        orders: found ? found.orders : 0,
      };
    });

    // Top selling products
    const topProducts = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'Cancelled' } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          name: { $first: '$items.name' },
          totalSold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
    ]);

    // Sales by payment method
    const paymentMethodStats = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'Cancelled' } } },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          revenue: { $sum: '$totalAmount' },
        },
      },
    ]);

    // Sales by state/location
    const salesByLocation = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'Cancelled' } } },
      {
        $group: {
          _id: '$shippingAddress.state',
          orders: { $sum: 1 },
          revenue: { $sum: '$totalAmount' },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 6 },
    ]);

    res.json({
      success: true,
      data: {
        monthlySales: formattedMonthly,
        topProducts,
        paymentMethodStats,
        salesByLocation,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: get all orders with pagination, search & filters
// @route   GET /api/admin/orders
// @access  Private/Admin
const getAllOrders = async (req, res, next) => {
  try {
    const { status, paymentStatus, search, page = 1, limit = 15 } = req.query;
    const query = {};

    if (status) query.orderStatus = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'shippingAddress.fullName': { $regex: search, $options: 'i' } },
        { 'shippingAddress.phone': { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      count: orders.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: update order status, tracking number and courier
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, trackingNumber, courier, statusNote } = req.body;
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (status) {
      order.orderStatus = status;
      if (status === 'Delivered') {
        order.deliveredAt = new Date();
        if (order.paymentMethod === 'cod') {
          order.paymentStatus = 'paid';
        }
      }
    }

    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (courier) order.courier = courier;

    order.timeline.push({
      status: status || order.orderStatus,
      note: statusNote || `Status changed to ${status || order.orderStatus}${trackingNumber ? ` (Tracking: ${trackingNumber})` : ''}`,
      updatedAt: new Date(),
    });

    await order.save();

    // Trigger status email to customer
    if (order.user && order.user.email) {
      sendOrderStatusEmail(order.user, order, statusNote).catch(err => console.error('Status email error:', err.message));
      createNotification({
        userId: order.user._id,
        title: `Order Update: ${order.orderStatus}`,
        message: `Your order #${order.orderNumber} is now ${order.orderStatus}.`,
        type: 'order_shipped',
        link: `/account/orders/${order._id}`,
      });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: get all customers
// @route   GET /api/admin/customers
// @access  Private/Admin
const getAllCustomers = async (req, res, next) => {
  try {
    const { search, role, page = 1, limit = 20 } = req.query;
    const query = {};

    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      count: users.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: block or unblock customer
// @route   PUT /api/admin/customers/:id/block
// @access  Private/Admin
const toggleBlockCustomer = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'super_admin') {
      return res.status(403).json({ success: false, message: 'Cannot block Super Admin' });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.json({
      success: true,
      message: `User account has been ${user.isBlocked ? 'suspended' : 'reactivated'}`,
      isBlocked: user.isBlocked,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: change customer role
// @route   PUT /api/admin/customers/:id/role
// @access  Private/Admin (Super Admin only for promoting to admin/super_admin)
const updateCustomerRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['customer', 'admin', 'super_admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role specified' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.role = role;
    await user.save();

    res.json({ success: true, message: `Role updated to ${role}`, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: get and process return/refund requests
// @route   GET /api/admin/returns
// @access  Private/Admin
const getReturnRequests = async (req, res, next) => {
  try {
    const returns = await ReturnRequest.find()
      .populate('order', 'orderNumber totalAmount paymentMethod paymentStatus')
      .populate('user', 'name email phone')
      .populate('product', 'name images sku')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: returns });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: approve/reject return & refund
// @route   PUT /api/admin/returns/:id
// @access  Private/Admin
const processReturnRequest = async (req, res, next) => {
  try {
    const { approvalStatus, refundStatus, adminNotes } = req.body;
    const returnReq = await ReturnRequest.findById(req.params.id).populate('order product user');

    if (!returnReq) {
      return res.status(404).json({ success: false, message: 'Return request not found' });
    }

    if (approvalStatus) returnReq.approvalStatus = approvalStatus;
    if (refundStatus) returnReq.refundStatus = refundStatus;
    if (adminNotes) returnReq.adminNotes = adminNotes;
    returnReq.processedAt = new Date();

    await returnReq.save();

    // If return approved, restore inventory
    if (approvalStatus === 'Approved') {
      const product = await Product.findById(returnReq.product._id);
      if (product) {
        const prev = product.stock;
        product.stock += 1;
        await product.save();

        await InventoryHistory.create({
          product: product._id,
          previousQuantity: prev,
          newQuantity: product.stock,
          quantityChanged: 1,
          action: 'order_returned',
          referenceId: returnReq.order.orderNumber,
          user: req.user._id,
          notes: 'Inventory restored from approved customer return',
        });
      }
    }

    res.json({ success: true, message: 'Return request processed', data: returnReq });
  } catch (error) {
    next(error);
  }
};

// @desc    Get store settings
// @route   GET /api/admin/settings
// @access  Public
const getSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
};

// @desc    Update store settings
// @route   PUT /api/admin/settings
// @access  Private/Admin
const updateSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings({});
    }

    Object.assign(settings, req.body);
    await settings.save();

    res.json({ success: true, message: 'Settings updated successfully', data: settings });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getAnalytics,
  getAllOrders,
  updateOrderStatus,
  getAllCustomers,
  toggleBlockCustomer,
  updateCustomerRole,
  getReturnRequests,
  processReturnRequest,
  getSettings,
  updateSettings,
};
