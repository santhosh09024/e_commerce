const FAQ = require('../models/FAQ');

// @desc    Get all active FAQs or search
// @route   GET /api/faqs
// @access  Public
const getFAQs = async (req, res, next) => {
  try {
    const { search, category } = req.query;
    const query = { isActive: true };

    if (category) query.category = category;
    if (search) {
      query.$or = [
        { question: { $regex: search, $options: 'i' } },
        { answer: { $regex: search, $options: 'i' } },
      ];
    }

    const faqs = await FAQ.find(query).sort({ order: 1, createdAt: 1 });
    res.json({ success: true, count: faqs.length, data: faqs });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: get all FAQs (including inactive)
// @route   GET /api/faqs/admin
// @access  Private/Admin
const getAllFAQsAdmin = async (req, res, next) => {
  try {
    const faqs = await FAQ.find().sort({ order: 1, createdAt: 1 });
    res.json({ success: true, count: faqs.length, data: faqs });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: create FAQ
// @route   POST /api/faqs
// @access  Private/Admin
const createFAQ = async (req, res, next) => {
  try {
    const { question, answer, category, order, isActive } = req.body;
    const faq = await FAQ.create({
      question,
      answer,
      category: category || 'General',
      order: order || 0,
      isActive: isActive !== undefined ? isActive : true,
    });
    res.status(201).json({ success: true, data: faq });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: update FAQ
// @route   PUT /api/faqs/:id
// @access  Private/Admin
const updateFAQ = async (req, res, next) => {
  try {
    const faq = await FAQ.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!faq) {
      return res.status(404).json({ success: false, message: 'FAQ not found' });
    }
    res.json({ success: true, data: faq });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: delete FAQ
// @route   DELETE /api/faqs/:id
// @access  Private/Admin
const deleteFAQ = async (req, res, next) => {
  try {
    const faq = await FAQ.findById(req.params.id);
    if (!faq) {
      return res.status(404).json({ success: false, message: 'FAQ not found' });
    }
    await faq.deleteOne();
    res.json({ success: true, message: 'FAQ deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFAQs,
  getAllFAQsAdmin,
  createFAQ,
  updateFAQ,
  deleteFAQ,
};
