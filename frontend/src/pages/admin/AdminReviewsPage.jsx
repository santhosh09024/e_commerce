import React, { useState, useEffect } from 'react';
import { Star, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import api from '../../services/api';

const AdminReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await api.get('/reviews/admin/all');
      if (res.data.success) {
        setReviews(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const toggleApproval = async (id) => {
    try {
      const res = await api.put(`/reviews/admin/${id}/approve`);
      if (res.data.success) {
        setReviews(prev => prev.map(r => r._id === id ? { ...r, isApproved: res.data.data.isApproved } : r));
      }
    } catch (err) {
      alert('Error updating approval status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this customer review?')) return;
    try {
      await api.delete(`/reviews/${id}`);
      fetchReviews();
    } catch (err) {
      alert('Error deleting review');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">
          Review Moderation
        </h1>
        <p className="text-xs text-slate-500 mt-1">Approve, moderate or remove verified buyer ratings and feedback</p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase font-bold text-[10px] text-slate-400">
              <tr>
                <th className="p-4">Product</th>
                <th className="p-4">User</th>
                <th className="p-4">Rating</th>
                <th className="p-4">Feedback</th>
                <th className="p-4">Approval</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {loading ? (
                <tr><td colSpan="6" className="p-8 text-center text-slate-400">Loading reviews...</td></tr>
              ) : reviews.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-slate-400">No reviews to moderate.</td></tr>
              ) : (
                reviews.map((rev) => (
                  <tr key={rev._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="p-4 font-bold text-slate-900 dark:text-white max-w-xs truncate">
                      {rev.product?.name}
                    </td>
                    <td className="p-4">
                      <p className="font-bold">{rev.user?.name}</p>
                      <span className="text-[10px] text-slate-400">{rev.user?.email}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex text-amber-400">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                        ))}
                      </div>
                    </td>
                    <td className="p-4 max-w-xs">
                      <strong className="block text-slate-800 dark:text-slate-200 font-semibold">{rev.title}</strong>
                      <p className="text-[11px] text-slate-500 line-clamp-2">{rev.comment}</p>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        rev.isApproved ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                      }`}>
                        {rev.isApproved ? 'Approved' : 'Hidden'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => toggleApproval(rev._id)}
                          className="text-xs font-bold text-indigo-600 hover:underline"
                        >
                          {rev.isApproved ? 'Hide' : 'Approve'}
                        </button>
                        <button
                          onClick={() => handleDelete(rev._id)}
                          className="p-1 text-slate-400 hover:text-rose-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminReviewsPage;
