const ContactRequest = require('../models/ContactRequest');
const { validateEmail } = require('../utils/validators');

// @desc    Submit customer inquiry
// @route   POST /api/contact
// @access  Public
const submitContact = async (req, res, next) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: 'Please fill in all required fields' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    }

    const inquiry = await ContactRequest.create({
      name,
      email,
      phone: phone || '',
      subject,
      message,
    });

    res.status(201).json({
      success: true,
      message: 'Thank you! Your message has been received. Our team will contact you shortly.',
      data: inquiry,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: get all contact inquiries
// @route   GET /api/contact
// @access  Private/Admin
const getInquiries = async (req, res, next) => {
  try {
    const inquiries = await ContactRequest.find().sort({ createdAt: -1 });
    res.json({ success: true, count: inquiries.length, data: inquiries });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: update inquiry status or reply notes
// @route   PUT /api/contact/:id
// @access  Private/Admin
const updateInquiry = async (req, res, next) => {
  try {
    const inquiry = await ContactRequest.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!inquiry) {
      return res.status(404).json({ success: false, message: 'Inquiry not found' });
    }
    res.json({ success: true, data: inquiry });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitContact,
  getInquiries,
  updateInquiry,
};
