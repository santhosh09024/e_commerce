const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  variant: {
    size: { type: String, default: '' },
    color: { type: String, default: '' },
    sku: { type: String, default: '' }
  }
});

const orderStatusTimelineSchema = new mongoose.Schema({
  status: { type: String, required: true },
  note: { type: String, default: '' },
  updatedAt: { type: Date, default: Date.now }
});

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [orderItemSchema],
  shippingAddress: {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    apartment: { type: String, default: '' },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true, default: 'India' },
    pincode: { type: String, required: true }
  },
  billingAddress: {
    fullName: { type: String },
    phone: { type: String },
    address: { type: String },
    apartment: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String },
    pincode: { type: String }
  },
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  shippingFee: { type: Number, default: 0 },
  coupon: {
    code: { type: String, default: null },
    discountAmount: { type: Number, default: 0 }
  },
  totalAmount: { type: Number, required: true },
  paymentMethod: {
    type: String,
    enum: ['razorpay', 'cod'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentResult: {
    id: String,
    status: String,
    update_time: String,
    email_address: String,
    razorpay_order_id: String,
    razorpay_payment_id: String,
    razorpay_signature: String
  },
  orderStatus: {
    type: String,
    enum: [
      'Pending',
      'Confirmed',
      'Processing',
      'Packed',
      'Shipped',
      'Out for delivery',
      'Delivered',
      'Cancelled',
      'Returned',
      'Refunded'
    ],
    default: 'Pending'
  },
  trackingNumber: { type: String, default: '' },
  courier: { type: String, default: '' },
  estimatedDeliveryDate: { type: Date },
  deliveredAt: { type: Date },
  cancelledAt: { type: Date },
  cancellationReason: { type: String, default: '' },
  timeline: [orderStatusTimelineSchema]
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
