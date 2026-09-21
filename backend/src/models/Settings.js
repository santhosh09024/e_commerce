const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  storeName: { type: String, default: 'ShopEase' },
  storeEmail: { type: String, default: 'support@shopease.com' },
  storePhone: { type: String, default: '+91 98765 43210' },
  currency: { type: String, default: 'INR' },
  currencySymbol: { type: String, default: '₹' },
  freeShippingThreshold: { type: Number, default: 999 },
  standardShippingFee: { type: Number, default: 99 },
  taxPercentage: { type: Number, default: 18 },
  codEnabled: { type: Boolean, default: true },
  maxCodAmount: { type: Number, default: 20000 },
  restrictedCodPincodes: [{ type: String }],
  allowGuestCheckout: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
