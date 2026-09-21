import React, { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle2, Shield } from 'lucide-react';
import api from '../../services/api';

const AdminSettingsPage = () => {
  const [settings, setSettings] = useState({
    storeName: 'ShopEase',
    storeEmail: 'support@shopease.com',
    storePhone: '+91 98765 43210',
    freeShippingThreshold: 999,
    standardShippingFee: 99,
    taxPercentage: 18,
    codEnabled: true,
    maxCodAmount: 20000,
    restrictedCodPincodes: '110000, 999999',
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/settings');
        if (res.data.success) {
          const s = res.data.data;
          setSettings({
            ...s,
            restrictedCodPincodes: Array.isArray(s.restrictedCodPincodes)
              ? s.restrictedCodPincodes.join(', ')
              : '',
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const payload = {
        ...settings,
        freeShippingThreshold: Number(settings.freeShippingThreshold),
        standardShippingFee: Number(settings.standardShippingFee),
        taxPercentage: Number(settings.taxPercentage),
        maxCodAmount: Number(settings.maxCodAmount),
        restrictedCodPincodes: settings.restrictedCodPincodes
          .split(',')
          .map(p => p.trim())
          .filter(Boolean),
      };

      await api.put('/admin/settings', payload);
      setMessage('Store settings and payment policies updated successfully!');
    } catch (err) {
      alert('Error updating settings');
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-slate-400 text-xs">Loading store settings...</div>;
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">
          Store & Payment Configuration
        </h1>
        <p className="text-xs text-slate-500 mt-1">Configure Cash on Delivery ceilings, shipping thresholds and GST percentages</p>
      </div>

      {message && (
        <div className="p-3 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* COD Management (Section 15) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm">
          <h3 className="text-base font-bold font-['Outfit'] text-slate-900 dark:text-white">
            Cash on Delivery (COD) Rules
          </h3>

          <div className="space-y-3">
            <label className="flex items-center gap-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.codEnabled}
                onChange={(e) => setSettings({ ...settings, codEnabled: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded"
              />
              <span>Enable Cash on Delivery at Checkout</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Max Order Value for COD (₹)</label>
                <input
                  type="number"
                  value={settings.maxCodAmount}
                  onChange={(e) => setSettings({ ...settings, maxCodAmount: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Restricted COD Pincodes (Comma separated)</label>
                <input
                  type="text"
                  placeholder="110000, 560099"
                  value={settings.restrictedCodPincodes}
                  onChange={(e) => setSettings({ ...settings, restrictedCodPincodes: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Shipping & Tax Thresholds */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm">
          <h3 className="text-base font-bold font-['Outfit'] text-slate-900 dark:text-white">
            Shipping Fees & Taxation
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-500 mb-1">Free Delivery Min Order (₹)</label>
              <input
                type="number"
                value={settings.freeShippingThreshold}
                onChange={(e) => setSettings({ ...settings, freeShippingThreshold: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-500 mb-1">Standard Delivery Fee (₹)</label>
              <input
                type="number"
                value={settings.standardShippingFee}
                onChange={(e) => setSettings({ ...settings, standardShippingFee: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-500 mb-1">GST Tax Rate (%)</label>
              <input
                type="number"
                value={settings.taxPercentage}
                onChange={(e) => setSettings({ ...settings, taxPercentage: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl font-bold"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-8 py-3.5 rounded-2xl flex items-center gap-2 shadow-lg shadow-indigo-600/25 transition-transform hover:scale-[1.01]"
        >
          <Save className="w-4 h-4" />
          <span>Save Store Configuration</span>
        </button>

      </form>
    </div>
  );
};

export default AdminSettingsPage;
