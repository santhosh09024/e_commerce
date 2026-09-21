import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, IndianRupee, ShoppingBag, MapPin, CreditCard } from 'lucide-react';
import api from '../../services/api';

const AdminAnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/analytics');
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">
          Business Intelligence & Analytics
        </h1>
        <p className="text-xs text-slate-500 mt-1">Cross-sectional reporting on revenues, geographic distribution, and payment mechanisms</p>
      </div>

      {/* Grid of breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Sales by Payment Method */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 font-bold text-base font-['Outfit'] pb-2 border-b border-slate-100 dark:border-slate-800">
            <CreditCard className="w-4 h-4 text-indigo-600" />
            <span>Revenue by Payment Method</span>
          </div>

          <div className="space-y-3">
            {data?.paymentMethodStats?.map((pm, i) => (
              <div key={i} className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold uppercase text-slate-800 dark:text-slate-100">{pm._id}</span>
                  <p className="text-[10px] text-slate-400">{pm.count} total transactions</p>
                </div>
                <strong className="text-base text-indigo-600 dark:text-indigo-400 font-extrabold">
                  ₹{pm.revenue.toLocaleString('en-IN')}
                </strong>
              </div>
            ))}
          </div>
        </div>

        {/* Sales by Geographic Location */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 font-bold text-base font-['Outfit'] pb-2 border-b border-slate-100 dark:border-slate-800">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span>Top States by Order Volume</span>
          </div>

          <div className="space-y-3">
            {data?.salesByLocation && data.salesByLocation.length > 0 ? (
              data.salesByLocation.map((loc, i) => (
                <div key={i} className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-100">{loc._id || 'Karnataka'}</span>
                    <p className="text-[10px] text-slate-400">{loc.orders} orders delivered</p>
                  </div>
                  <strong className="text-sm text-emerald-600 dark:text-emerald-400 font-extrabold">
                    ₹{loc.revenue.toLocaleString('en-IN')}
                  </strong>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">Orders will aggregate by state here.</p>
            )}
          </div>
        </div>

      </div>

      {/* Monthly Breakdown Data Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-base font-['Outfit'] pb-2 border-b border-slate-100 dark:border-slate-800">
          Financial Ledger Summary (Monthly)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase font-bold text-[10px] text-slate-400">
              <tr>
                <th className="p-3">Month</th>
                <th className="p-3">Orders Completed</th>
                <th className="p-3 text-right">Revenue (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {data?.monthlySales?.map((m, i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                  <td className="p-3 font-bold text-slate-900 dark:text-white">{m.name} 2026</td>
                  <td className="p-3">{m.orders} orders</td>
                  <td className="p-3 text-right font-bold text-indigo-600 dark:text-indigo-400">
                    ₹{m.revenue.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default AdminAnalyticsPage;
