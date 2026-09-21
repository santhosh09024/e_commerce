import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  MapPin,
  Truck,
  CreditCard,
  Banknote,
  ShieldCheck,
  ArrowRight,
  Plus,
  AlertCircle,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user, addAddress } = useAuth();
  const { items, summary, appliedCoupon, clearCart } = useCart();

  // Multi-step: 1 = Address, 2 = Shipping, 3 = Payment, 4 = Confirmation
  const [step, setStep] = useState(1);

  // Address selection
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    country: 'India',
    pincode: '',
    isDefault: false,
  });
  const [addressError, setAddressError] = useState('');

  // Shipping Method
  const [shippingMethod, setShippingMethod] = useState('standard');

  // Payment Method: 'razorpay' | 'cod'
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [storeSettings, setStoreSettings] = useState({ codEnabled: true, maxCodAmount: 20000, restrictedCodPincodes: [] });
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [completedOrder, setCompletedOrder] = useState(null);

  // Initialize default selected address
  useEffect(() => {
    if (user?.addresses && user.addresses.length > 0) {
      const def = user.addresses.find(a => a.isDefault) || user.addresses[0];
      setSelectedAddressId(def._id);
    } else {
      setShowNewAddressForm(true);
    }

    // Fetch store payment settings
    const fetchSettings = async () => {
      try {
        const res = await api.get('/admin/settings/public');
        if (res.data.success) {
          setStoreSettings(res.data.data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchSettings();
  }, [user]);

  if (!items || items.length === 0) {
    if (step === 4 && completedOrder) {
      // Allow viewing confirmation screen even after cart is cleared
    } else {
      return (
        <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
          <h2 className="text-xl font-bold">Your cart is empty</h2>
          <button onClick={() => navigate('/shop')} className="text-indigo-600 font-bold underline">
            Go to Shop
          </button>
        </div>
      );
    }
  }

  const handleAddNewAddress = async (e) => {
    e.preventDefault();
    setAddressError('');
    try {
      const updatedAddrs = await addAddress(newAddress);
      const newlyAdded = updatedAddrs[updatedAddrs.length - 1];
      setSelectedAddressId(newlyAdded._id);
      setShowNewAddressForm(false);
    } catch (err) {
      setAddressError(err.response?.data?.message || err.message);
    }
  };

  const selectedAddress = user?.addresses?.find(a => a._id === selectedAddressId);

  // Process Final Order Placement
  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      setOrderError('Please select or add a delivery address');
      setStep(1);
      return;
    }

    setOrderError('');
    setLoadingOrder(true);

    try {
      // Step 1: Create Order in Backend with validated pricing & stock
      const orderPayload = {
        items: items.map(it => ({
          product: it.product?._id || it.product,
          name: it.product?.name || '',
          price: it.price,
          quantity: it.quantity,
          variant: it.variant || {},
        })),
        shippingAddress: {
          fullName: selectedAddress.fullName,
          phone: selectedAddress.phone,
          address: selectedAddress.address,
          apartment: selectedAddress.apartment || '',
          city: selectedAddress.city,
          state: selectedAddress.state,
          country: selectedAddress.country || 'India',
          pincode: selectedAddress.pincode,
        },
        paymentMethod,
        couponCode: appliedCoupon?.code,
      };

      const orderRes = await api.post('/orders', orderPayload);
      if (!orderRes.data.success) {
        throw new Error(orderRes.data.message || 'Order creation failed');
      }

      const createdOrder = orderRes.data.data;

      // Step 2: Handle Payment Gateway
      if (paymentMethod === 'razorpay') {
        // Call backend to create Razorpay Order
        const paymentRes = await api.post('/payment/create', {
          amount: createdOrder.totalAmount,
          currency: 'INR',
          receipt: createdOrder.orderNumber,
        });

        const rzpData = paymentRes.data.data;

        // If in mock/simulator mode or Razorpay script loaded
        if (rzpData.isMock || typeof window.Razorpay === 'undefined') {
          // Verify simulator payment
          await api.post('/payment/verify', {
            razorpay_order_id: rzpData.id,
            razorpay_payment_id: `pay_${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
            razorpay_signature: 'simulated_valid_signature',
            orderId: createdOrder._id,
          });

          // Order complete!
          finalizeOrderSuccess(createdOrder);
        } else {
          // Open real Razorpay modal
          const options = {
            key: rzpData.key,
            amount: rzpData.amount,
            currency: rzpData.currency,
            name: 'ShopEase Commercial',
            description: `Order #${createdOrder.orderNumber}`,
            order_id: rzpData.id,
            prefill: {
              name: user?.name,
              email: user?.email,
              contact: selectedAddress.phone,
            },
            theme: { color: '#4f46e5' },
            handler: async function (response) {
              try {
                await api.post('/payment/verify', {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  orderId: createdOrder._id,
                });
                finalizeOrderSuccess(createdOrder);
              } catch (verifyErr) {
                setOrderError('Payment verification failed. Please contact support.');
              }
            },
          };

          const razorpay = new window.Razorpay(options);
          razorpay.open();
        }
      } else {
        // Cash on Delivery
        finalizeOrderSuccess(createdOrder);
      }
    } catch (err) {
      setOrderError(err.response?.data?.message || err.message || 'An error occurred placing order');
    } finally {
      setLoadingOrder(false);
    }
  };

  const finalizeOrderSuccess = (order) => {
    clearCart();
    setCompletedOrder(order);
    setStep(4);
    // Fire celebratory confetti!
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Checkout Progress Stepper */}
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-indigo-600 font-extrabold' : ''}`}>
            <span className={`w-7 h-7 rounded-full flex items-center justify-center border-2 ${
              step >= 1 ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-300'
            }`}>1</span>
            <span>Delivery Address</span>
          </div>

          <div className={`w-12 sm:w-20 h-0.5 ${step >= 2 ? 'bg-indigo-600' : 'bg-slate-200'}`} />

          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-indigo-600 font-extrabold' : ''}`}>
            <span className={`w-7 h-7 rounded-full flex items-center justify-center border-2 ${
              step >= 2 ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-300'
            }`}>2</span>
            <span>Shipping</span>
          </div>

          <div className={`w-12 sm:w-20 h-0.5 ${step >= 3 ? 'bg-indigo-600' : 'bg-slate-200'}`} />

          <div className={`flex items-center gap-2 ${step >= 3 ? 'text-indigo-600 font-extrabold' : ''}`}>
            <span className={`w-7 h-7 rounded-full flex items-center justify-center border-2 ${
              step >= 3 ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-300'
            }`}>3</span>
            <span>Payment</span>
          </div>
        </div>
      </div>

      {orderError && (
        <div className="max-w-3xl mx-auto p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-600 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{orderError}</span>
        </div>
      )}

      {/* Confirmation Step (Step 4) */}
      {step === 4 && completedOrder ? (
        <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-xl">
          <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Order Placed Successfully!</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-['Outfit'] mt-1">
              Thank You For Your Purchase
            </h2>
            <p className="text-xs text-slate-500 mt-2">
              We sent an order confirmation with live tracking links to <strong>{user?.email}</strong>.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-left space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Order Reference:</span>
              <strong className="text-slate-900 dark:text-white font-mono">{completedOrder.orderNumber}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Payment Mode:</span>
              <span className="uppercase font-bold text-slate-800 dark:text-slate-200">{completedOrder.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Total Paid:</span>
              <span className="font-extrabold text-indigo-600 dark:text-indigo-400">₹{completedOrder.totalAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Delivery Address:</span>
              <span className="text-right max-w-xs">{completedOrder.shippingAddress?.address}, {completedOrder.shippingAddress?.city} - {completedOrder.shippingAddress?.pincode}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              onClick={() => navigate(`/track?order=${completedOrder.orderNumber}`)}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3.5 rounded-xl transition-all shadow-md"
            >
              Track Order Status
            </button>
            <button
              onClick={() => navigate('/shop')}
              className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs py-3.5 rounded-xl hover:bg-slate-200 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      ) : (
        /* Steps 1, 2, 3 Layout */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Form Body */}
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            
            {/* STEP 1: Address Selection */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white font-['Outfit'] flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-indigo-600" />
                    <span>Select Delivery Address</span>
                  </h3>
                  {!showNewAddressForm && (
                    <button
                      onClick={() => setShowNewAddressForm(true)}
                      className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add New Address
                    </button>
                  )}
                </div>

                {/* Saved Addresses List */}
                {!showNewAddressForm && user?.addresses && user.addresses.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {user.addresses.map((addr) => (
                      <div
                        key={addr._id}
                        onClick={() => setSelectedAddressId(addr._id)}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                          selectedAddressId === addr._id
                            ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <p className="text-xs font-bold text-slate-900 dark:text-white">{addr.fullName}</p>
                          {addr.isDefault && (
                            <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                          {addr.address}, {addr.apartment && `${addr.apartment}, `}{addr.city}, {addr.state} - {addr.pincode}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">Phone: {addr.phone}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add New Address Form */}
                {showNewAddressForm && (
                  <form onSubmit={handleAddNewAddress} className="space-y-4 pt-2">
                    {addressError && (
                      <p className="text-xs text-rose-500 font-semibold">{addressError}</p>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold mb-1 text-slate-600 dark:text-slate-300">Full Name</label>
                        <input
                          type="text"
                          required
                          value={newAddress.fullName}
                          onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1 text-slate-600 dark:text-slate-300">10-digit Phone</label>
                        <input
                          type="tel"
                          required
                          placeholder="e.g. 9876543210"
                          value={newAddress.phone}
                          onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1 text-slate-600 dark:text-slate-300">Street Address</label>
                      <input
                        type="text"
                        required
                        placeholder="House/Flat number, building, street"
                        value={newAddress.address}
                        onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold mb-1 text-slate-600 dark:text-slate-300">City</label>
                        <input
                          type="text"
                          required
                          value={newAddress.city}
                          onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1 text-slate-600 dark:text-slate-300">State</label>
                        <input
                          type="text"
                          required
                          value={newAddress.state}
                          onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1 text-slate-600 dark:text-slate-300">6-Digit PIN Code</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 560103"
                          value={newAddress.pincode}
                          onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="submit"
                        className="bg-indigo-600 text-white font-bold text-xs px-6 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors"
                      >
                        Save Address
                      </button>
                      {user?.addresses?.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setShowNewAddressForm(false)}
                          className="border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs px-4 py-2.5 rounded-xl"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                )}

                <div className="pt-4 flex justify-end">
                  <button
                    onClick={() => {
                      if (!selectedAddressId) {
                        alert('Please select or create an address');
                        return;
                      }
                      setStep(2);
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-8 py-3 rounded-xl flex items-center gap-2"
                  >
                    <span>Proceed to Shipping</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Shipping Method */}
            {step === 2 && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white font-['Outfit'] flex items-center gap-2">
                  <Truck className="w-5 h-5 text-indigo-600" />
                  <span>Choose Shipping Method</span>
                </h3>

                <div className="space-y-3">
                  <label
                    onClick={() => setShippingMethod('standard')}
                    className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      shippingMethod === 'standard'
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="shipping"
                        checked={shippingMethod === 'standard'}
                        onChange={() => setShippingMethod('standard')}
                        className="accent-indigo-600"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">Standard Express Delivery</p>
                        <p className="text-[11px] text-slate-500">Delivered within 3-4 business days</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-600">
                      {summary.shippingFee === 0 ? 'FREE' : `₹${summary.shippingFee}`}
                    </span>
                  </label>
                </div>

                <div className="flex justify-between items-center pt-4">
                  <button
                    onClick={() => setStep(1)}
                    className="text-xs font-bold text-slate-500 hover:underline"
                  >
                    ← Back to Address
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-8 py-3 rounded-xl flex items-center gap-2"
                  >
                    <span>Proceed to Payment</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Payment Method */}
            {step === 3 && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white font-['Outfit'] flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-indigo-600" />
                  <span>Select Payment Gateway</span>
                </h3>

                <div className="space-y-3">
                  {/* Razorpay */}
                  <label
                    onClick={() => setPaymentMethod('razorpay')}
                    className={`flex items-start justify-between p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                      paymentMethod === 'razorpay'
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'razorpay'}
                        onChange={() => setPaymentMethod('razorpay')}
                        className="accent-indigo-600 mt-0.5"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">Razorpay (Cards, UPI, Netbanking, Wallets)</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">Pay safely via Google Pay, PhonePe, Cards or Net Banking</p>
                        <div className="flex gap-2 mt-2">
                          <span className="text-[10px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded font-bold">UPI / QR</span>
                          <span className="text-[10px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded font-bold">Visa / MC / RuPay</span>
                        </div>
                      </div>
                    </div>
                  </label>

                  {/* Cash On Delivery */}
                  <label
                    onClick={() => {
                      if (storeSettings.codEnabled && summary.grandTotal <= storeSettings.maxCodAmount) {
                        setPaymentMethod('cod');
                      }
                    }}
                    className={`flex items-start justify-between p-5 rounded-2xl border-2 transition-all ${
                      !storeSettings.codEnabled || summary.grandTotal > storeSettings.maxCodAmount
                        ? 'opacity-50 cursor-not-allowed border-slate-200 dark:border-slate-800'
                        : paymentMethod === 'cod'
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 cursor-pointer'
                        : 'border-slate-200 dark:border-slate-800 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="payment"
                        disabled={!storeSettings.codEnabled || summary.grandTotal > storeSettings.maxCodAmount}
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                        className="accent-indigo-600 mt-0.5"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Banknote className="w-4 h-4 text-emerald-600" />
                          <span>Cash on Delivery (COD)</span>
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Pay cash or UPI directly to courier upon physical delivery.
                        </p>
                        {summary.grandTotal > storeSettings.maxCodAmount && (
                          <p className="text-[11px] text-rose-500 mt-1 font-semibold">
                            COD not available for orders above ₹{storeSettings.maxCodAmount.toLocaleString('en-IN')}.
                          </p>
                        )}
                      </div>
                    </div>
                  </label>
                </div>

                <div className="flex justify-between items-center pt-4">
                  <button
                    onClick={() => setStep(2)}
                    className="text-xs font-bold text-slate-500 hover:underline"
                  >
                    ← Back to Shipping
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={loadingOrder}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-8 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-600/30 disabled:opacity-50"
                  >
                    {loadingOrder ? (
                      <span>Processing Payment...</span>
                    ) : (
                      <>
                        <span>Confirm & Place Order (₹{summary.grandTotal.toLocaleString('en-IN')})</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

              </div>
            )}

          </div>

          {/* Checkout Right Summary Panel */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
              <h4 className="text-base font-bold text-slate-900 dark:text-white font-['Outfit'] pb-2 border-b border-slate-100 dark:border-slate-800">
                Order Items ({items.length})
              </h4>

              <div className="max-h-60 overflow-y-auto space-y-3 pr-1 divide-y divide-slate-100 dark:divide-slate-800">
                {items.map((it, i) => (
                  <div key={i} className="pt-2 first:pt-0 flex gap-3 items-center">
                    <img
                      src={it.product?.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=100&q=80'}
                      alt=""
                      className="w-12 h-12 object-cover rounded-lg bg-slate-100 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0 text-xs">
                      <p className="font-semibold text-slate-900 dark:text-white truncate">{it.product?.name}</p>
                      <p className="text-[10px] text-slate-400">Qty: {it.quantity} × ₹{it.price.toLocaleString('en-IN')}</p>
                    </div>
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      ₹{(it.price * it.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Details */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900 dark:text-white">₹{summary.subtotal.toLocaleString('en-IN')}</span>
                </div>
                {summary.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Discount</span>
                    <span>-₹{summary.discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Tax (18%)</span>
                  <span>₹{summary.tax.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{summary.shippingFee === 0 ? 'FREE' : `₹${summary.shippingFee}`}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between text-sm font-extrabold text-slate-900 dark:text-white">
                  <span>Final Amount</span>
                  <span className="text-indigo-600 dark:text-indigo-400 text-base">₹{summary.grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-center gap-2 text-[10px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Encrypted Razorpay & COD Security</span>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default CheckoutPage;
