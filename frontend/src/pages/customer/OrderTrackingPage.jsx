import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Package, CheckCircle2, Clock, Truck, MapPin, AlertCircle } from 'lucide-react';
import api from '../../services/api';

const OrderTrackingPage = () => {
  const [searchParams] = useSearchParams();
  const [orderNumberInput, setOrderNumberInput] = useState(searchParams.get('order') || '');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const timelineSteps = [
    'Order Placed',
    'Confirmed',
    'Processing',
    'Packed',
    'Shipped',
    'Out for delivery',
    'Delivered',
  ];

  const fetchTracking = async (numberToTrack) => {
    if (!numberToTrack) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/orders/track/${encodeURIComponent(numberToTrack)}`);
      if (res.data.success) {
        setOrder(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Order reference not found. Please check your order ID.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchParams.get('order')) {
      fetchTracking(searchParams.get('order'));
    }
  }, [searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (orderNumberInput.trim()) {
      fetchTracking(orderNumberInput.trim());
    }
  };

  // Helper to determine step progression
  const getStepIndex = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('placed')) return 0;
    if (s.includes('confirm')) return 1;
    if (s.includes('process')) return 2;
    if (s.includes('pack')) return 3;
    if (s.includes('ship')) return 4;
    if (s.includes('out for delivery')) return 5;
    if (s.includes('deliver')) return 6;
    return 1;
  };

  const currentStepIdx = getStepIndex(order?.orderStatus);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Live Logistics Tracker</span>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white font-['Outfit']">
          Track Your Shipment
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          Enter your unique order number (e.g. ORD-2026-XXXX) to monitor dispatch, transit, and delivery updates in real-time.
        </p>
      </div>

      {/* Search Input Box */}
      <form onSubmit={handleSearch} className="max-w-xl mx-auto flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            required
            placeholder="Enter Order Number (e.g. ORD-2026-1234)"
            value={orderNumberInput}
            onChange={(e) => setOrderNumberInput(e.target.value.toUpperCase())}
            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 pl-11 pr-4 py-3 rounded-2xl text-xs sm:text-sm uppercase font-mono focus:outline-none focus:border-indigo-500 shadow-sm"
          />
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-2xl transition-all shadow-md disabled:opacity-50"
        >
          {loading ? 'Searching...' : 'Track'}
        </button>
      </form>

      {error && (
        <div className="max-w-xl mx-auto p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-600 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tracking Result Card */}
      {order && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl space-y-8 animate-in fade-in duration-300">
          
          {/* Order Meta Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-[11px] font-mono text-slate-400">ORDER NUMBER</span>
              <h3 className="text-xl font-black text-slate-900 dark:text-white font-['Outfit']">{order.orderNumber}</h3>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                Status: {order.orderStatus}
              </span>
            </div>
          </div>

          {/* Logistics Details Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Courier Partner</span>
              <strong className="text-slate-800 dark:text-slate-100">{order.courier || 'BlueDart Express / Delhivery'}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Tracking AWB</span>
              <strong className="text-slate-800 dark:text-slate-100 font-mono">{order.trackingNumber || 'TRK-98124982'}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Estimated Delivery</span>
              <strong className="text-emerald-600 dark:text-emerald-400">
                {order.estimatedDeliveryDate
                  ? new Date(order.estimatedDeliveryDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })
                  : 'Within 3 Business Days'}
              </strong>
            </div>
          </div>

          {/* Visual Step-by-Step Progress Bar */}
          <div className="pt-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6">Shipment Journey</h4>
            
            <div className="relative">
              <div className="hidden sm:flex justify-between items-center relative z-10">
                {timelineSteps.map((s, idx) => {
                  const isDone = idx <= currentStepIdx;
                  return (
                    <div key={s} className="flex flex-col items-center gap-2 flex-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                        isDone
                          ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 dark:ring-indigo-950/60'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                      }`}>
                        {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                      </div>
                      <span className={`text-[11px] font-semibold text-center ${
                        isDone ? 'text-slate-900 dark:text-white' : 'text-slate-400'
                      }`}>
                        {s}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Connecting background progress line (desktop) */}
              <div className="hidden sm:block absolute top-4 left-10 right-10 h-0.5 bg-slate-200 dark:bg-slate-700 -z-0">
                <div
                  className="h-full bg-indigo-600 transition-all duration-700"
                  style={{ width: `${(currentStepIdx / (timelineSteps.length - 1)) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Detailed Event Log Timeline */}
          {order.timeline && order.timeline.length > 0 && (
            <div className="pt-4 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Activity Log</h4>
              <div className="border-l-2 border-indigo-500 pl-4 space-y-4 text-xs">
                {order.timeline.map((event, i) => (
                  <div key={i} className="relative">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 absolute -left-[21px] top-1" />
                    <p className="font-bold text-slate-900 dark:text-white">{event.status}</p>
                    {event.note && <p className="text-slate-500 mt-0.5">{event.note}</p>}
                    <span className="text-[10px] text-slate-400">
                      {new Date(event.updatedAt).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Destination Address */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 flex items-start gap-2">
            <MapPin className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
            <span>Delivering to: {order.shippingAddress?.address}, {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}</span>
          </div>

        </div>
      )}

    </div>
  );
};

export default OrderTrackingPage;
