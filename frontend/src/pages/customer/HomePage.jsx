import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  Truck,
  ShieldCheck,
  RotateCcw,
  Clock,
  Flame,
  Star,
  ChevronRight,
  TrendingUp,
  Award,
} from 'lucide-react';
import ProductCard from '../../components/product/ProductCard';
import api from '../../services/api';

const HomePage = () => {
  const [banners, setBanners] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [flashSales, setFlashSales] = useState([]);
  const [loading, setLoading] = useState(true);

  // Countdown timer for flash sale
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 32, seconds: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [bannersRes, catsRes, brandsRes, trendingRes, bestRes, flashRes] = await Promise.all([
          api.get('/banners?type=home_hero'),
          api.get('/categories'),
          api.get('/brands'),
          api.get('/products?isTrending=true&limit=8'),
          api.get('/products?isBestSeller=true&limit=8'),
          api.get('/products?isFlashSale=true&limit=4'),
        ]);

        if (bannersRes.data.success) setBanners(bannersRes.data.data);
        if (catsRes.data.success) setCategories(catsRes.data.data);
        if (brandsRes.data.success) setBrands(brandsRes.data.data);
        if (trendingRes.data.success) setTrendingProducts(trendingRes.data.data);
        if (bestRes.data.success) setBestSellers(bestRes.data.data);
        if (flashRes.data.success) setFlashSales(flashRes.data.data);
      } catch (err) {
        console.error('Homepage fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Auto-advance banner slide
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [banners.length]);

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      
      {/* Hero Banner Carousel */}
      <section className="relative overflow-hidden bg-slate-900 text-white min-h-[480px] sm:min-h-[560px] flex items-center">
        {banners.length > 0 ? (
          banners.map((banner, index) => (
            <div
              key={banner._id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              {/* Background with overlay */}
              <img
                src={banner.image}
                alt={banner.title}
                className="w-full h-full object-cover object-center brightness-[0.45]"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/60 to-transparent flex items-center">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                  <div className="max-w-2xl space-y-6">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Curated Luxury & Tech
                    </span>
                    <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight font-['Outfit']">
                      {banner.title}
                    </h1>
                    <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
                      {banner.subtitle}
                    </p>
                    <div className="flex flex-wrap gap-4 pt-2">
                      <Link
                        to={banner.link || '/shop'}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-full font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-transform hover:scale-105"
                      >
                        <span>{banner.buttonText || 'Shop Collection'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                      <Link
                        to="/shop?discount=20"
                        className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 px-8 py-3.5 rounded-full font-bold text-sm transition-colors"
                      >
                        Special Offers
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="max-w-7xl mx-auto px-4 py-24 text-center w-full">
            <h1 className="text-4xl sm:text-6xl font-black font-['Outfit']">Modern E-Commerce Redefined</h1>
            <p className="text-slate-400 mt-4 max-w-xl mx-auto">Discover top-tier tech, athletic apparel, and Scandinavian home interiors.</p>
            <Link to="/shop" className="inline-block mt-8 bg-indigo-600 text-white px-8 py-3.5 rounded-full font-bold">Explore Catalog</Link>
          </div>
        )}

        {/* Carousel indicators */}
        {banners.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`h-2 rounded-full transition-all ${
                  i === currentSlide ? 'w-8 bg-indigo-500' : 'w-2 bg-white/40'
                }`}
              />
            ))}
          </div>
        )}
      </section>

      {/* Value Propositions Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 sm:-mt-12 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-4 p-2">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center flex-shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Free Express Shipping</h4>
              <p className="text-xs text-slate-500">Orders above ₹999 delivered fast</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-2">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">100% Genuine Guarantee</h4>
              <p className="text-xs text-slate-500">Authorized brand distributors</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-2">
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center flex-shrink-0">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">7-Day Easy Returns</h4>
              <p className="text-xs text-slate-500">No questions asked refunds</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-2">
            <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Razorpay & COD</h4>
              <p className="text-xs text-slate-500">Safe, verified payments</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Discover</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">
              Featured Categories
            </h2>
          </div>
          <Link to="/shop" className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {categories.slice(0, 6).map((cat) => (
            <Link
              key={cat._id}
              to={`/category/${cat.slug}`}
              className="group relative rounded-2xl overflow-hidden aspect-[4/5] bg-slate-100 dark:bg-slate-800 shadow-sm hover:shadow-lg transition-all"
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500 brightness-90 group-hover:brightness-75"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex flex-col justify-end p-4 text-white">
                <span className="text-sm font-bold font-['Outfit'] group-hover:text-indigo-300 transition-colors">{cat.name}</span>
                <span className="text-[11px] text-slate-300">{cat.subcategories?.length || 0} subcategories</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Flash Sale Section with Countdown */}
      {flashSales.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-rose-600 via-rose-700 to-amber-600 rounded-3xl p-6 sm:p-10 text-white shadow-2xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
              <div>
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-amber-300 animate-bounce" />
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-200">Limited Time Only</span>
                </div>
                <h3 className="text-2xl sm:text-4xl font-black font-['Outfit'] mt-1">Flash Deal Countdown</h3>
              </div>

              {/* Countdown Clocks */}
              <div className="flex items-center gap-3 font-mono">
                <div className="bg-black/30 backdrop-blur-md px-4 py-2 rounded-xl text-center">
                  <span className="text-xl sm:text-2xl font-bold">{String(timeLeft.hours).padStart(2, '0')}</span>
                  <span className="block text-[10px] uppercase text-rose-200">Hours</span>
                </div>
                <span className="text-xl font-bold">:</span>
                <div className="bg-black/30 backdrop-blur-md px-4 py-2 rounded-xl text-center">
                  <span className="text-xl sm:text-2xl font-bold">{String(timeLeft.minutes).padStart(2, '0')}</span>
                  <span className="block text-[10px] uppercase text-rose-200">Mins</span>
                </div>
                <span className="text-xl font-bold">:</span>
                <div className="bg-black/30 backdrop-blur-md px-4 py-2 rounded-xl text-center">
                  <span className="text-xl sm:text-2xl font-bold">{String(timeLeft.seconds).padStart(2, '0')}</span>
                  <span className="block text-[10px] uppercase text-rose-200">Secs</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {flashSales.map((product) => (
                <div key={product._id} className="text-slate-900">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Trending Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              <TrendingUp className="w-4 h-4" />
              <span>Trending This Week</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-['Outfit'] mt-1">
              Most Popular Products
            </h2>
          </div>
          <Link to="/shop?isTrending=true" className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
            <span>Explore All</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trendingProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      {/* Brand Logos Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-100 dark:bg-slate-900/60 rounded-3xl p-8 sm:p-12 text-center space-y-6">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Authorized Brand Partners</span>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 items-center">
            {brands.map((brand) => (
              <Link
                key={brand._id}
                to={`/brand/${brand.slug}`}
                className="p-4 rounded-xl bg-white dark:bg-slate-800 hover:shadow-md transition-all flex flex-col items-center justify-center gap-2 group"
              >
                <img src={brand.logo} alt={brand.name} className="w-12 h-12 object-cover rounded-full group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{brand.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Best Sellers Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              <Award className="w-4 h-4" />
              <span>Verified Top Sellers</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-['Outfit'] mt-1">
              Customer Favorites
            </h2>
          </div>
          <Link to="/shop?isBestSeller=true" className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestSellers.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      {/* Customer Testimonials Carousel / Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Real Reviews</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-['Outfit'] mt-1">
            Loved By Thousands of Shoppers
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic">
              "The iPhone 15 Pro arrived within 48 hours in immaculate packaging. The Razorpay checkout was seamless and the verified warranty card was inside. Phenomenal experience!"
            </p>
            <div className="flex items-center gap-3 pt-2">
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80" alt="Customer" className="w-10 h-10 rounded-full object-cover" />
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Rahul Sharma</p>
                <p className="text-[10px] text-slate-400">Verified Buyer • Bengaluru</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic">
              "The Sony WH-1000XM5 headphones completely changed my work from home experience. Active Noise Cancelling is pure magic. I also used coupon WELCOME10 for an extra discount!"
            </p>
            <div className="flex items-center gap-3 pt-2">
              <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80" alt="Customer" className="w-10 h-10 rounded-full object-cover" />
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Priya Patel</p>
                <p className="text-[10px] text-slate-400">Verified Buyer • Mumbai</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic">
              "Ordered the solid teak wood dining table and Nordic velvet armchair. Quality of carpentry and fabrics is 10/10. Live delivery tracking kept me informed every step."
            </p>
            <div className="flex items-center gap-3 pt-2">
              <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80" alt="Customer" className="w-10 h-10 rounded-full object-cover" />
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Arjun Nair</p>
                <p className="text-[10px] text-slate-400">Verified Buyer • Gurugram</p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;
