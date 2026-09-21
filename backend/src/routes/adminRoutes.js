const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAnalytics,
  getAllOrders,
  updateOrderStatus,
  getAllCustomers,
  toggleBlockCustomer,
  updateCustomerRole,
  getReturnRequests,
  processReturnRequest,
  getSettings,
  updateSettings,
} = require('../controllers/adminController');
const { protect, admin, superAdmin } = require('../middleware/authMiddleware');

// Public settings endpoint (for currency, free shipping threshold, COD availability)
router.get('/settings/public', getSettings);

// All other admin endpoints protected
router.use(protect, admin);

router.get('/dashboard', getDashboardStats);
router.get('/analytics', getAnalytics);

// Orders
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);

// Customers
router.get('/customers', getAllCustomers);
router.put('/customers/:id/block', toggleBlockCustomer);
router.put('/customers/:id/role', superAdmin, updateCustomerRole);

// Returns
router.get('/returns', getReturnRequests);
router.put('/returns/:id', processReturnRequest);

// Settings
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

module.exports = router;
