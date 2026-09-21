const mongoose = require('mongoose');

const returnRequestSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  reason: {
    type: String,
    required: true,
    enum: [
      'Damaged item',
      'Defective or not working',
      'Item not as described',
      'Wrong item received',
      'Size/Fit issue',
      'Better price available',
      'Other'
    ]
  },
  description: { type: String, required: true },
  images: [{ type: String }],
  approvalStatus: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  refundStatus: {
    type: String,
    enum: ['Pending', 'Approved', 'Processing', 'Completed', 'Rejected'],
    default: 'Pending'
  },
  refundAmount: { type: Number, default: 0 },
  adminNotes: { type: String, default: '' },
  processedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('ReturnRequest', returnRequestSchema);
