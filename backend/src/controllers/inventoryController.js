const InventoryHistory = require('../models/InventoryHistory');
const Product = require('../models/Product');

// @desc    Get inventory audit logs
// @route   GET /api/inventory/logs
// @access  Private/Admin
const getInventoryLogs = async (req, res, next) => {
  try {
    const { productId, limit = 50 } = req.query;
    const query = {};
    if (productId) query.product = productId;

    const logs = await InventoryHistory.find(query)
      .populate('product', 'name sku images')
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.json({ success: true, count: logs.length, data: logs });
  } catch (error) {
    next(error);
  }
};

// @desc    Get low stock and out-of-stock items
// @route   GET /api/inventory/alerts
// @access  Private/Admin
const getLowStockProducts = async (req, res, next) => {
  try {
    const lowStock = await Product.find({
      $expr: { $lte: ['$stock', '$lowStockThreshold'] },
      status: 'published',
    }).select('name sku stock lowStockThreshold price images category');

    res.json({ success: true, count: lowStock.length, data: lowStock });
  } catch (error) {
    next(error);
  }
};

// @desc    Adjust inventory stock manually
// @route   POST /api/inventory/adjust
// @access  Private/Admin
const adjustStock = async (req, res, next) => {
  try {
    const { productId, adjustment, notes = '' } = req.body;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const prevStock = product.stock;
    const newStock = Math.max(0, prevStock + Number(adjustment));
    product.stock = newStock;
    await product.save();

    const log = await InventoryHistory.create({
      product: product._id,
      previousQuantity: prevStock,
      newQuantity: newStock,
      quantityChanged: Number(adjustment),
      action: Number(adjustment) > 0 ? 'restock' : 'manual_adjustment',
      user: req.user._id,
      notes: notes || 'Admin manual inventory adjustment',
    });

    res.json({
      success: true,
      message: 'Stock adjusted successfully',
      data: {
        product: {
          _id: product._id,
          name: product.name,
          stock: product.stock,
        },
        log,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInventoryLogs,
  getLowStockProducts,
  adjustStock,
};
