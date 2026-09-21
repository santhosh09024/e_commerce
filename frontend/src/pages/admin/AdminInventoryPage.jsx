import React, { useState, useEffect } from 'react';
import { Boxes, AlertTriangle, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';
import api from '../../services/api';

const AdminInventoryPage = () => {
  const [logs, setLogs] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Manual Adjust Modal
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [adjustment, setAdjustment] = useState('');
  const [notes, setNotes] = useState('');

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      const [logsRes, alertsRes] = await Promise.all([
        api.get('/inventory/logs?limit=40'),
        api.get('/inventory/alerts'),
      ]);

      if (logsRes.data.success) setLogs(logsRes.data.data);
      if (alertsRes.data.success) setLowStockProducts(alertsRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const handleAdjustStock = async (e) => {
    e.preventDefault();
    try {
      await api.post('/inventory/adjust', {
        productId: selectedProduct._id,
        adjustment: Number(adjustment),
        notes,
      });
      setSelectedProduct(null);
      setAdjustment('');
      setNotes('');
      fetchInventoryData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error adjusting stock');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">
          Inventory Intelligence & Audit History
        </h1>
        <p className="text-xs text-slate-500 mt-1">Real-time stock depletion alerts, fulfillment reduction logs and restock records</p>
      </div>

      {/* Low Stock Warning Section */}
      {lowStockProducts.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-sm">
            <AlertTriangle className="w-5 h-5 text-amber-600 animate-pulse" />
            <span>Low Stock Attention Required ({lowStockProducts.length} items)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {lowStockProducts.map((p) => (
              <div
                key={p._id}
                className="bg-white dark:bg-slate-900 border border-amber-200 dark:border-slate-800 p-4 rounded-2xl flex items-center justify-between shadow-sm"
              >
                <div>
                  <p className="font-bold text-xs text-slate-900 dark:text-white truncate max-w-[150px]">{p.name}</p>
                  <span className="text-[10px] text-slate-400 font-mono">SKU: {p.sku}</span>
                  <span className="block text-xs font-black text-rose-500 mt-1">
                    {p.stock <= 0 ? 'OUT OF STOCK' : `Only ${p.stock} left`}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedProduct(p)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl shadow-sm"
                >
                  Restock
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audit History Log Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm space-y-4 p-6">
        <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-base text-slate-900 dark:text-white font-['Outfit']">
            Real-Time Stock Audit History
          </h3>
          <button onClick={fetchInventoryData} className="text-xs text-indigo-600 font-bold flex items-center gap-1 hover:underline">
            <RefreshCw className="w-3 h-3" /> Refresh Logs
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase font-bold text-[10px] text-slate-400">
              <tr>
                <th className="p-3">Product Name</th>
                <th className="p-3">Action Event</th>
                <th className="p-3">Change</th>
                <th className="p-3">Previous Qty</th>
                <th className="p-3">New Balance</th>
                <th className="p-3">Auditor / User</th>
                <th className="p-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {loading ? (
                <tr><td colSpan="7" className="p-8 text-center text-slate-400">Loading audit history...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan="7" className="p-8 text-center text-slate-400">No stock logs registered yet.</td></tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="p-3 font-bold text-slate-900 dark:text-white truncate max-w-xs">
                      {log.product?.name || 'Catalog Item'}
                    </td>
                    <td className="p-3">
                      <span className="uppercase font-bold text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                        {log.action.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`font-bold flex items-center gap-1 ${
                        log.quantityChanged > 0 ? 'text-emerald-500' : 'text-rose-500'
                      }`}>
                        {log.quantityChanged > 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                        {log.quantityChanged > 0 ? `+${log.quantityChanged}` : log.quantityChanged}
                      </span>
                    </td>
                    <td className="p-3">{log.previousQuantity}</td>
                    <td className="p-3 font-bold text-slate-900 dark:text-white">{log.newQuantity}</td>
                    <td className="p-3">{log.user?.name || 'System Auto-Engine'}</td>
                    <td className="p-3 text-[11px] text-slate-400">
                      {new Date(log.createdAt).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Restock Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl space-y-4">
            <h4 className="font-bold text-base font-['Outfit'] text-slate-900 dark:text-white">
              Restock: {selectedProduct.name}
            </h4>
            <p className="text-xs text-slate-500">Current Stock: <strong>{selectedProduct.stock}</strong></p>

            <form onSubmit={handleAdjustStock} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold mb-1">Add / Deduct Units (+/-)</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 50"
                  value={adjustment}
                  onChange={(e) => setAdjustment(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Restock Reason</label>
                <input
                  type="text"
                  placeholder="e.g. Warehouse shipment arrived"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setSelectedProduct(null)} className="border px-4 py-2 rounded-xl font-bold">Cancel</button>
                <button type="submit" className="bg-indigo-600 text-white px-5 py-2 rounded-xl font-bold">Confirm Adjustment</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminInventoryPage;
