import React from 'react';
import { Filter, Star, X } from 'lucide-react';

const ProductFilters = ({
  categories = [],
  brands = [],
  selectedCategory,
  setSelectedCategory,
  selectedBrand,
  setSelectedBrand,
  priceRange,
  setPriceRange,
  selectedRating,
  setSelectedRating,
  inStockOnly,
  setInStockOnly,
  onReset,
}) => {
  return (
    <aside className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-6 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white font-['Outfit']">
          <Filter className="w-4 h-4 text-indigo-600" />
          <span>Filters</span>
        </div>
        <button
          onClick={onReset}
          className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
        >
          <X className="w-3 h-3" /> Reset All
        </button>
      </div>

      {/* Categories */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Categories</h4>
        <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
          <button
            onClick={() => setSelectedCategory('')}
            className={`w-full text-left text-xs py-1.5 px-2.5 rounded-lg transition-colors ${
              !selectedCategory
                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`w-full text-left text-xs py-1.5 px-2.5 rounded-lg transition-colors ${
                selectedCategory === cat.slug
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Brands */}
      <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Brands</h4>
        <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
          <button
            onClick={() => setSelectedBrand('')}
            className={`w-full text-left text-xs py-1.5 px-2.5 rounded-lg transition-colors ${
              !selectedBrand
                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            All Brands
          </button>
          {brands.map((b) => (
            <button
              key={b._id}
              onClick={() => setSelectedBrand(b.slug)}
              className={`w-full text-left text-xs py-1.5 px-2.5 rounded-lg transition-colors ${
                selectedBrand === b.slug
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {b.name}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Max Price</h4>
          <span className="text-xs font-bold text-slate-900 dark:text-white">
            ₹{Number(priceRange).toLocaleString('en-IN')}
          </span>
        </div>
        <input
          type="range"
          min="1000"
          max="350000"
          step="2000"
          value={priceRange}
          onChange={(e) => setPriceRange(e.target.value)}
          className="w-full accent-indigo-600 cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-slate-400">
          <span>₹1,000</span>
          <span>₹3,50,000</span>
        </div>
      </div>

      {/* Minimum Rating */}
      <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Rating</h4>
        <div className="space-y-1">
          {[4, 3, 2].map((r) => (
            <button
              key={r}
              onClick={() => setSelectedRating(selectedRating === r ? '' : r)}
              className={`w-full flex items-center gap-1.5 text-xs py-1.5 px-2.5 rounded-lg transition-colors ${
                selectedRating === r
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center text-amber-400">
                {[...Array(r)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                ))}
              </div>
              <span>& up</span>
            </button>
          ))}
        </div>
      </div>

      {/* Stock Availability Toggle */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
        <label className="flex items-center gap-2.5 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span>In Stock Items Only</span>
        </label>
      </div>

    </aside>
  );
};

export default ProductFilters;
