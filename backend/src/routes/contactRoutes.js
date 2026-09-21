const express = require('express');
const router = express.Router();
const {
  submitContact,
  getInquiries,
  updateInquiry,
} = require('../controllers/contactController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/', submitContact);
router.get('/', protect, admin, getInquiries);
router.put('/:id', protect, admin, updateInquiry);

module.exports = router;
