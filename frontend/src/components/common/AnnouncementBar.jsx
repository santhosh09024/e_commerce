import React from 'react';
import { Sparkles, Truck, ShieldCheck } from 'lucide-react';

const AnnouncementBar = () => {
  return (
    <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-primary-600 text-white text-xs font-medium py-2 px-4 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
          <span>FESTIVE SALE: Use coupon <strong className="text-amber-300 bg-white/20 px-1.5 py-0.5 rounded">WELCOME10</strong> for 10% OFF</span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-slate-200 text-[11px]">
          <span className="flex items-center gap-1"><Truck className="w-3 h-3 text-indigo-200" /> Free Express Shipping over ₹999</span>
          <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-indigo-200" /> 100% Genuine Products Guaranteed</span>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementBar;
