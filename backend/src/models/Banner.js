const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  image: { type: String, required: true },
  buttonText: { type: String, default: 'Shop Now' },
  link: { type: String, default: '/shop' },
  type: {
    type: String,
    enum: ['home_hero', 'promo', 'sale', 'category'],
    default: 'home_hero'
  },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Banner', bannerSchema);
