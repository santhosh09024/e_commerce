const { sendEmail } = require('../config/email');

const sendWelcomeEmail = async (user) => {
  const subject = `Welcome to ShopEase, ${user.name}!`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h1 style="color: #4f46e5; text-align: center;">Welcome to ShopEase!</h1>
      <p>Hi <strong>${user.name}</strong>,</p>
      <p>Thank you for joining ShopEase. Your account is now active and ready for an exceptional shopping experience.</p>
      <div style="background-color: #f8fafc; padding: 16px; border-radius: 6px; margin: 20px 0;">
        <p style="margin: 0;">Use coupon code <strong style="color: #4f46e5;">WELCOME10</strong> for <strong>10% OFF</strong> on your first order!</p>
      </div>
      <p>Happy Shopping,<br/>The ShopEase Team</p>
    </div>
  `;
  return await sendEmail({ to: user.email, subject, html });
};

const sendOrderConfirmationEmail = async (user, order) => {
  const subject = `Order Confirmed: #${order.orderNumber}`;
  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${item.name} (${item.variant?.size || ''} ${item.variant?.color || ''})</td>
      <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: right;">₹${item.price.toLocaleString('en-IN')}</td>
    </tr>
  `).join('');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #4f46e5;">Order Confirmation</h2>
      <p>Thank you for your order, <strong>${user.name}</strong>! We are currently preparing your shipment.</p>
      <p><strong>Order ID:</strong> ${order.orderNumber}<br/>
      <strong>Payment Method:</strong> ${order.paymentMethod.toUpperCase()}<br/>
      <strong>Payment Status:</strong> ${order.paymentStatus.toUpperCase()}</p>

      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <thead>
          <tr style="background-color: #f1f5f9; text-align: left;">
            <th style="padding: 8px;">Item</th>
            <th style="padding: 8px; text-align: center;">Qty</th>
            <th style="padding: 8px; text-align: right;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div style="margin-top: 20px; text-align: right;">
        <p>Subtotal: ₹${order.subtotal.toLocaleString('en-IN')}</p>
        <p>Discount: -₹${order.discount.toLocaleString('en-IN')}</p>
        <p>Tax: ₹${order.tax.toLocaleString('en-IN')}</p>
        <p>Shipping: ₹${order.shippingFee.toLocaleString('en-IN')}</p>
        <h3 style="color: #0f172a;">Total Amount: ₹${order.totalAmount.toLocaleString('en-IN')}</h3>
      </div>

      <p style="margin-top: 30px; font-size: 13px; color: #64748b;">Shipping to: ${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}</p>
    </div>
  `;
  return await sendEmail({ to: user.email, subject, html });
};

const sendOrderStatusEmail = async (user, order, statusNote) => {
  const subject = `Update on Order #${order.orderNumber}: ${order.orderStatus}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #4f46e5;">Order Status Update</h2>
      <p>Hi <strong>${user.name}</strong>,</p>
      <p>Your order <strong>#${order.orderNumber}</strong> has been updated to: <span style="font-size: 18px; font-weight: bold; color: #2563eb;">${order.orderStatus}</span></p>
      ${statusNote ? `<p><em>${statusNote}</em></p>` : ''}
      ${order.trackingNumber ? `<p><strong>Courier:</strong> ${order.courier || 'Express Logistics'}<br/><strong>Tracking Number:</strong> ${order.trackingNumber}</p>` : ''}
      <p>You can track the progress of your delivery on our website at any time.</p>
    </div>
  `;
  return await sendEmail({ to: user.email, subject, html });
};

const sendPasswordResetEmail = async (user, resetUrl) => {
  const subject = 'Password Reset Request - ShopEase';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #e11d48;">Reset Your Password</h2>
      <p>Hi ${user.name},</p>
      <p>We received a request to reset your password. Click the link below to set a new password:</p>
      <p style="margin: 24px 0;"><a href="${resetUrl}" style="background-color: #4f46e5; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Reset Password</a></p>
      <p style="font-size: 12px; color: #94a3b8;">If you did not request this, you can safely ignore this email.</p>
    </div>
  `;
  return await sendEmail({ to: user.email, subject, html });
};

module.exports = {
  sendWelcomeEmail,
  sendOrderConfirmationEmail,
  sendOrderStatusEmail,
  sendPasswordResetEmail
};
