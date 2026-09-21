const express = require('express');
const router = express.Router();
const {
  getBrands,
  getBrandBySlug,
  createBrand,
  updateBrand,
  deleteBrand,
} = require('../controllers/brandController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', getBrands);
router.get('/:slug', getBrandBySlug);

router.post('/', protect, admin, createBrand);
router.put('/:id', protect, admin, updateBrand);
router.delete('/:id', protect, admin, deleteBrand);

module.exports = router;
