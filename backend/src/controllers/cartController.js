const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Settings = require('../models/Settings');

// Helper to calculate cart totals
const calculateTotals = async (items) => {
  let subtotal = 0;
  items.forEach(item => {
    subtotal += item.price * item.quantity;
  });

  const settings = (await Settings.findOne()) || {
    freeShippingThreshold: 999,
    standardShippingFee: 99,
    taxPercentage: 18,
  };

  const shippingFee = subtotal >= settings.freeShippingThreshold || subtotal === 0 ? 0 : settings.standardShippingFee;
  const tax = Math.round((subtotal * settings.taxPercentage) / 100);
  const grandTotal = subtotal + shippingFee + tax;

  return { subtotal, shippingFee, tax, grandTotal };
};

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      select: 'name slug images price comparePrice stock variants status',
    });

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    // Filter out items where product was deleted or archived
    cart.items = cart.items.filter(item => item.product && item.product.status === 'published');
    await cart.save();

    const totals = await calculateTotals(cart.items);

    res.json({
      success: true,
      data: cart,
      summary: totals,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1, variant = {} } = req.body;

    const product = await Product.findById(productId);
    if (!product || product.status !== 'published') {
      return res.status(404).json({ success: false, message: 'Product not found or unavailable' });
    }

    // Stock check
    if (product.stock < quantity) {
      return res.status(400).json({ success: false, message: `Only ${product.stock} units available in stock` });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    // Determine variant pricing if any
    let itemPrice = product.price;
    if (variant.size || variant.color) {
      const matchedVariant = product.variants.find(
        v => (!variant.size || v.size === variant.size) && (!variant.color || v.color.toLowerCase() === variant.color.toLowerCase())
      );
      if (matchedVariant && matchedVariant.price > 0) {
        itemPrice = matchedVariant.price;
      }
    }

    // Check if matching item exists in cart
    const existingIndex = cart.items.findIndex(item => {
      const sameProduct = item.product.toString() === productId.toString();
      const sameSize = (item.variant?.size || '') === (variant.size || '');
      const sameColor = (item.variant?.color || '') === (variant.color || '');
      return sameProduct && sameSize && sameColor;
    });

    if (existingIndex > -1) {
      const newQty = cart.items[existingIndex].quantity + Number(quantity);
      if (product.stock < newQty) {
        return res.status(400).json({ success: false, message: `Cannot add more. Max stock available: ${product.stock}` });
      }
      cart.items[existingIndex].quantity = newQty;
      cart.items[existingIndex].price = itemPrice;
    } else {
      cart.items.push({
        product: productId,
        quantity: Number(quantity),
        variant: {
          size: variant.size || '',
          color: variant.color || '',
          sku: variant.sku || product.sku,
        },
        price: itemPrice,
      });
    }

    await cart.save();
    await cart.populate({
      path: 'items.product',
      select: 'name slug images price comparePrice stock variants status',
    });

    const totals = await calculateTotals(cart.items);

    res.json({
      success: true,
      data: cart,
      summary: totals,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update item quantity
// @route   PUT /api/cart/:itemId
// @access  Private
const updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const { itemId } = req.params;

    if (quantity < 1) {
      return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found in cart' });
    }

    const product = await Product.findById(item.product);
    if (product.stock < quantity) {
      return res.status(400).json({ success: false, message: `Only ${product.stock} items in stock` });
    }

    item.quantity = quantity;
    await cart.save();

    await cart.populate({
      path: 'items.product',
      select: 'name slug images price comparePrice stock variants status',
    });

    const totals = await calculateTotals(cart.items);

    res.json({ success: true, data: cart, summary: totals });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
// @access  Private
const removeCartItem = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.items.pull(req.params.itemId);
    await cart.save();

    await cart.populate({
      path: 'items.product',
      select: 'name slug images price comparePrice stock variants status',
    });

    const totals = await calculateTotals(cart.items);

    res.json({ success: true, data: cart, summary: totals });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    res.json({ success: true, message: 'Cart emptied', data: cart });
  } catch (error) {
    next(error);
  }
};

// @desc    Merge guest cart items after login
// @route   POST /api/cart/merge
// @access  Private
const mergeGuestCart = async (req, res, next) => {
  try {
    const { items = [] } = req.body;
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    for (const guestItem of items) {
      const product = await Product.findById(guestItem.productId || guestItem.product?._id);
      if (product && product.status === 'published' && product.stock > 0) {
        const existing = cart.items.find(
          it => it.product.toString() === product._id.toString() &&
          (it.variant?.size || '') === (guestItem.variant?.size || '') &&
          (it.variant?.color || '') === (guestItem.variant?.color || '')
        );

        const qtyToAdd = Math.min(guestItem.quantity || 1, product.stock);

        if (existing) {
          existing.quantity = Math.min(existing.quantity + qtyToAdd, product.stock);
        } else {
          cart.items.push({
            product: product._id,
            quantity: qtyToAdd,
            variant: guestItem.variant || {},
            price: product.price,
          });
        }
      }
    }

    await cart.save();
    await cart.populate({
      path: 'items.product',
      select: 'name slug images price comparePrice stock variants status',
    });

    const totals = await calculateTotals(cart.items);

    res.json({ success: true, data: cart, summary: totals });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  mergeGuestCart,
};
