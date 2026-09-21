import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletter = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-24 sm:pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-primary-500 flex items-center justify-center text-white font-black text-xl shadow-md">
                S
              </div>
              <span className="font-extrabold text-2xl text-white font-['Outfit']">
                Shop<span className="text-indigo-400">Ease</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Discover curated luxury electronics, runway fashion, and Scandinavian home interiors. Built for modern shoppers demanding quality, authenticity, and lightning-fast delivery.
            </p>
            <div className="space-y-2 text-sm text-slate-400 pt-2">
              <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-indigo-400" /> 42 Cyber City, DLF Phase 2, Gurugram, India</p>
              <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-indigo-400" /> +91 98765 43210 (Mon-Sat 9AM-8PM)</p>
              <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-indigo-400" /> support@shopease.com</p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3 text-sm">
            <h4 className="text-white font-semibold text-base font-['Outfit']">Shop Categories</h4>
            <ul className="space-y-2">
              <li><Link to="/category/electronics" className="hover:text-white transition-colors">Smartphones & Tech</Link></li>
              <li><Link to="/category/laptops" className="hover:text-white transition-colors">Laptops & Workstations</Link></li>
              <li><Link to="/category/audio-headphones" className="hover:text-white transition-colors">Headphones & Audio</Link></li>
              <li><Link to="/category/fashion" className="hover:text-white transition-colors">Men's & Women's Fashion</Link></li>
              <li><Link to="/category/home-living" className="hover:text-white transition-colors">Home & Living</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-3 text-sm">
            <h4 className="text-white font-semibold text-base font-['Outfit']">Customer Care</h4>
            <ul className="space-y-2">
              <li><Link to="/track" className="hover:text-white transition-colors">Track Order Status</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Support</Link></li>
              <li><Link to="/faq" className="hover:text-white transition-colors">Frequently Asked Questions</Link></li>
              <li><Link to="/return-policy" className="hover:text-white transition-colors">7-Day Return Policy</Link></li>
              <li><Link to="/shipping-policy" className="hover:text-white transition-colors">Shipping & Delivery</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold text-base font-['Outfit']">Stay in the Loop</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Subscribe to get special discount codes, secret flash sales, and early product release alerts.
            </p>

            {subscribed ? (
              <div className="flex items-center gap-2 text-emerald-400 bg-emerald-950/40 border border-emerald-800 p-3 rounded-xl text-xs">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>You're subscribed! Check your inbox for coupon.</span>
              </div>
            ) : (
              <form onSubmit={handleNewsletter} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white px-3 py-2.5 rounded-xl text-xs focus:outline-none focus:border-indigo-500 pr-10"
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-indigo-600 hover:bg-indigo-700 text-white p-1.5 rounded-lg transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[10px] text-slate-500">We respect your privacy. No spam ever.</p>
              </form>
            )}

            <div className="pt-2">
              <span className="text-xs text-slate-400 font-medium block mb-2">Supported Payment Gateways</span>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold bg-slate-800 border border-slate-700 px-2 py-1 rounded text-slate-200">Razorpay</span>
                <span className="text-[10px] font-bold bg-slate-800 border border-slate-700 px-2 py-1 rounded text-slate-200">UPI / QR</span>
                <span className="text-[10px] font-bold bg-slate-800 border border-slate-700 px-2 py-1 rounded text-slate-200">Cards</span>
                <span className="text-[10px] font-bold bg-slate-800 border border-slate-700 px-2 py-1 rounded text-slate-200">COD</span>
              </div>
            </div>

          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>© 2026 ShopEase E-Commerce Inc. All Rights Reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="hover:text-slate-400">Privacy</Link>
            <Link to="/terms" className="hover:text-slate-400">Terms</Link>
            <Link to="/shipping-policy" className="hover:text-slate-400">Shipping</Link>
            <Link to="/return-policy" className="hover:text-slate-400">Returns</Link>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
