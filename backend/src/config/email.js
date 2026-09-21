const nodemailer = require('nodemailer');

const createTransporter = () => {
  if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
      port: process.env.EMAIL_PORT || 2525,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  // Console fallback for testing & local development
  return {
    sendMail: async (options) => {
      console.log('📧 [EMAIL DISPATCHED VIA CONSOLE]:');
      console.log(`   To: ${options.to}`);
      console.log(`   Subject: ${options.subject}`);
      console.log(`   Preview: ${options.text || options.html?.substring(0, 150)}...`);
      return { messageId: `msg_${Date.now()}` };
    },
  };
};

const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"ShopEase" <noreply@shopease.com>',
      to,
      subject,
      text,
      html,
    });
    return info;
  } catch (error) {
    console.error('Email send failed:', error.message);
    return null;
  }
};

module.exports = { sendEmail };
