import React, { useState, useEffect } from 'react';
import { RotateCcw, Check, X, Eye } from 'lucide-react';
import api from '../../services/api';

const AdminReturnsPage = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);

  // Process Modal
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [approvalStatus, setApprovalStatus] = useState('Approved');
  const [refundStatus, setRefundStatus] = useState('Completed');
  const [adminNotes, setAdminNotes] = useState('');

  const fetchReturns = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/returns');
      if (res.data.success) {
        setReturns(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, []);

  const handleProcess = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/admin/returns/${selectedReturn._id}`, {
        approvalStatus,
        refundStatus,
        adminNotes,
      });
      setSelectedReturn(null);
      fetchReturns();
    } catch (err) {
      alert(err.response?.data?.message || 'Error processing return');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">
          Returns & Refund Claims
        </h1>
        <p className="text-xs text-slate-500 mt-1">Review customer dispute claims, process inventory restoration and refund payments</p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase font-bold text-[10px] text-slate-400">
              <tr>
                <th className="p-4">Order Ref</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Reason & Description</th>
                <th className="p-4">Approval</th>
                <th className="p-4">Refund Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {loading ? (
                <tr><td colSpan="6" className="p-8 text-center text-slate-400">Loading return claims...</td></tr>
              ) : returns.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-slate-400">No return requests active.</td></tr>
              ) : (
                returns.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="p-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">{r.order?.orderNumber}</td>
                    <td className="p-4">
                      <p className="font-bold text-slate-900 dark:text-white">{r.user?.name}</p>
                      <span className="text-[10px] text-slate-400">{r.user?.email}</span>
                    </td>
                    <td className="p-4 max-w-xs">
                      <strong className="text-slate-800 dark:text-slate-200 block font-semibold">{r.reason}</strong>
                      <span className="text-[11px] text-slate-500 line-clamp-1">{r.description}</span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        r.approvalStatus === 'Approved'
                          ? 'bg-emerald-50 text-emerald-600'
                          : r.approvalStatus === 'Rejected'
                          ? 'bg-rose-50 text-rose-600'
                          : 'bg-amber-50 text-amber-600'
                      }`}>
                        {r.approvalStatus}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="uppercase font-bold text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                        {r.refundStatus}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedReturn(r);
                          setApprovalStatus(r.approvalStatus);
                          setRefundStatus(r.refundStatus);
                          setAdminNotes(r.adminNotes || '');
                        }}
                        className="bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-600 hover:text-white text-indigo-600 font-bold text-xs px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Process Claim
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Process Modal */}
      {selectedReturn && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl space-y-4">
            <h4 className="font-bold text-base font-['Outfit']">
              Process Return: #{selectedReturn.order?.orderNumber}
            </h4>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-xs space-y-1">
              <p><strong>Reason:</strong> {selectedReturn.reason}</p>
              <p><strong>Note:</strong> {selectedReturn.description}</p>
            </div>

            <form onSubmit={handleProcess} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold mb-1">Approval Decision</label>
                <select
                  value={approvalStatus}
                  onChange={(e) => setApprovalStatus(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl font-bold"
                >
                  <option value="Pending">Pending Review</option>
                  <option value="Approved">Approve Return & Restock</option>
                  <option value="Rejected">Reject Claim</option>
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1">Refund Status</label>
                <select
                  value={refundStatus}
                  onChange={(e) => setRefundStatus(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl font-bold"
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Completed">Refund Completed</option>
                  <option value="Rejected">Refund Rejected</option>
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1">Audit Notes</label>
                <textarea
                  rows={2}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={() => setSelectedReturn(null)} className="border px-4 py-2 rounded-xl font-bold">Cancel</button>
                <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold">Submit Decision</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReturnsPage;
