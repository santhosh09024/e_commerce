const Banner = require('../models/Banner');

// @desc    Get active banners
// @route   GET /api/banners
// @access  Public
const getBanners = async (req, res, next) => {
  try {
    const { type } = req.query;
    const query = { isActive: true };
    if (type) query.type = type;

    const banners = await Banner.find(query).sort({ order: 1, createdAt: -1 });
    res.json({ success: true, count: banners.length, data: banners });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: get all banners
// @route   GET /api/banners/admin
// @access  Private/Admin
const getAllBanners = async (req, res, next) => {
  try {
    const banners = await Banner.find().sort({ order: 1, createdAt: -1 });
    res.json({ success: true, count: banners.length, data: banners });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: create banner
// @route   POST /api/banners
// @access  Private/Admin
const createBanner = async (req, res, next) => {
  try {
    const banner = await Banner.create(req.body);
    res.status(201).json({ success: true, data: banner });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: update banner
// @route   PUT /api/banners/:id
// @access  Private/Admin
const updateBanner = async (req, res, next) => {
  try {
    const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!banner) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }
    res.json({ success: true, data: banner });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: delete banner
// @route   DELETE /api/banners/:id
// @access  Private/Admin
const deleteBanner = async (req, res, next) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }
    await banner.deleteOne();
    res.json({ success: true, message: 'Banner deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBanners,
  getAllBanners,
  createBanner,
  updateBanner,
  deleteBanner,
};
