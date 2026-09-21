const crypto = require('crypto');
const getRazorpay = require('../config/razorpay');
const Order = require('../models/Order');

// @desc    Create Razorpay Order
// @route   POST /api/payment/create
// @access  Private
const createRazorpayOrder = async (req, res, next) => {
  try {
    const { amount, currency = 'INR', receipt = `rcpt_${Date.now()}` } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid payment amount' });
    }

    const { instance, isMock } = getRazorpay();

    // Razorpay requires amount in smallest currency sub-unit (paisa)
    const options = {
      amount: Math.round(amount * 100),
      currency,
      receipt,
      payment_capture: 1,
    };

    const razorpayOrder = await instance.orders.create(options);

    res.json({
      success: true,
      data: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        receipt: razorpayOrder.receipt,
        isMock,
        key: process.env.RAZORPAY_KEY_ID || 'rzp_test_sample_key_id',
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Razorpay Signature & complete payment
// @route   POST /api/payment/verify
// @access  Private
const verifyPayment = async (req, res, next) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId, // internal Order _id
    } = req.body;

    const { isMock } = getRazorpay();
    const secret = process.env.RAZORPAY_KEY_SECRET;

    let isValid = false;

    if (isMock) {
      // In sandbox/simulator mode, accept test signature
      isValid = true;
    } else {
      const generatedSignature = crypto
        .createHmac('sha256', secret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      isValid = generatedSignature === razorpay_signature;
    }

    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature verification failed' });
    }

    if (orderId) {
      const order = await Order.findById(orderId);
      if (order) {
        order.paymentStatus = 'paid';
        order.paymentResult = {
          id: razorpay_payment_id,
          status: 'success',
          update_time: new Date().toISOString(),
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
        };
        order.timeline.push({
          status: 'Payment Successful',
          note: `Payment verified via Razorpay ID: ${razorpay_payment_id}`,
          updatedAt: new Date(),
        });
        await order.save();
      }
    }

    res.json({
      success: true,
      message: 'Payment signature verified successfully',
      paymentId: razorpay_payment_id,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Razorpay Webhook listener
// @route   POST /api/payment/webhook
// @access  Public
const handleWebhook = async (req, res, next) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const webhookSignature = req.headers['x-razorpay-signature'];

    if (webhookSecret && webhookSignature) {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(JSON.stringify(req.body))
        .digest('hex');

      if (expectedSignature !== webhookSignature) {
        return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
      }
    }

    const event = req.body.event;
    console.log(`🔔 Razorpay Webhook Event Received: ${event}`);

    // Handle payment.captured
    if (event === 'payment.captured') {
      const payment = req.body.payload.payment.entity;
      const order = await Order.findOne({ 'paymentResult.razorpay_order_id': payment.order_id });
      if (order && order.paymentStatus !== 'paid') {
        order.paymentStatus = 'paid';
        order.paymentResult.id = payment.id;
        order.timeline.push({
          status: 'Payment Captured',
          note: `Webhook verified payment capture ID: ${payment.id}`,
          updatedAt: new Date(),
        });
        await order.save();
      }
    }

    res.json({ status: 'ok' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRazorpayOrder,
  verifyPayment,
  handleWebhook,
};
