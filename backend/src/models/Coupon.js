const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true,
    default: 'percentage'
  },
  discountValue: { type: Number, required: true, min: 1 },
  minOrderValue: { type: Number, default: 0 },
  maxDiscount: { type: Number, default: 0 }, // 0 means no limit
  startDate: { type: Date, default: Date.now },
  expiryDate: { type: Date, required: true },
  usageLimit: { type: Number, default: 1000 },
  userUsageLimit: { type: Number, default: 1 },
  usedCount: { type: Number, default: 0 },
  usersUsed: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    times: { type: Number, default: 1 }
  }],
  applicableCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  applicableProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Coupon', couponSchema);
