const Brand = require('../models/Brand');
const Product = require('../models/Product');
const slugify = require('slugify');

// @desc    Get all brands
// @route   GET /api/brands
// @access  Public
const getBrands = async (req, res, next) => {
  try {
    const brands = await Brand.find({ isActive: true }).sort({ name: 1 });
    res.json({ success: true, data: brands });
  } catch (error) {
    next(error);
  }
};

// @desc    Get brand by slug with its products
// @route   GET /api/brands/:slug
// @access  Public
const getBrandBySlug = async (req, res, next) => {
  try {
    const brand = await Brand.findOne({ slug: req.params.slug });
    if (!brand) {
      return res.status(404).json({ success: false, message: 'Brand not found' });
    }

    const products = await Product.find({ brand: brand._id, status: 'published' })
      .populate('category', 'name slug');

    res.json({ success: true, data: brand, products });
  } catch (error) {
    next(error);
  }
};

// @desc    Create brand
// @route   POST /api/brands
// @access  Private/Admin
const createBrand = async (req, res, next) => {
  try {
    const { name, logo, description, website, isActive } = req.body;
    const slug = slugify(name, { lower: true, strict: true });

    const exists = await Brand.findOne({ slug });
    if (exists) {
      return res.status(400).json({ success: false, message: 'A brand with this name already exists' });
    }

    const brand = await Brand.create({
      name,
      slug,
      logo,
      description,
      website,
      isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json({ success: true, data: brand });
  } catch (error) {
    next(error);
  }
};

// @desc    Update brand
// @route   PUT /api/brands/:id
// @access  Private/Admin
const updateBrand = async (req, res, next) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) {
      return res.status(404).json({ success: false, message: 'Brand not found' });
    }

    if (req.body.name && req.body.name !== brand.name) {
      req.body.slug = slugify(req.body.name, { lower: true, strict: true });
    }

    const updated = await Brand.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete brand
// @route   DELETE /api/brands/:id
// @access  Private/Admin
const deleteBrand = async (req, res, next) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) {
      return res.status(404).json({ success: false, message: 'Brand not found' });
    }

    await brand.deleteOne();
    res.json({ success: true, message: 'Brand removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBrands,
  getBrandBySlug,
  createBrand,
  updateBrand,
  deleteBrand,
};
