import React from 'react';

export const PrivacyPolicyPage = () => (
  <div className="max-w-4xl mx-auto px-4 py-12 space-y-6 text-sm text-slate-700 dark:text-slate-300">
    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">Privacy Policy</h1>
    <p className="text-xs text-slate-500">Effective Date: January 1, 2026</p>
    <p>ShopEase respects and protects your digital privacy. This policy explains how we collect, process, and safeguard your personal information when visiting our website or placing orders.</p>
    <h3 className="text-lg font-bold text-slate-900 dark:text-white">1. Information We Collect</h3>
    <p>We collect personal information such as your name, billing and shipping address, email address, phone number, and transaction details necessary to process and dispatch commercial orders.</p>
    <h3 className="text-lg font-bold text-slate-900 dark:text-white">2. Payment Security</h3>
    <p>We do NOT store your sensitive credit card numbers or banking PINs on our servers. All digital transactions are securely tokenized through Razorpay in accordance with PCI-DSS guidelines.</p>
    <h3 className="text-lg font-bold text-slate-900 dark:text-white">3. Cookies & Tracking</h3>
    <p>We utilize cookies to maintain your shopping cart state, keep you signed into your account, and remember your preferred display theme.</p>
  </div>
);

export const TermsPage = () => (
  <div className="max-w-4xl mx-auto px-4 py-12 space-y-6 text-sm text-slate-700 dark:text-slate-300">
    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">Terms and Conditions</h1>
    <p className="text-xs text-slate-500">Effective Date: January 1, 2026</p>
    <p>By browsing or purchasing from ShopEase, you agree to comply with and be bound by the following commercial terms and conditions of use.</p>
    <h3 className="text-lg font-bold text-slate-900 dark:text-white">1. Commercial Purchases</h3>
    <p>All orders placed are subject to inventory availability and payment acceptance. We reserve the right to decline or cancel orders with inaccurate pricing or suspected fraudulent activity.</p>
    <h3 className="text-lg font-bold text-slate-900 dark:text-white">2. Pricing & Taxes</h3>
    <p>All prices displayed in Indian Rupees (INR) are inclusive of applicable GST unless explicitly stated otherwise during the checkout breakdown.</p>
  </div>
);

export const ReturnPolicyPage = () => (
  <div className="max-w-4xl mx-auto px-4 py-12 space-y-6 text-sm text-slate-700 dark:text-slate-300">
    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">7-Day Hassle-Free Return Policy</h1>
    <p className="text-xs text-slate-500">Last Revised: January 2026</p>
    <p>We stand behind the quality of every product sold on ShopEase. If you receive a damaged, defective, or incorrect item, you are eligible for an immediate return or exchange within 7 days of delivery.</p>
    <h3 className="text-lg font-bold text-slate-900 dark:text-white">1. Eligibility Criteria</h3>
    <ul className="list-disc pl-5 space-y-2">
      <li>The item must be in its original condition with all tags, seals, warranty documentation, and packaging intact.</li>
      <li>Electronic items must be unregistered and devoid of personal user data.</li>
    </ul>
    <h3 className="text-lg font-bold text-slate-900 dark:text-white">2. Refund Processing</h3>
    <p>Once your returned item reaches our fulfillment center and passes inspection, your refund is credited within 3-5 business days back to your original payment method, or bank account for COD orders.</p>
  </div>
);

export const ShippingPolicyPage = () => (
  <div className="max-w-4xl mx-auto px-4 py-12 space-y-6 text-sm text-slate-700 dark:text-slate-300">
    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">Shipping & Delivery Policy</h1>
    <p className="text-xs text-slate-500">Last Revised: January 2026</p>
    <h3 className="text-lg font-bold text-slate-900 dark:text-white">1. Free Delivery Threshold</h3>
    <p>All domestic orders exceeding ₹999 qualify for Free Express Shipping. Orders under ₹999 incur a standard delivery charge of ₹99.</p>
    <h3 className="text-lg font-bold text-slate-900 dark:text-white">2. Delivery Timelines</h3>
    <ul className="list-disc pl-5 space-y-2">
      <li>Metro Cities (Delhi, Mumbai, Bengaluru, Chennai, Hyderabad): 2 to 3 business days.</li>
      <li>Rest of India: 3 to 5 business days.</li>
    </ul>
    <p>Every shipment is tracked via integrated SMS and email dispatch notices with direct live tracking links.</p>
  </div>
);
