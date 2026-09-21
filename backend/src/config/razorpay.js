const Razorpay = require('razorpay');

let razorpayInstance = null;

const getRazorpay = () => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (key_id && key_secret && !key_id.includes('sample')) {
    if (!razorpayInstance) {
      razorpayInstance = new Razorpay({
        key_id,
        key_secret,
      });
    }
    return { instance: razorpayInstance, isMock: false };
  }

  // Realistic mock implementation for frictionless local development
  return {
    isMock: true,
    instance: {
      orders: {
        create: async ({ amount, currency, receipt, notes }) => {
          const fakeOrderId = `order_${Math.random().toString(36).substring(2, 12).toUpperCase()}`;
          return {
            id: fakeOrderId,
            entity: 'order',
            amount,
            amount_paid: 0,
            amount_due: amount,
            currency: currency || 'INR',
            receipt: receipt || 'rcpt_1',
            status: 'created',
            attempts: 0,
            notes: notes || {},
            created_at: Math.floor(Date.now() / 1000),
          };
        },
      },
    },
  };
};

module.exports = getRazorpay;
