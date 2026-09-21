import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { useCart } from './CartContext';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = async () => {
    if (!isAuthenticated) {
      setWishlist([]);
      return;
    }
    try {
      setLoading(true);
      const res = await api.get('/wishlist');
      if (res.data.success) {
        setWishlist(res.data.data || []);
      }
    } catch (err) {
      console.error('Fetch wishlist error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [isAuthenticated]);

  const isInWishlist = (productId) => {
    return wishlist.some(item => (item._id || item) === productId);
  };

  const toggleWishlist = async (product) => {
    if (!isAuthenticated) {
      alert('Please sign in to save items to your wishlist.');
      return;
    }

    const exists = isInWishlist(product._id);
    try {
      if (exists) {
        await api.delete(`/wishlist/${product._id}`);
        setWishlist(prev => prev.filter(p => (p._id || p) !== product._id));
      } else {
        const res = await api.post('/wishlist', { productId: product._id });
        if (res.data.success) {
          setWishlist(res.data.data);
        }
      }
    } catch (err) {
      console.error('Toggle wishlist error:', err.message);
    }
  };

  const removeFromWishlist = async (productId) => {
    if (!isAuthenticated) return;
    try {
      await api.delete(`/wishlist/${productId}`);
      setWishlist(prev => prev.filter(p => (p._id || p) !== productId));
    } catch (err) {
      console.error('Remove wishlist error:', err.message);
    }
  };

  const moveToCart = async (product) => {
    if (!isAuthenticated) return;
    try {
      await addToCart(product, 1);
      await removeFromWishlist(product._id);
    } catch (err) {
      console.error('Move to cart error:', err.message);
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount: wishlist.length,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
        moveToCart,
        loading,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
