import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Package,
  MapPin,
  Bell,
  Lock,
  LogOut,
  ChevronRight,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  RotateCcw,
  XCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const MyAccountPage = () => {
  const { user, updateProfile, addAddress, deleteAddress, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'profile' | 'addresses' | 'notifications'

  // Profile Form States
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profileMessage, setProfileMessage] = useState('');

  // Password Form States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');

  // Orders State
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Return Request Modal State
  const [selectedOrderForReturn, setSelectedOrderForReturn] = useState(null);
  const [returnReason, setReturnReason] = useState('Defective or not working');
  const [returnDescription, setReturnDescription] = useState('');
  const [returnStatusMsg, setReturnStatusMsg] = useState('');

  // Notifications State
  const [notifications, setNotifications] = useState([]);

  // New Address Form State
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressForm, setAddressForm] = useState({
    fullName: '',
    phone: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    country: 'India',
    pincode: '',
    isDefault: false,
  });

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setOrdersLoading(true);
        const res = await api.get('/orders');
        if (res.data.success) {
          setOrders(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setOrdersLoading(false);
      }
    };

    const fetchNotifs = async () => {
      try {
        const res = await api.get('/notifications');
        if (res.data.success) {
          setNotifications(res.data.data);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchOrders();
    fetchNotifs();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMessage('');
    try {
      await updateProfile({ name, phone });
      setProfileMessage('Profile updated successfully!');
    } catch (err) {
      setProfileMessage(err.response?.data?.message || 'Update failed');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMessage('');
    try {
      const res = await api.put('/auth/change-password', { currentPassword, newPassword });
      setPasswordMessage(res.data.message || 'Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setPasswordMessage(err.response?.data?.message || 'Password change failed');
    }
  };

  const handleCreateAddress = async (e) => {
    e.preventDefault();
    try {
      await addAddress(addressForm);
      setShowAddressModal(false);
      setAddressForm({
        fullName: '',
        phone: '',
        address: '',
        apartment: '',
        city: '',
        state: '',
        country: 'India',
        pincode: '',
        isDefault: false,
      });
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      const res = await api.put(`/orders/${orderId}/cancel`);
      if (res.data.success) {
        setOrders(prev => prev.map(o => o._id === orderId ? res.data.data : o));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel order');
    }
  };

  const handleSubmitReturn = async (e) => {
    e.preventDefault();
    setReturnStatusMsg('');
    try {
      const res = await api.post(`/orders/${selectedOrderForReturn._id}/return`, {
        reason: returnReason,
        description: returnDescription,
      });
      if (res.data.success) {
        setReturnStatusMsg('Return request submitted! Our support team will inspect within 24 hours.');
        setTimeout(() => setSelectedOrderForReturn(null), 2500);
      }
    } catch (err) {
      setReturnStatusMsg(err.response?.data?.message || 'Return submission failed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header Profile Summary */}
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white mb-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-4">
          <img
            src={user?.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
            alt=""
            className="w-16 h-16 rounded-full object-cover ring-4 ring-white/20"
          />
          <div>
            <h2 className="text-xl font-bold font-['Outfit']">{user?.name}</h2>
            <p className="text-xs text-indigo-200">{user?.email}</p>
            <span className="inline-block text-[10px] uppercase font-extrabold tracking-wider bg-indigo-500/30 text-indigo-300 px-2.5 py-0.5 rounded-full mt-1 border border-indigo-400/20">
              Verified Member
            </span>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-4 py-2 rounded-xl border border-white/20 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Main Account Tabs & Views */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Sidebar Nav */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-3 shadow-sm space-y-1">
          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'orders'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Package className="w-4 h-4" />
              <span>Orders & Returns</span>
            </div>
            <span className="text-[10px] opacity-80">({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('addresses')}
            className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'addresses'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4" />
              <span>Saved Addresses</span>
            </div>
            <span className="text-[10px] opacity-80">({user?.addresses?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'profile'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <User className="w-4 h-4" />
              <span>Personal Profile</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'notifications'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Bell className="w-4 h-4" />
              <span>Notification Center</span>
            </div>
            <span className="text-[10px] opacity-80">({notifications.length})</span>
          </button>
        </div>

        {/* Tab Content Panel */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* 1. ORDERS TAB */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold font-['Outfit'] text-slate-900 dark:text-white">Order History</h3>
              {ordersLoading ? (
                <div className="h-40 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
              ) : orders.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center space-y-3">
                  <Package className="w-10 h-10 text-slate-400 mx-auto" />
                  <h4 className="font-bold text-sm">No orders placed yet</h4>
                  <p className="text-xs text-slate-500">Your future order receipts and tracking history will show up here.</p>
                  <Link to="/shop" className="inline-block text-xs font-bold text-indigo-600 hover:underline">
                    Browse Store Catalog →
                  </Link>
                </div>
              ) : (
                orders.map((order) => (
                  <div
                    key={order._id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 text-xs">
                      <div>
                        <span className="text-slate-400 font-mono">ORDER #{order.orderNumber}</span>
                        <p className="text-[11px] text-slate-500">
                          Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full font-bold text-[11px] ${
                          order.orderStatus === 'Delivered'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : order.orderStatus === 'Cancelled'
                            ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                            : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                        }`}>
                          {order.orderStatus}
                        </span>
                        <Link
                          to={`/track?order=${order.orderNumber}`}
                          className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          Live Track →
                        </Link>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-3">
                      {order.items.map((it, i) => (
                        <div key={i} className="flex items-center gap-4">
                          <img src={it.image} alt="" className="w-12 h-12 object-cover rounded-xl bg-slate-100" />
                          <div className="flex-1 min-w-0 text-xs">
                            <p className="font-bold text-slate-900 dark:text-white truncate">{it.name}</p>
                            <p className="text-[10px] text-slate-400">Qty: {it.quantity} • ₹{it.price.toLocaleString('en-IN')}</p>
                          </div>
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            ₹{(it.price * it.quantity).toLocaleString('en-IN')}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Order Footer Actions */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
                      <div>
                        <span className="text-slate-500">Total Paid ({order.paymentMethod.toUpperCase()}): </span>
                        <strong className="text-slate-900 dark:text-white font-extrabold text-sm">₹{order.totalAmount.toLocaleString('en-IN')}</strong>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Cancel Button */}
                        {!['Shipped', 'Out for delivery', 'Delivered', 'Cancelled'].includes(order.orderStatus) && (
                          <button
                            onClick={() => handleCancelOrder(order._id)}
                            className="text-rose-600 hover:underline font-bold text-xs"
                          >
                            Cancel Order
                          </button>
                        )}

                        {/* Return Button */}
                        {order.orderStatus === 'Delivered' && (
                          <button
                            onClick={() => setSelectedOrderForReturn(order)}
                            className="flex items-center gap-1 text-indigo-600 hover:underline font-bold text-xs"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Request Return / Refund</span>
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                ))
              )}
            </div>
          )}

          {/* 2. ADDRESSES TAB */}
          {activeTab === 'addresses' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold font-['Outfit'] text-slate-900 dark:text-white">Shipping Address Book</h3>
                <button
                  onClick={() => setShowAddressModal(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Address
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {user?.addresses?.map((addr) => (
                  <div
                    key={addr._id}
                    className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2 relative"
                  >
                    <div className="flex justify-between items-start">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{addr.fullName}</p>
                      <button
                        onClick={() => deleteAddress(addr._id)}
                        className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {addr.address}, {addr.apartment && `${addr.apartment}, `}{addr.city}, {addr.state} - {addr.pincode}
                    </p>
                    <p className="text-xs text-slate-500">Contact: {addr.phone}</p>
                    {addr.isDefault && (
                      <span className="inline-block text-[10px] font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded-md">
                        Default Address
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. PERSONAL PROFILE & SECURITY TAB */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Profile Details */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
                <h4 className="text-base font-bold text-slate-900 dark:text-white font-['Outfit']">Profile Information</h4>
                {profileMessage && (
                  <p className="text-xs text-emerald-600 font-bold bg-emerald-50 p-2.5 rounded-xl">{profileMessage}</p>
                )}
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Registered Email (Read-only)</label>
                      <input
                        type="email"
                        disabled
                        value={user?.email}
                        className="w-full bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-xs opacity-60 cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="bg-indigo-600 text-white font-bold text-xs px-6 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors"
                  >
                    Save Profile Changes
                  </button>
                </form>
              </div>

              {/* Change Password */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
                <h4 className="text-base font-bold text-slate-900 dark:text-white font-['Outfit'] flex items-center gap-2">
                  <Lock className="w-4 h-4 text-indigo-600" />
                  <span>Update Password</span>
                </h4>
                {passwordMessage && (
                  <p className="text-xs font-bold text-indigo-600 bg-indigo-50 p-2.5 rounded-xl">{passwordMessage}</p>
                )}
                <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Current Password</label>
                    <input
                      type="password"
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">New Password (Min 6 chars)</label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition-colors"
                  >
                    Update Password
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* 4. NOTIFICATIONS TAB */}
          {activeTab === 'notifications' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
              <h3 className="text-xl font-bold font-['Outfit'] text-slate-900 dark:text-white">Alerts & Notifications</h3>
              <div className="space-y-3">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-500">You're all caught up! No unread notifications.</p>
                ) : (
                  notifications.map((n) => (
                    <div key={n._id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1 text-xs">
                      <p className="font-bold text-slate-900 dark:text-white">{n.title}</p>
                      <p className="text-slate-600 dark:text-slate-300">{n.message}</p>
                      <span className="text-[10px] text-slate-400">
                        {new Date(n.createdAt).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Return Request Modal */}
      {selectedOrderForReturn && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
              <h4 className="font-bold text-base font-['Outfit'] text-slate-900 dark:text-white">
                Request Return: #{selectedOrderForReturn.orderNumber}
              </h4>
              <button onClick={() => setSelectedOrderForReturn(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            {returnStatusMsg && (
              <p className="p-3 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-xl">{returnStatusMsg}</p>
            )}

            <form onSubmit={handleSubmitReturn} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Reason for Return</label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-xs"
                >
                  <option>Defective or not working</option>
                  <option>Damaged item</option>
                  <option>Item not as described</option>
                  <option>Wrong item received</option>
                  <option>Size/Fit issue</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Detailed Explanation</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe the issue with the delivered package..."
                  value={returnDescription}
                  onChange={(e) => setReturnDescription(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrderForReturn(null)}
                  className="border border-slate-300 px-4 py-2 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl text-xs font-bold"
                >
                  Submit Return Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
              <h4 className="font-bold text-base font-['Outfit']">Add New Shipping Address</h4>
              <button onClick={() => setShowAddressModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreateAddress} className="space-y-3">
              <input
                type="text"
                placeholder="Full Name"
                required
                value={addressForm.fullName}
                onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-xs"
              />
              <input
                type="tel"
                placeholder="10-digit Phone"
                required
                value={addressForm.phone}
                onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-xs"
              />
              <input
                type="text"
                placeholder="Street Address"
                required
                value={addressForm.address}
                onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-xs"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="City"
                  required
                  value={addressForm.city}
                  onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-xs"
                />
                <input
                  type="text"
                  placeholder="State"
                  required
                  value={addressForm.state}
                  onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-xs"
                />
              </div>
              <input
                type="text"
                placeholder="6-Digit PIN Code"
                required
                value={addressForm.pincode}
                onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-xs"
              />

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3 rounded-xl transition-colors mt-2"
              >
                Save Address
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default MyAccountPage;
