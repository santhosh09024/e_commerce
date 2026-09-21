const express = require('express');
const router = express.Router();
const {
  getProductReviews,
  createReview,
  markHelpful,
  getAdminReviews,
  moderateReview,
  deleteReview,
} = require('../controllers/reviewController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/admin/all', protect, admin, getAdminReviews);
router.put('/admin/:id/approve', protect, admin, moderateReview);
router.delete('/admin/:id', protect, admin, deleteReview);

router.get('/:productId', getProductReviews);
router.post('/', protect, createReview);
router.put('/:id/helpful', protect, markHelpful);

module.exports = router;
