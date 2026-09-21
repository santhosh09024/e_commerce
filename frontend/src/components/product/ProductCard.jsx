import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star, Eye } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';

const ProductCard = ({ product }) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const isWishlisted = isInWishlist(product._id);

  const mainImage = product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80';
  const secondImage = product.images?.[1] || mainImage;

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const defaultVariant = product.variants?.[0] || {};
      await addToCart(product, 1, defaultVariant);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <div className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col">
      
      {/* Badges (Discount, Flash Sale, Out of Stock) */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start">
        {product.discount > 0 && (
          <span className="bg-rose-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-sm">
            {product.discount}% OFF
          </span>
        )}
        {product.isFlashSale && (
          <span className="bg-amber-500 text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full shadow-sm animate-pulse">
            Flash Sale
          </span>
        )}
        {product.stock <= 0 && (
          <span className="bg-slate-800 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
            Out of Stock
          </span>
        )}
      </div>

      {/* Wishlist Button */}
      <button
        onClick={handleWishlistClick}
        aria-label="Add to wishlist"
        className={`absolute top-3 right-3 z-10 p-2 rounded-full backdrop-blur-md transition-transform active:scale-90 ${
          isWishlisted
            ? 'bg-rose-50 dark:bg-rose-950/80 text-rose-500 shadow-md scale-105'
            : 'bg-white/80 dark:bg-slate-800/80 text-slate-500 hover:text-rose-500 dark:text-slate-300'
        }`}
      >
        <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500' : ''}`} />
      </button>

      {/* Image with hover transition */}
      <Link to={`/product/${product.slug}`} className="relative aspect-square overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={mainImage}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {secondImage !== mainImage && (
          <img
            src={secondImage}
            alt={product.name}
            className="w-full h-full object-cover object-center absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            loading="lazy"
          />
        )}
      </Link>

      {/* Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Brand & Category */}
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>{product.brand?.name || product.category?.name || 'ShopEase'}</span>
            {product.stock > 0 && product.stock <= 5 && (
              <span className="text-amber-500 font-semibold text-[11px]">Only {product.stock} left</span>
            )}
          </div>

          {/* Title */}
          <Link
            to={`/product/${product.slug}`}
            className="block text-sm font-semibold text-slate-800 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors line-clamp-2 mt-1"
          >
            {product.name}
          </Link>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mt-2">
            <div className="flex items-center text-amber-400">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 ml-1">
                {product.rating > 0 ? product.rating.toFixed(1) : '4.5'}
              </span>
            </div>
            <span className="text-xs text-slate-400">({product.reviewCount || 12})</span>
          </div>
        </div>

        {/* Pricing & Quick Add */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-2">
              <span className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
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
            onClick={handleQuickAdd}
            disabled={product.stock <= 0}
            className="p-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white dark:bg-slate-800 dark:hover:bg-indigo-600 dark:text-indigo-400 dark:hover:text-white transition-all shadow-sm active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
            title="Add to cart"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
};

export default ProductCard;
