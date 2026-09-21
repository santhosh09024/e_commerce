import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star,
  Heart,
  ShoppingCart,
  Zap,
  Truck,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  ThumbsUp,
  Share2,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import ImageGallery from '../../components/product/ImageGallery';
import ProductCard from '../../components/product/ProductCard';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const ProductDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { user, isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected variant
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Active tab: 'description' | 'specifications' | 'reviews'
  const [activeTab, setActiveTab] = useState('description');

  // Reviews state
  const [reviewsData, setReviewsData] = useState({ data: [], total: 0, averageRating: 0, distribution: {} });
  const [newRating, setNewRating] = useState(5);
  const [newTitle, setNewTitle] = useState('');
  const [newComment, setNewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewMessage, setReviewMessage] = useState('');

  // Fetch product and reviews
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/products/${slug}`);
        if (res.data.success) {
          const prod = res.data.data;
          setProduct(prod);
          setRelatedProducts(res.data.relatedProducts || []);

          // Set default variants if available
          if (prod.variants && prod.variants.length > 0) {
            setSelectedSize(prod.variants[0].size || '');
            setSelectedColor(prod.variants[0].color || '');
          }

          // Fetch reviews
          const revRes = await api.get(`/reviews/${prod._id}`);
          if (revRes.data.success) {
            setReviewsData(revRes.data);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex justify-center items-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold">Product not found</h2>
        <Link to="/shop" className="text-indigo-600 font-semibold hover:underline">Back to Shop</Link>
      </div>
    );
  }

  const isWishlisted = isInWishlist(product._id);

  // Determine current active price based on selected variant
  let currentPrice = product.price;
  let currentVariantStock = product.stock;

  if (product.variants && (selectedSize || selectedColor)) {
    const matched = product.variants.find(
      v => (!selectedSize || v.size === selectedSize) && (!selectedColor || v.color.toLowerCase() === selectedColor.toLowerCase())
    );
    if (matched) {
      if (matched.price > 0) currentPrice = matched.price;
      if (matched.stock > 0) currentVariantStock = matched.stock;
    }
  }

  const handleAddToCart = async () => {
    try {
      await addToCart(product, quantity, {
        size: selectedSize,
        color: selectedColor,
      });
    } catch (err) {
      alert(err.message);
    }
  };

  const handleBuyNow = async () => {
    try {
      await addToCart(product, quantity, {
        size: selectedSize,
        color: selectedColor,
      });
      if (!isAuthenticated) {
        navigate('/login?redirect=checkout');
      } else {
        navigate('/checkout');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Please log in to submit a review');
      return;
    }

    setReviewSubmitting(true);
    setReviewMessage('');

    try {
      const res = await api.post('/reviews', {
        productId: product._id,
        rating: newRating,
        title: newTitle,
        comment: newComment,
      });

      if (res.data.success) {
        setReviewMessage('Thank you! Your verified review has been posted.');
        setNewTitle('');
        setNewComment('');
        // Refresh reviews
        const revRes = await api.get(`/reviews/${product._id}`);
        if (revRes.data.success) setReviewsData(revRes.data);
      }
    } catch (err) {
      setReviewMessage(err.response?.data?.message || 'Error submitting review');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleHelpful = async (reviewId) => {
    if (!isAuthenticated) {
      alert('Please login to upvote helpful reviews');
      return;
    }
    try {
      await api.put(`/reviews/${reviewId}/helpful`);
      // Refresh reviews
      const revRes = await api.get(`/reviews/${product._id}`);
      if (revRes.data.success) setReviewsData(revRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 overflow-x-auto py-1">
        <Link to="/" className="hover:text-slate-800 dark:hover:text-slate-200">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/shop" className="hover:text-slate-800 dark:hover:text-slate-200">Shop</Link>
        {product.category && (
          <>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to={`/category/${product.category.slug}`} className="hover:text-slate-800 dark:hover:text-slate-200">
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-900 dark:text-slate-100 font-medium truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left: Image Gallery */}
        <div className="lg:col-span-6">
          <ImageGallery images={product.images} />
        </div>

        {/* Right: Product Details & Buying Actions */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Brand, Title & SKU */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              <span>{product.brand?.name || 'Exclusive'}</span>
              <span className="text-slate-400 font-mono">SKU: {product.sku}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-['Outfit'] mt-2">
              {product.name}
            </h1>

            {/* Ratings & Reviews Count */}
            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating || 5) ? 'fill-amber-400' : 'text-slate-300 dark:text-slate-700'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {product.rating > 0 ? product.rating.toFixed(1) : '4.8'}
              </span>
              <span className="text-xs text-slate-400">
                ({reviewsData.total || product.reviewCount || 1} customer reviews)
              </span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="p-4 rounded-2xl bg-slate-100/70 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-slate-900 dark:text-white font-['Outfit']">
                  ₹{currentPrice.toLocaleString('en-IN')}
                </span>
                {product.comparePrice > currentPrice && (
                  <span className="text-sm text-slate-400 line-through">
                    ₹{product.comparePrice.toLocaleString('en-IN')}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500">Inclusive of all taxes (18% GST)</p>
            </div>

            {product.discount > 0 && (
              <span className="bg-rose-500 text-white font-bold text-xs px-3 py-1.5 rounded-xl shadow-sm">
                Save {product.discount}% OFF
              </span>
            )}
          </div>

          {/* Stock Status */}
          <div className="flex items-center gap-2 text-xs">
            {currentVariantStock > 0 ? (
              <span className="flex items-center gap-1.5 text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5" /> In Stock ({currentVariantStock} units ready to dispatch)
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-rose-600 font-bold bg-rose-50 dark:bg-rose-950/50 px-3 py-1 rounded-full border border-rose-200 dark:border-rose-800">
                <AlertTriangle className="w-3.5 h-3.5" /> Temporarily Out of Stock
              </span>
            )}
          </div>

          {/* Variants Selector (Size & Color) */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
              
              {/* Sizes */}
              {Array.from(new Set(product.variants.map(v => v.size).filter(Boolean))).length > 0 && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Select Size: <strong className="text-slate-900 dark:text-white">{selectedSize}</strong>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(new Set(product.variants.map(v => v.size).filter(Boolean))).map((sz) => (
                      <button
                        key={sz}
                        onClick={() => setSelectedSize(sz)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                          selectedSize === sz
                            ? 'border-indigo-600 bg-indigo-600 text-white shadow-md'
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-400 text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Colors */}
              {Array.from(new Set(product.variants.map(v => v.color).filter(Boolean))).length > 0 && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Select Color: <strong className="text-slate-900 dark:text-white">{selectedColor}</strong>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(new Set(product.variants.map(v => v.color).filter(Boolean))).map((col) => {
                      const vObj = product.variants.find(v => v.color === col);
                      return (
                        <button
                          key={col}
                          onClick={() => setSelectedColor(col)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                            selectedColor === col
                              ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold'
                              : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
                          }`}
                        >
                          {vObj?.colorCode && (
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-slate-300"
                              style={{ backgroundColor: vObj.colorCode }}
                            />
                          )}
                          <span>{col}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* Quantity & CTA Buttons */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="px-3 py-2 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
                >
                  -
                </button>
                <span className="px-4 py-2 font-bold text-sm text-slate-900 dark:text-white">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(currentVariantStock, quantity + 1))}
                  disabled={quantity >= currentVariantStock}
                  className="px-3 py-2 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={currentVariantStock <= 0}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 transition-all active:scale-[0.98] disabled:opacity-40"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>

              <button
                onClick={() => toggleWishlist(product)}
                aria-label="Wishlist toggle"
                className={`p-3 rounded-xl border transition-colors ${
                  isWishlisted
                    ? 'border-rose-300 bg-rose-50 dark:bg-rose-950/60 text-rose-500'
                    : 'border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-rose-500' : ''}`} />
              </button>
            </div>

            <button
              onClick={handleBuyNow}
              disabled={currentVariantStock <= 0}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] disabled:opacity-40"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>Buy Now with 1-Click</span>
            </button>
          </div>

          {/* Delivery & Assurance Badges */}
          <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-center text-[11px] text-slate-600 dark:text-slate-400">
            <div className="flex flex-col items-center gap-1.5">
              <Truck className="w-5 h-5 text-indigo-600" />
              <span>Free Delivery in 3-4 Days</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <RotateCcw className="w-5 h-5 text-amber-600" />
              <span>7-Day Return Guarantee</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>100% Brand Authenticity</span>
            </div>
          </div>

        </div>

      </div>

      {/* Tabs: Description, Specifications, Verified Reviews */}
      <div className="pt-8 border-t border-slate-200 dark:border-slate-800">
        
        {/* Tab Headers */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-8">
          <button
            onClick={() => setActiveTab('description')}
            className={`pb-4 text-sm font-bold border-b-2 transition-colors ${
              activeTab === 'description'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            Product Overview
          </button>
          <button
            onClick={() => setActiveTab('specifications')}
            className={`pb-4 text-sm font-bold border-b-2 transition-colors ${
              activeTab === 'specifications'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            Technical Specifications
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-4 text-sm font-bold border-b-2 transition-colors ${
              activeTab === 'reviews'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            Customer Reviews ({reviewsData.total})
          </button>
        </div>

        {/* Tab Body */}
        <div className="py-8">
          
          {/* 1. Description */}
          {activeTab === 'description' && (
            <div className="space-y-6 max-w-4xl leading-relaxed text-sm text-slate-700 dark:text-slate-300">
              <p className="text-base font-normal">{product.description}</p>
              {product.features && product.features.length > 0 && (
                <div className="space-y-3 pt-4">
                  <h4 className="font-bold text-slate-900 dark:text-white text-base">Key Highlights:</h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {product.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2 bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                        <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* 2. Specifications */}
          {activeTab === 'specifications' && (
            <div className="max-w-2xl">
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                <div className="flex p-3.5 bg-slate-50 dark:bg-slate-900 font-semibold">
                  <span className="w-1/2 text-slate-500">Brand</span>
                  <span className="w-1/2 text-slate-900 dark:text-white">{product.brand?.name || 'ShopEase'}</span>
                </div>
                <div className="flex p-3.5">
                  <span className="w-1/2 text-slate-500">Model SKU</span>
                  <span className="w-1/2 text-slate-900 dark:text-white">{product.sku}</span>
                </div>
                <div className="flex p-3.5 bg-slate-50 dark:bg-slate-900">
                  <span className="w-1/2 text-slate-500">Category</span>
                  <span className="w-1/2 text-slate-900 dark:text-white">{product.category?.name}</span>
                </div>
                {product.specifications?.map((spec, i) => (
                  <div key={i} className={`flex p-3.5 ${i % 2 === 0 ? '' : 'bg-slate-50 dark:bg-slate-900'}`}>
                    <span className="w-1/2 text-slate-500">{spec.name}</span>
                    <span className="w-1/2 text-slate-900 dark:text-white font-medium">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Customer Reviews */}
          {activeTab === 'reviews' && (
            <div className="space-y-10 max-w-4xl">
              
              {/* Rating Summary Bar */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 pb-4 md:pb-0 md:pr-6">
                  <span className="text-5xl font-black text-slate-900 dark:text-white font-['Outfit']">
                    {reviewsData.averageRating || '4.8'}
                  </span>
                  <div className="flex text-amber-400 my-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-xs text-slate-400">Based on {reviewsData.total} reviews</span>
                </div>

                {/* Breakdown Bars */}
                <div className="md:col-span-2 space-y-1.5 text-xs">
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const count = reviewsData.distribution?.[stars] || 0;
                    const percent = reviewsData.total > 0 ? (count / reviewsData.total) * 100 : stars === 5 ? 85 : 10;
                    return (
                      <div key={stars} className="flex items-center gap-2">
                        <span className="w-12 text-slate-500">{stars} Stars</span>
                        <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-400 rounded-full"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="w-8 text-right text-slate-400">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Review Submission Form */}
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Write a Verified Customer Review</h4>
                {reviewMessage && (
                  <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
                    {reviewMessage}
                  </div>
                )}
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Your Rating</label>
                    <div className="flex gap-1 cursor-pointer">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          type="button"
                          key={s}
                          onClick={() => setNewRating(s)}
                          className="p-1 hover:scale-110 transition-transform"
                        >
                          <Star className={`w-6 h-6 ${s <= newRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Review Headline</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Exceptional build quality and sound clarity"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 p-2.5 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Your Experience</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="What did you like or dislike about this product? How is the battery life, fit, or daily performance?"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 p-2.5 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={reviewSubmitting}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-colors disabled:opacity-50"
                  >
                    {reviewSubmitting ? 'Posting Review...' : 'Submit Review'}
                  </button>
                </form>
              </div>

              {/* Review List */}
              <div className="space-y-4">
                {reviewsData.data?.map((rev) => (
                  <div
                    key={rev._id}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={rev.user?.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                          alt={rev.user?.name}
                          className="w-9 h-9 rounded-full object-cover"
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">{rev.user?.name || 'Verified Customer'}</p>
                          <div className="flex items-center gap-2">
                            <div className="flex text-amber-400">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-3 h-3 ${i < rev.rating ? 'fill-amber-400' : 'text-slate-200'}`} />
                              ))}
                            </div>
                            {rev.isVerifiedPurchase && (
                              <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md">
                                Verified Purchase
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <span className="text-[11px] text-slate-400">
                        {new Date(rev.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>

                    <h5 className="text-sm font-bold text-slate-900 dark:text-white">{rev.title}</h5>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{rev.comment}</p>

                    <div className="pt-2 flex items-center gap-4 text-xs text-slate-500">
                      <button
                        onClick={() => handleHelpful(rev._id)}
                        className="flex items-center gap-1 hover:text-indigo-600 transition-colors"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>Helpful ({rev.helpfulCount || 0})</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

        </div>
      </div>

      {/* Related Products Carousel */}
      {relatedProducts.length > 0 && (
        <section className="pt-12 border-t border-slate-200 dark:border-slate-800 space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Recommended</span>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">Related Products</h3>
            </div>
            <Link to={`/category/${product.category?.slug}`} className="text-xs font-semibold text-indigo-600 hover:underline">
              View Category →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel._id} product={rel} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
};

export default ProductDetailPage;
