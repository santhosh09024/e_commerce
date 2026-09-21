import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Image, ExternalLink } from 'lucide-react';
import api from '../../services/api';

const AdminBannersPage = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [image, setImage] = useState('');
  const [buttonText, setButtonText] = useState('Shop Now');
  const [link, setLink] = useState('/shop');
  const [type, setType] = useState('home_hero');

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await api.get('/banners/admin');
      if (res.data.success) {
        setBanners(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/banners', { title, subtitle, image, buttonText, link, type });
      setIsModalOpen(false);
      setTitle('');
      setSubtitle('');
      setImage('');
      fetchBanners();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating banner');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this banner?')) return;
    try {
      await api.delete(`/banners/${id}`);
      fetchBanners();
    } catch (err) {
      alert('Error deleting banner');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">
            Marketing Banners
          </h1>
          <p className="text-xs text-slate-500 mt-1">Manage homepage hero slides, flash sale banners and promotions</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-md"
        >
          <Plus className="w-4 h-4" /> Create Banner
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {banners.map((b) => (
          <div
            key={b._id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between"
          >
            <div className="relative aspect-[16/7] bg-slate-900">
              <img src={b.image} alt="" className="w-full h-full object-cover brightness-75" />
              <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-300">{b.type.replace('_', ' ')}</span>
                <h3 className="text-lg font-bold font-['Outfit']">{b.title}</h3>
                <p className="text-xs text-slate-300 line-clamp-1 mt-0.5">{b.subtitle}</p>
              </div>
            </div>

            <div className="p-4 flex justify-between items-center text-xs">
              <div className="flex items-center gap-2 text-slate-500 font-mono">
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Link: {b.link}</span>
              </div>
              <button
                onClick={() => handleDelete(b._id)}
                className="text-rose-500 hover:underline font-bold"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
              <h4 className="font-bold text-base font-['Outfit']">New Campaign Banner</h4>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400">✕</button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold mb-1">Headline Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Elevate Your Digital Life"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Subtitle / Promo Copy</label>
                <input
                  type="text"
                  placeholder="e.g. Up to 30% discount on flagship gadgets"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">High-Res Image URL</label>
                <input
                  type="text"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-1">Button Label</label>
                  <input
                    type="text"
                    value={buttonText}
                    onChange={(e) => setButtonText(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Target Link</label>
                  <input
                    type="text"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={() => setIsModalOpen(false)} className="border px-4 py-2 rounded-xl font-bold">Cancel</button>
                <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold">Launch Banner</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBannersPage;
