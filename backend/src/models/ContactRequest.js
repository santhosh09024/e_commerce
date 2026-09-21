const mongoose = require('mongoose');

const contactRequestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, default: '' },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  status: {
    type: String,
    enum: ['unread', 'read', 'replied', 'closed'],
    default: 'unread'
  },
  replyNotes: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('ContactRequest', contactRequestSchema);
