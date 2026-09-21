const express = require('express');
const router = express.Router();
const {
  getInventoryLogs,
  getLowStockProducts,
  adjustStock,
} = require('../controllers/inventoryController');
const { protect, admin } = require('../middleware/authMiddleware');

router.use(protect, admin);

router.get('/logs', getInventoryLogs);
router.get('/alerts', getLowStockProducts);
router.post('/adjust', adjustStock);

module.exports = router;
