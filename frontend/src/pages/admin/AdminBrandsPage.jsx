import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Tag } from 'lucide-react';
import api from '../../services/api';

const AdminBrandsPage = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [logo, setLogo] = useState('');
  const [description, setDescription] = useState('');

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const res = await api.get('/brands');
      if (res.data.success) {
        setBrands(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setName('');
    setLogo('https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=200&q=80');
    setDescription('');
    setIsModalOpen(true);
  };

  const openEditModal = (b) => {
    setEditingId(b._id);
    setName(b.name);
    setLogo(b.logo || '');
    setDescription(b.description || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/brands/${editingId}`, { name, logo, description });
      } else {
        await api.post('/brands', { name, logo, description });
      }
      setIsModalOpen(false);
      fetchBrands();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving brand');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this brand?')) return;
    try {
      await api.delete(`/brands/${id}`);
      fetchBrands();
    } catch (err) {
      alert('Error deleting brand');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">
            Brand Partners
          </h1>
          <p className="text-xs text-slate-500 mt-1">Manage partner logos, descriptions, and catalog assignments</p>
        </div>

        <button
          onClick={openCreateModal}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-md"
        >
          <Plus className="w-4 h-4" /> Add Brand
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {brands.map((b) => (
          <div
            key={b._id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <img src={b.logo} alt="" className="w-12 h-12 rounded-2xl object-cover ring-2 ring-slate-100" />
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">{b.name}</h3>
                  <span className="text-[10px] text-slate-400 font-mono">/brand/{b.slug}</span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button onClick={() => openEditModal(b)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleDelete(b._id)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">{b.description || 'No description provided'}</p>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
              <h4 className="font-bold text-base font-['Outfit']">{editingId ? 'Edit Brand' : 'Create Brand'}</h4>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold mb-1">Brand Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Logo Image URL</label>
                <input
                  type="text"
                  required
                  value={logo}
                  onChange={(e) => setLogo(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={() => setIsModalOpen(false)} className="border px-4 py-2 rounded-xl font-bold">Cancel</button>
                <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBrandsPage;
