import React, { useState, useEffect } from 'react';
import { Search, Shield, Ban, CheckCircle, Users } from 'lucide-react';
import api from '../../services/api';

const AdminCustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/customers?search=${encodeURIComponent(search)}`);
      if (res.data.success) {
        setCustomers(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  const toggleBlock = async (id) => {
    try {
      const res = await api.put(`/admin/customers/${id}/block`);
      if (res.data.success) {
        setCustomers(prev => prev.map(c => c._id === id ? { ...c, isBlocked: res.data.isBlocked } : c));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating block status');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">
          Customer Management
        </h1>
        <p className="text-xs text-slate-500 mt-1">View shoppers, block/unblock accounts, and audit permissions</p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 max-w-md shadow-sm">
        <div className="relative">
          <input
            type="text"
            placeholder="Search customer by name, email or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pl-10 pr-4 py-2 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase font-bold text-[10px] text-slate-400">
              <tr>
                <th className="p-4">Customer</th>
                <th className="p-4">Contact Phone</th>
                <th className="p-4">Account Role</th>
                <th className="p-4">Status</th>
                <th className="p-4">Joined Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {loading ? (
                <tr><td colSpan="6" className="p-8 text-center text-slate-400">Loading customers...</td></tr>
              ) : customers.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-slate-400">No customers found.</td></tr>
              ) : (
                customers.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="p-4 flex items-center gap-3">
                      <img src={c.profileImage} alt="" className="w-8 h-8 rounded-full object-cover" />
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{c.name}</p>
                        <span className="text-[10px] text-slate-400">{c.email}</span>
                      </div>
                    </td>
                    <td className="p-4">{c.phone || '—'}</td>
                    <td className="p-4">
                      <span className="uppercase font-bold text-[10px] bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 px-2 py-0.5 rounded">
                        {c.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        c.isBlocked ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                      }`}>
                        {c.isBlocked ? 'Suspended' : 'Active'}
                      </span>
                    </td>
                    <td className="p-4">
                      {new Date(c.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="p-4 text-right">
                      {c.role !== 'super_admin' && (
                        <button
                          onClick={() => toggleBlock(c._id)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                            c.isBlocked
                              ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                              : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                          }`}
                        >
                          {c.isBlocked ? 'Reactivate' : 'Suspend'}
                        </button>
                      )}
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

export default AdminCustomersPage;
