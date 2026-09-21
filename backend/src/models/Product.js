const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
  size: { type: String, default: '' },
  color: { type: String, default: '' },
  colorCode: { type: String, default: '' },
  sku: { type: String, default: '' },
  price: { type: Number, default: 0 },
  stock: { type: Number, default: 0 }
});

const specificationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  value: { type: String, required: true }
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Please enter product name'], trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  description: { type: String, required: [true, 'Please enter product description'] },
  features: [{ type: String }],
  images: [{ type: String, required: true }],
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  subcategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', default: null },
  sku: { type: String, required: true, unique: true, uppercase: true },
  price: { type: Number, required: true, min: 0 },
  comparePrice: { type: Number, default: 0 },
  discount: { type: Number, default: 0 }, // percentage
  costPrice: { type: Number, default: 0 }, // for profit reporting
  variants: [variantSchema],
  specifications: [specificationSchema],
  stock: { type: Number, required: true, min: 0, default: 0 },
  lowStockThreshold: { type: Number, default: 5 },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
  featured: { type: Boolean, default: false },
  isTrending: { type: Boolean, default: false },
  isBestSeller: { type: Boolean, default: false },
  isNewArrival: { type: Boolean, default: false },
  isFlashSale: { type: Boolean, default: false },
  flashSaleEndsAt: { type: Date, default: null },
  status: {
    type: String,
    enum: ['published', 'draft', 'archived'],
    default: 'published'
  }
}, { timestamps: true });

// Text indexing for search
productSchema.index({ name: 'text', description: 'text', sku: 'text' });
productSchema.index({ category: 1, brand: 1, price: 1, rating: -1 });

module.exports = mongoose.model('Product', productSchema);
