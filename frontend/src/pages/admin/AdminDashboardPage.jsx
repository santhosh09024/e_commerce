import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  IndianRupee,
  ShoppingBag,
  Users,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import api from '../../services/api';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const [dashRes, analRes] = await Promise.all([
          api.get('/admin/dashboard'),
          api.get('/admin/analytics'),
        ]);

        if (dashRes.data.success) setStats(dashRes.data.data);
        if (analRes.data.success) setAnalytics(analRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Gross Revenue',
      value: `₹${(stats?.totalSales || 0).toLocaleString('en-IN')}`,
      subtext: `Avg Order Value: ₹${(stats?.averageOrderValue || 0).toLocaleString('en-IN')}`,
      icon: IndianRupee,
      color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-100 dark:border-indigo-900',
    },
    {
      title: 'Total Orders',
      value: stats?.totalOrders || 0,
      subtext: `${stats?.pendingOrders || 0} pending fulfillment`,
      icon: ShoppingBag,
      color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-100 dark:border-emerald-900',
    },
    {
      title: 'Total Customers',
      value: stats?.totalCustomers || 0,
      subtext: 'Registered store shoppers',
      icon: Users,
      color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/60 border-amber-100 dark:border-amber-900',
    },
    {
      title: 'Low Stock Alerts',
      value: stats?.lowStockCount || 0,
      subtext: 'Products need replenishment',
      icon: AlertTriangle,
      color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/60 border-rose-100 dark:border-rose-900',
    },
  ];

  return (
    <div className="space-y-8">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">
          Executive Dashboard
        </h1>
        <p className="text-xs text-slate-500 mt-1">Real-time revenue, orders fulfillment, and inventory analytics</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{card.title}</span>
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${card.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div>
                <span className="text-2xl font-black text-slate-900 dark:text-white font-['Outfit']">
                  {card.value}
                </span>
                <p className="text-[11px] text-slate-400 mt-1">{card.subtext}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Revenue SVG Chart & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Monthly Revenue Bar Chart (Custom Clean SVG) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white font-['Outfit'] flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                <span>Monthly Sales Revenue (2026)</span>
              </h3>
              <p className="text-[11px] text-slate-400">Total gross sales across all months</p>
            </div>
            <Link to="/admin/analytics" className="text-xs font-bold text-indigo-600 hover:underline">
              Detailed Analytics →
            </Link>
          </div>

          {/* Bar Visualization */}
          <div className="h-64 flex items-end justify-between gap-2 pt-8 px-2 border-b border-slate-100 dark:border-slate-800 pb-2">
            {analytics?.monthlySales?.map((m, idx) => {
              // Scale height relative to max revenue
              const maxRev = Math.max(...(analytics.monthlySales.map(item => item.revenue)), 50000);
              const heightPercent = Math.max(8, (m.revenue / maxRev) * 100);

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] py-1 px-2 rounded absolute -translate-y-8 pointer-events-none whitespace-nowrap shadow-lg">
                    ₹{m.revenue.toLocaleString('en-IN')}
                  </div>

                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full max-w-[32px] rounded-t-lg bg-gradient-to-t from-indigo-600 to-primary-500 group-hover:from-indigo-700 group-hover:to-primary-600 transition-all"
                  />
                  <span className="text-[10px] text-slate-400 font-medium">{m.name}</span>
                </div>
              );
            })}
          </div>

          {/* Quick status counters */}
          <div className="grid grid-cols-3 gap-4 pt-2 text-center text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
              <span className="text-slate-400 block text-[10px] font-bold uppercase">Pending</span>
              <strong className="text-amber-500 text-base">{stats?.pendingOrders || 0}</strong>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
              <span className="text-slate-400 block text-[10px] font-bold uppercase">Delivered</span>
              <strong className="text-emerald-500 text-base">{stats?.deliveredOrders || 0}</strong>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
              <span className="text-slate-400 block text-[10px] font-bold uppercase">Cancelled</span>
              <strong className="text-rose-500 text-base">{stats?.cancelledOrders || 0}</strong>
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white font-['Outfit'] pb-2 border-b border-slate-100 dark:border-slate-800">
            Top Performing Items
          </h3>

          <div className="space-y-3 divide-y divide-slate-100 dark:divide-slate-800">
            {analytics?.topProducts && analytics.topProducts.length > 0 ? (
              analytics.topProducts.map((p, i) => (
                <div key={i} className="pt-3 first:pt-0 flex justify-between items-center text-xs">
                  <div className="min-w-0 pr-2">
                    <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{p.name}</p>
                    <span className="text-[10px] text-slate-400">{p.totalSold} units sold</span>
                  </div>
                  <strong className="text-indigo-600 dark:text-indigo-400 font-mono">
                    ₹{p.totalRevenue.toLocaleString('en-IN')}
                  </strong>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-6">No sales recorded yet.</p>
            )}
          </div>
        </div>

      </div>

      {/* Recent Orders Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-base text-slate-900 dark:text-white font-['Outfit']">
            Recent Orders
          </h3>
          <Link to="/admin/orders" className="text-xs font-bold text-indigo-600 hover:underline">
            View All Orders →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase font-bold text-[10px] text-slate-400">
              <tr>
                <th className="p-3">Order ID</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Payment</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {stats?.recentOrders?.map((o) => (
                <tr key={o._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                  <td className="p-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">{o.orderNumber}</td>
                  <td className="p-3">{o.user?.name || o.shippingAddress?.fullName}</td>
                  <td className="p-3 uppercase font-bold text-[11px]">{o.paymentMethod}</td>
                  <td className="p-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                      {o.orderStatus}
                    </span>
                  </td>
                  <td className="p-3 text-right font-bold text-slate-900 dark:text-white">
                    ₹{o.totalAmount.toLocaleString('en-IN')}
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

export default AdminDashboardPage;
