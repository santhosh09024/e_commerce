import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, ArrowUpDown, SearchX } from 'lucide-react';
import ProductCard from '../../components/product/ProductCard';
import ProductFilters from '../../components/product/ProductFilters';
import api from '../../services/api';

const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // State initialized from URL query params
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get('brand') || '');
  const [priceRange, setPriceRange] = useState(searchParams.get('maxPrice') || '350000');
  const [selectedRating, setSelectedRating] = useState(searchParams.get('rating') || '');
  const [inStockOnly, setInStockOnly] = useState(searchParams.get('inStock') === 'true');
  const [sortOption, setSortOption] = useState(searchParams.get('sort') || 'newest');
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page')) || 1);

  // Data states
  const [products, setProducts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Sync state if URL query params change (e.g. from Navbar search or category links)
  useEffect(() => {
    setKeyword(searchParams.get('keyword') || '');
    setSelectedCategory(searchParams.get('category') || '');
    setSelectedBrand(searchParams.get('brand') || '');
    if (searchParams.get('page')) setCurrentPage(Number(searchParams.get('page')));
  }, [searchParams]);

  // Fetch filter metadata (categories & brands)
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [catsRes, brandsRes] = await Promise.all([
          api.get('/categories'),
          api.get('/brands'),
        ]);
        if (catsRes.data.success) setCategories(catsRes.data.data);
        if (brandsRes.data.success) setBrands(brandsRes.data.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMeta();
  }, []);

  // Fetch filtered products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();

        if (keyword) params.append('keyword', keyword);
        if (selectedCategory) params.append('category', selectedCategory);
        if (selectedBrand) params.append('brand', selectedBrand);
        if (priceRange && Number(priceRange) < 350000) params.append('maxPrice', priceRange);
        if (selectedRating) params.append('rating', selectedRating);
        if (inStockOnly) params.append('inStock', 'true');
        if (sortOption) params.append('sort', sortOption);
        params.append('page', currentPage);
        params.append('limit', 12);

        // Reflect in browser URL without reloading
        setSearchParams(params, { replace: true });

        const res = await api.get(`/products?${params.toString()}`);
        if (res.data.success) {
          setProducts(res.data.data);
          setTotalCount(res.data.total);
          setTotalPages(res.data.pages);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [
    keyword,
    selectedCategory,
    selectedBrand,
    priceRange,
    selectedRating,
    inStockOnly,
    sortOption,
    currentPage,
  ]);

  const handleResetFilters = () => {
    setKeyword('');
    setSelectedCategory('');
    setSelectedBrand('');
    setPriceRange('350000');
    setSelectedRating('');
    setInStockOnly(false);
    setSortOption('newest');
    setCurrentPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Breadcrumbs & Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">
            {selectedCategory ? `${selectedCategory.toUpperCase()} Products` : 'All Products Catalog'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Showing <strong className="text-slate-800 dark:text-slate-200">{products.length}</strong> of{' '}
            <strong className="text-slate-800 dark:text-slate-200">{totalCount}</strong> items found
            {keyword && <span> for search query "<strong>{keyword}</strong>"</span>}
          </p>
        </div>

        {/* Sorting & Filter Toggle */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="lg:hidden flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200"
          >
            <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
            <span>Filters</span>
          </button>

          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl text-xs flex-1 sm:flex-none">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortOption}
              onChange={(e) => {
                setSortOption(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent border-none text-slate-700 dark:text-slate-200 focus:outline-none font-semibold cursor-pointer text-xs"
            >
              <option value="newest" className="dark:bg-slate-900">Newest Arrivals</option>
              <option value="price-low-high" className="dark:bg-slate-900">Price: Low to High</option>
              <option value="price-high-low" className="dark:bg-slate-900">Price: High to Low</option>
              <option value="highest-rated" className="dark:bg-slate-900">Highest Customer Rating</option>
              <option value="best-selling" className="dark:bg-slate-900">Best Selling Items</option>
              <option value="discount" className="dark:bg-slate-900">Biggest Discount %</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Catalog Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Filters (Desktop) */}
        <div className="hidden lg:block lg:col-span-1">
          <ProductFilters
            categories={categories}
            brands={brands}
            selectedCategory={selectedCategory}
            setSelectedCategory={(cat) => { setSelectedCategory(cat); setCurrentPage(1); }}
            selectedBrand={selectedBrand}
            setSelectedBrand={(b) => { setSelectedBrand(b); setCurrentPage(1); }}
            priceRange={priceRange}
            setPriceRange={(p) => { setPriceRange(p); setCurrentPage(1); }}
            selectedRating={selectedRating}
            setSelectedRating={(r) => { setSelectedRating(r); setCurrentPage(1); }}
            inStockOnly={inStockOnly}
            setInStockOnly={(stk) => { setInStockOnly(stk); setCurrentPage(1); }}
            onReset={handleResetFilters}
          />
        </div>

        {/* Mobile Filters Modal */}
        {showMobileFilters && (
          <div className="fixed inset-0 z-50 lg:hidden bg-slate-900/60 backdrop-blur-sm p-4 flex justify-end">
            <div className="w-full max-w-xs bg-white dark:bg-slate-900 h-full overflow-y-auto p-4 rounded-2xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-sm">Refine Search</h3>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="text-xs font-bold text-indigo-600"
                >
                  Done
                </button>
              </div>
              <ProductFilters
                categories={categories}
                brands={brands}
                selectedCategory={selectedCategory}
                setSelectedCategory={(cat) => { setSelectedCategory(cat); setCurrentPage(1); }}
                selectedBrand={selectedBrand}
                setSelectedBrand={(b) => { setSelectedBrand(b); setCurrentPage(1); }}
                priceRange={priceRange}
                setPriceRange={(p) => { setPriceRange(p); setCurrentPage(1); }}
                selectedRating={selectedRating}
                setSelectedRating={(r) => { setSelectedRating(r); setCurrentPage(1); }}
                inStockOnly={inStockOnly}
                setInStockOnly={(stk) => { setInStockOnly(stk); setCurrentPage(1); }}
                onReset={handleResetFilters}
              />
            </div>
          </div>
        )}

        {/* Product Grid */}
        <div className="lg:col-span-3 space-y-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-80 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 mx-auto">
                <SearchX className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white font-['Outfit']">No Matching Products Found</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Try loosening your filters, selecting a different brand or category, or clearing your keyword search.
              </p>
              <button
                onClick={handleResetFilters}
                className="bg-indigo-600 text-white text-xs font-bold px-6 py-2.5 rounded-full hover:bg-indigo-700 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 pt-6">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none"
              >
                Previous
              </button>

              {[...Array(totalPages)].map((_, i) => {
                const pNum = i + 1;
                return (
                  <button
                    key={pNum}
                    onClick={() => setCurrentPage(pNum)}
                    className={`w-9 h-9 rounded-xl text-xs font-bold transition-colors ${
                      currentPage === pNum
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {pNum}
                  </button>
                );
              })}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none"
              >
                Next
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default ShopPage;
