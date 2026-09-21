const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
  trackOrder,
  cancelOrder,
  requestReturn,
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

// Public tracking
router.get('/track/:orderNumber', trackOrder);

// Authenticated user order actions
router.post('/', protect, createOrder);
router.get('/', protect, getMyOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/cancel', protect, cancelOrder);
router.post('/:id/return', protect, requestReturn);

module.exports = router;
