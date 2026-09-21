import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('guest_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [summary, setSummary] = useState({
    subtotal: 0,
    shippingFee: 0,
    tax: 0,
    grandTotal: 0,
  });

  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch cart from backend if authenticated, or calculate locally if guest
  const syncCart = async () => {
    if (isAuthenticated) {
      try {
        setLoading(true);
        // Check if there are local guest items to merge
        const guestItems = localStorage.getItem('guest_cart');
        if (guestItems) {
          const parsed = JSON.parse(guestItems);
          if (parsed.length > 0) {
            await api.post('/cart/merge', { items: parsed });
            localStorage.removeItem('guest_cart');
          }
        }

        const res = await api.get('/cart');
        if (res.data.success) {
          setItems(res.data.data.items || []);
          setSummary(res.data.summary || {});
        }
      } catch (err) {
        console.error('Cart sync error:', err.message);
      } finally {
        setLoading(false);
      }
    } else {
      // Local calculation for guest
      let sub = 0;
      items.forEach(i => {
        sub += i.price * i.quantity;
      });
      const ship = sub >= 999 || sub === 0 ? 0 : 99;
      const tax = Math.round(sub * 0.18);
      let disc = 0;
      if (appliedCoupon) {
        disc = appliedCoupon.discountAmount || 0;
      }
      setSummary({
        subtotal: sub,
        shippingFee: ship,
        tax,
        discount: disc,
        grandTotal: Math.max(0, sub - disc) + ship + tax,
      });
      localStorage.setItem('guest_cart', JSON.stringify(items));
    }
  };

  useEffect(() => {
    syncCart();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      let sub = 0;
      items.forEach(i => {
        sub += i.price * i.quantity;
      });
      const ship = sub >= 999 || sub === 0 ? 0 : 99;
      const tax = Math.round(sub * 0.18);
      let disc = appliedCoupon ? appliedCoupon.discountAmount || 0 : 0;
      setSummary({
        subtotal: sub,
        shippingFee: ship,
        tax,
        discount: disc,
        grandTotal: Math.max(0, sub - disc) + ship + tax,
      });
      localStorage.setItem('guest_cart', JSON.stringify(items));
    }
  }, [items, appliedCoupon, isAuthenticated]);

  const addToCart = async (product, quantity = 1, variant = {}) => {
    if (isAuthenticated) {
      try {
        const res = await api.post('/cart', {
          productId: product._id,
          quantity,
          variant,
        });
        if (res.data.success) {
          setItems(res.data.data.items || []);
          setSummary(res.data.summary || {});
          setIsDrawerOpen(true);
        }
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to add item to cart');
      }
    } else {
      // Guest cart
      const existingIndex = items.findIndex(
        it => (it.product?._id || it.product) === product._id &&
              (it.variant?.size || '') === (variant.size || '') &&
              (it.variant?.color || '') === (variant.color || '')
      );

      let updated = [...items];
      if (existingIndex > -1) {
        updated[existingIndex].quantity += quantity;
      } else {
        updated.push({
          product,
          price: variant.price || product.price,
          quantity,
          variant,
        });
      }
      setItems(updated);
      setIsDrawerOpen(true);
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    if (quantity < 1) return;
    if (isAuthenticated) {
      try {
        const res = await api.put(`/cart/${itemId}`, { quantity });
        if (res.data.success) {
          setItems(res.data.data.items || []);
          setSummary(res.data.summary || {});
        }
      } catch (err) {
        console.error(err.message);
      }
    } else {
      const updated = items.map((it, idx) => (idx === itemId || it._id === itemId ? { ...it, quantity } : it));
      setItems(updated);
    }
  };

  const removeFromCart = async (itemId) => {
    if (isAuthenticated) {
      try {
        const res = await api.delete(`/cart/${itemId}`);
        if (res.data.success) {
          setItems(res.data.data.items || []);
          setSummary(res.data.summary || {});
        }
      } catch (err) {
        console.error(err.message);
      }
    } else {
      const updated = items.filter((it, idx) => idx !== itemId && it._id !== itemId);
      setItems(updated);
    }
  };

  const clearCart = async () => {
    if (isAuthenticated) {
      try {
        await api.delete('/cart');
      } catch (err) {
        console.error(err);
      }
    }
    setItems([]);
    setAppliedCoupon(null);
    localStorage.removeItem('guest_cart');
  };

  const applyCoupon = async (code) => {
    if (!isAuthenticated) {
      throw new Error('Please login to apply coupon discounts');
    }
    try {
      const res = await api.post('/coupons/validate', {
        code,
        cartTotal: summary.subtotal,
        items,
      });
      if (res.data.success) {
        setAppliedCoupon(res.data.data);
        return res.data.data;
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Invalid coupon code');
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const cartCount = items.reduce((acc, it) => acc + (it.quantity || 1), 0);

  return (
    <CartContext.Provider
      value={{
        items,
        summary,
        appliedCoupon,
        cartCount,
        isDrawerOpen,
        setIsDrawerOpen,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyCoupon,
        removeCoupon,
        syncCart,
        loading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
