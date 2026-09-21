import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ArrowRight, ShoppingBag, ShieldCheck, Tag, AlertCircle } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const CartPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const {
    items,
    summary,
    appliedCoupon,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponError('');
    setCouponLoading(true);
    try {
      await applyCoupon(couponCode.trim());
      setCouponCode('');
    } catch (err) {
      setCouponError(err.message);
    } finally {
      setCouponLoading(false);
    }
  };

  const proceedToCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=checkout');
    } else {
      navigate('/checkout');
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-24 h-24 rounded-full bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 mx-auto">
          <ShoppingBag className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-bold font-['Outfit']">Your Cart is Currently Empty</h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Explore our exclusive catalog of electronics, athletic fashion, and luxury home decor.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-8 py-3.5 rounded-full transition-transform hover:scale-105"
        >
          <span>Continue Shopping</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">
            Shopping Cart ({items.reduce((acc, it) => acc + (it.quantity || 1), 0)} items)
          </h1>
          <p className="text-xs text-slate-500 mt-1">Review your items before proceeding to secure checkout</p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-semibold text-rose-500 hover:underline flex items-center gap-1"
        >
          <Trash2 className="w-3.5 h-3.5" /> Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Cart Item Rows */}
        <div className="lg:col-span-8 space-y-4">
          {items.map((item, idx) => {
            const product = item.product || {};
            const itemId = item._id || idx;
            const image = product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=200&q=80';

            return (
              <div
                key={itemId}
                className="flex flex-col sm:flex-row gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm"
              >
                <img
                  src={image}
                  alt={product.name}
                  className="w-24 h-24 object-cover rounded-xl bg-slate-100 dark:bg-slate-800 flex-shrink-0"
                />

                <div className="flex-1 flex flex-col justify-between space-y-3">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <span className="text-[11px] font-bold uppercase text-indigo-600 dark:text-indigo-400">
                        {product.brand?.name || 'ShopEase'}
                      </span>
                      <Link
                        to={`/product/${product.slug}`}
                        className="block text-base font-bold text-slate-900 dark:text-white hover:text-indigo-600 transition-colors"
                      >
                        {product.name}
                      </Link>
                      {(item.variant?.size || item.variant?.color) && (
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                          {item.variant.size && <span>Size: <strong>{item.variant.size}</strong></span>}
                          {item.variant.color && <span>Color: <strong>{item.variant.color}</strong></span>}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => removeFromCart(itemId)}
                      className="p-2 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
                      title="Remove from cart"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800">
                      <button
                        onClick={() => updateQuantity(itemId, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="px-3 py-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 text-xs font-bold"
                      >
                        -
                      </button>
                      <span className="px-4 py-1.5 text-xs font-bold text-slate-900 dark:text-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(itemId, item.quantity + 1)}
                        className="px-3 py-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right">
                      <span className="text-lg font-black text-slate-900 dark:text-white">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                      <span className="block text-[10px] text-slate-400">
                        ₹{item.price.toLocaleString('en-IN')} each
                      </span>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary & Checkout Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-['Outfit'] pb-3 border-b border-slate-100 dark:border-slate-800">
              Order Summary
            </h3>

            {/* Coupon Box */}
            <div>
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-3 rounded-2xl text-xs">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-semibold">
                    <Tag className="w-4 h-4" />
                    <span>Coupon <strong>{appliedCoupon.code}</strong> (-₹{appliedCoupon.discountAmount})</span>
                  </div>
                  <button onClick={removeCoupon} className="text-rose-500 font-bold hover:underline">
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="space-y-1.5">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Discount Code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-xl text-xs uppercase focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="submit"
                      disabled={couponLoading}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
                    >
                      {couponLoading ? 'Checking...' : 'Apply'}
                    </button>
                  </div>
                  {couponError && (
                    <p className="text-[11px] text-rose-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {couponError}
                    </p>
                  )}
                  <p className="text-[10px] text-slate-400">Try coupon: <strong>WELCOME10</strong> or <strong>FLASHSALE20</strong></p>
                </form>
              )}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  ₹{summary.subtotal.toLocaleString('en-IN')}
                </span>
              </div>

              {summary.discount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                  <span>Discount Applied</span>
                  <span>-₹{summary.discount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>GST Tax (18%)</span>
                <span>₹{summary.tax.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span>
                  {summary.shippingFee === 0 ? (
                    <strong className="text-emerald-600 dark:text-emerald-400">FREE SHIPPING</strong>
                  ) : (
                    `₹${summary.shippingFee}`
                  )}
                </span>
              </div>

              <div className="border-t border-slate-200 dark:border-slate-700 pt-3 flex justify-between text-base font-extrabold text-slate-900 dark:text-white font-['Outfit']">
                <span>Estimated Total</span>
                <span className="text-indigo-600 dark:text-indigo-400 text-xl font-black">
                  ₹{summary.grandTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Checkout Action */}
            <button
              onClick={proceedToCheckout}
              className="w-full bg-gradient-to-r from-indigo-600 to-primary-600 hover:from-indigo-700 hover:to-primary-700 text-white font-bold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 transition-transform hover:scale-[1.01]"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 text-center">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>256-Bit SSL Encrypted & Secure Checkout</span>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};

export default CartPage;
