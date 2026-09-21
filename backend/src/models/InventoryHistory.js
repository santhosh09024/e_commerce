const mongoose = require('mongoose');

const inventoryHistorySchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  previousQuantity: { type: Number, required: true },
  newQuantity: { type: Number, required: true },
  quantityChanged: { type: Number, required: true },
  action: {
    type: String,
    enum: ['order_placed', 'order_cancelled', 'order_returned', 'manual_adjustment', 'restock', 'seed'],
    required: true
  },
  referenceId: { type: String, default: '' }, // e.g. Order ID
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('InventoryHistory', inventoryHistorySchema);
