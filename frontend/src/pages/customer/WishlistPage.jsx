import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';

const WishlistPage = () => {
  const { wishlist, removeFromWishlist, moveToCart, loading } = useWishlist();

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-500 flex items-center justify-center mx-auto">
          <Heart className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold font-['Outfit']">Your Wishlist is Empty</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Save your favorite products while browsing and keep track of price drops and availability.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-6 py-3 rounded-full transition-transform hover:scale-105"
        >
          <span>Explore Products</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">
          My Saved Wishlist ({wishlist.length} items)
        </h1>
        <p className="text-xs text-slate-500 mt-1">Keep track of your dream items or move them directly to your cart</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {wishlist.map((product) => {
          const image = product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80';
          return (
            <div
              key={product._id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div className="relative aspect-square bg-slate-100 dark:bg-slate-800">
                <img src={image} alt={product.name} className="w-full h-full object-cover" />
                <button
                  onClick={() => removeFromWishlist(product._id)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-white/80 dark:bg-slate-900/80 text-rose-500 shadow-sm hover:scale-110 transition-transform"
                  title="Remove from wishlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <Link
                    to={`/product/${product.slug}`}
                    className="text-sm font-bold text-slate-900 dark:text-white hover:text-indigo-600 line-clamp-2"
                  >
                    {product.name}
                  </Link>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-base font-extrabold text-slate-900 dark:text-white">
                      ₹{product.price.toLocaleString('en-IN')}
                    </span>
                    {product.comparePrice > product.price && (
                      <span className="text-xs text-slate-400 line-through">
                        ₹{product.comparePrice.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => moveToCart(product)}
                  className="w-full bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white dark:bg-slate-800 dark:hover:bg-indigo-600 dark:text-indigo-400 dark:hover:text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>Move to Cart</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WishlistPage;
