import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ChevronDown, Menu } from 'lucide-react';
// import { mockProducts } from '../data/mockData';
// import { useCurrency } from '../context/CurrencyContext';
// import { useCart } from '../context/CartContext';
// import { useWishlist } from '../context/WishlistContext';
import { getProducts, Product, getCategories, Category } from '../services/productService';
// @ts-expect-error: ProductCard is a JS file with no type declaration
import ProductCard from '../components/ProductCard';
import Skeleton from '../components/ui/Skeleton';

function getQueryParams(search: string) {
  const params = new URLSearchParams(search);
  return {
    category: params.get('category'),
    season: params.get('season'),
    sort: params.get('sort'),
  };
}

// Extend Product type locally to include available_sizes and sale_percent
type ProductWithSizes = Product & { available_sizes?: string[], sale_percent?: number };

const ProductsPage = () => {
  const location = useLocation();
  const query = getQueryParams(location.search);

  const [filters, setFilters] = useState({
    availability: [] as string[],
    priceMin: '',
    priceMax: '',
    sizes: [] as string[],
    categories: [] as string[],
    seasons: [] as string[],
    colors: [] as string[],
  });
  const [sortBy, setSortBy] = useState('no-sort');
  const [collapsed, setCollapsed] = useState({
    availability: true,
    price: true,
    size: true,
    category: true,
    season: true,
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // const { currency } = useCurrency();
  // const conversionRate = 50; // 1 USD = 50 EGP
  // const { addItem } = useCart();
  // const { items: wishlistItems, addItem: addWishlistItem } = useWishlist();

  // Fetch products from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Build API parameters
        const apiParams: { category_slug?: string } = {};
        if (filters.categories.length > 0) {
          apiParams.category_slug = filters.categories[0];
        }
        
        const [fetchedProducts, fetchedCategories] = await Promise.all([
          getProducts(apiParams),
          getCategories()
        ]);
        setProducts(fetchedProducts);
        setCategories(fetchedCategories);
      } catch {
        setError('Failed to load data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters.categories]); // Re-fetch when category filter changes

  // Set initial filters from query params
  useEffect(() => {
    const newFilters = { ...filters };
    if (query.category) {
      newFilters.categories = [query.category];
    }
    if (query.season) {
      newFilters.seasons = [query.season];
    }
    setFilters(newFilters);
    if (query.sort) setSortBy(query.sort);
    // eslint-disable-next-line
  }, [location.search]);

  const handleFilterChange = (type: 'availability' | 'sizes' | 'categories' | 'seasons' | 'colors', value: string) => {
    setFilters(prev => ({
      ...prev,
      [type]: prev[type].includes(value)
        ? (prev[type] as string[]).filter((item: string) => item !== value)
        : [...(prev[type] as string[]), value]
    }));
  };

  type FilterSection = 'availability' | 'price' | 'size' | 'category' | 'season';
  const toggleCollapse = (section: FilterSection) => {
    setCollapsed(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Helper to filter products
  const filteredProducts = products
    .filter(product => {
      // Category filter
      if (filters.categories.length > 0 && !filters.categories.includes(product.category?.slug || '')) return false;
      // Season filter
      if (filters.seasons.length > 0 && !filters.seasons.includes((product as { season?: string }).season || '')) return false;
      // Availability filter
      if (filters.availability.length > 0) {
        if (filters.availability.includes('in-stock') && !product.in_stock) return false;
        if (filters.availability.includes('out-of-stock') && product.in_stock) return false;
      }
      // Price filter
      if (filters.priceMin && Number(product.price) < Number(filters.priceMin)) return false;
      if (filters.priceMax && Number(product.price) > Number(filters.priceMax)) return false;
      // Size filter - use available_sizes from API
      if (filters.sizes && filters.sizes.length > 0 && Array.isArray(product.available_sizes)) {
        if (!filters.sizes.some(size => product.available_sizes?.includes(size))) return false;
      }
      // Color filter - use available_colors from API
      if (filters.colors && filters.colors.length > 0 && Array.isArray(product.available_colors)) {
        if (!filters.colors.some(color => product.available_colors?.includes(color))) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'price-low') return Number(a.price) - Number(b.price);
      if (sortBy === 'price-high') return Number(b.price) - Number(a.price);
      if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === 'featured' || sortBy === 'top-selling') return ((b as { rating?: number }).rating || 0) - ((a as { rating?: number }).rating || 0); // Sort by rating descending
      return 0; // 'no-sort' or default
    });

  // Prevent body scroll when filters sidebar is open
  useEffect(() => {
    if (showMobileFilters) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [showMobileFilters]);

  // Helper: Get unique colors and sizes for a given category from products
  const getUniqueColorsForCategory = (categorySlug: string) => {
    const colors = new Set<string>();
    products.filter(p => p.category?.slug === categorySlug).forEach(p => {
      (p.available_colors || []).forEach(c => colors.add(c));
    });
    return Array.from(colors);
  };
  const getUniqueSizesForCategory = (categorySlug: string) => {
    const sizes = new Set<string>();
    products.filter(p => p.category?.slug === categorySlug).forEach(p => {
      (p.available_sizes || []).forEach(s => sizes.add(s));
    });
    return Array.from(sizes);
  };

  const handleCategorySelect = (category: string) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories[0] === category ? [] : [category],
      colors: [],
      sizes: [],
    }));
  };

  if (loading) {
    return (
      <div className="relative z-20 min-h-screen pt-4 sm:pt-8 pb-8">
        <div className="px-4 mx-auto max-w-7xl lg:px-8">
          <div className="flex flex-col gap-8 lg:flex-row">
            {/* Sidebar skeleton */}
            <div className="hidden lg:block lg:w-1/4">
              <div className="p-6 pb-4 rounded-lg border backdrop-blur-xl bg-white/20 dark:bg-black/20 border-zinc-400/50 dark:border-zinc-700/50">
                <Skeleton className="h-8 w-1/2 mb-8" />
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="mb-8">
                    <Skeleton className="h-6 w-3/4 mb-4" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                ))}
              </div>
            </div>
            {/* Product grid skeleton */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-2xl shadow-xl bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md border border-zinc-200 dark:border-zinc-700 pb-12 w-full mx-auto min-h-[320px] sm:min-h-[340px]">
                  <Skeleton className="w-full aspect-[4/5] rounded-t-2xl mb-4" />
                  <div className="p-2 sm:p-4">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-2" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-20 min-h-screen pt-4 sm:pt-8 pb-8">
      <div className="px-4 mx-auto max-w-7xl lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-black dark:text-white">Products</h1>
          {/* Mobile filter button */}
          <button
            className="flex gap-2 items-center px-4 py-2 text-black rounded-lg border shadow lg:hidden bg-zinc-200 dark:bg-zinc-800 dark:text-white border-zinc-300 dark:border-zinc-700"
            onClick={() => setShowMobileFilters(true)}
          >
            <Menu className="w-5 h-5" />
            Filters
          </button>
        </div>
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Filters Sidebar */}
          {/* Desktop sidebar */}
          <div className="hidden lg:block lg:w-1/4">
            <div className="p-6 pb-4 rounded-lg border backdrop-blur-xl bg-white/20 dark:bg-black/20 border-zinc-400/50 dark:border-zinc-700/50">
              <h2 className="mb-8 text-xl font-semibold text-black dark:text-white">Filter</h2>
              
              {/* Category (with color/size for each) - Desktop */}
              <div className="mb-8">
                <button
                  type="button"
                  className="flex justify-between items-center mb-4 w-full"
                  onClick={() => toggleCollapse('category')}
                >
                  <h3 className="font-semibold text-black dark:text-white">Category</h3>
                  <ChevronDown className={`h-5 w-5 text-zinc-900 dark:text-zinc-300 transition-transform ${collapsed.category ? 'rotate-180' : ''}`} />
                </button>
                <div
                  className={`transition-all duration-500 ease overflow-hidden ${collapsed.category ? 'max-h-0 opacity-0 pointer-events-none' : 'max-h-[500px] opacity-100 pointer-events-auto'}`}
                >
                  <div className="space-y-6">
                    {categories.map(category => (
                      <div key={category.id}>
                        <label className="flex items-center font-semibold text-zinc-900 dark:text-zinc-200">
                          <input
                            type="checkbox"
                            className="mr-2 bg-zinc-700 border-zinc-600"
                            checked={filters.categories[0] === category.slug}
                            onChange={() => handleCategorySelect(category.slug)}
                          />
                          {category.name}
                        </label>
                        {filters.categories[0] === category.slug && (
                          <>
                            <div className="flex flex-wrap gap-2 mt-2 ml-8">
                              {getUniqueColorsForCategory(category.slug).map(color => (
                                <label key={color} className="flex items-center text-zinc-900 dark:text-zinc-300">
                                  <input
                                    type="checkbox"
                                    className="mr-1 bg-zinc-700 border-zinc-600"
                                    checked={filters.colors?.includes(color)}
                                    onChange={() => handleFilterChange('colors', color)}
                                  />
                                  <span className="capitalize">{color}</span>
                                </label>
                              ))}
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2 ml-8">
                              {getUniqueSizesForCategory(category.slug).map(size => (
                                <label key={size} className="flex items-center text-zinc-900 dark:text-zinc-300">
                                  <input
                                    type="checkbox"
                                    className="mr-1 bg-zinc-700 border-zinc-600"
                                    checked={filters.sizes?.includes(size)}
                                    onChange={() => handleFilterChange('sizes', size)}
                                  />
                                  <span>{size}</span>
                                </label>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Price */}
              <div className="mb-8">
                <button
                  type="button"
                  className="flex justify-between items-center mb-4 w-full"
                  onClick={() => toggleCollapse('price')}
                >
                  <h3 className="font-semibold text-black dark:text-white">Price</h3>
                  <ChevronDown className={`h-5 w-5 text-zinc-900 dark:text-zinc-300 transition-transform ${collapsed.price ? 'rotate-180' : ''}`} />
                </button>
                <div
                  className={`transition-all duration-500 ease overflow-hidden ${collapsed.price ? 'max-h-0 opacity-0 pointer-events-none' : 'max-h-[100px] opacity-100 pointer-events-auto'}`}
                >
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      className="px-3 py-2 w-20 text-black rounded border bg-zinc-100 dark:bg-zinc-700 placeholder:text-black dark:placeholder:text-white dark:text-white border-zinc-600/50 dark:border-zinc-500"
                      value={filters.priceMin}
                      onChange={(e) => setFilters(prev => ({ ...prev, priceMin: e.target.value }))}
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      className="px-3 py-2 w-20 text-black rounded border bg-zinc-100 dark:bg-zinc-700 placeholder:text-black dark:placeholder:text-white dark:text-white border-zinc-600/50 dark:border-zinc-500"
                      value={filters.priceMax}
                      onChange={(e) => setFilters(prev => ({ ...prev, priceMax: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              {/* Size */}
              <div className='mb-8'>
                <button
                  type="button"
                  className="flex justify-between items-center mb-4 w-full"
                  onClick={() => toggleCollapse('size')}
                >
                  <h3 className="font-semibold text-black dark:text-white">Size</h3>
                  <ChevronDown className={`h-5 w-5 text-zinc-900 dark:text-zinc-300 transition-transform ${collapsed.size ? 'rotate-180' : ''}`} />
                </button>
                <div
                  className={`transition-all duration-500 ease overflow-hidden ${collapsed.size ? 'max-h-0 opacity-0 pointer-events-none' : 'max-h-[200px] opacity-100 pointer-events-auto'}`}
                >
                  <div className="space-y-2">
                    {['Small (S)', 'Medium (M)', 'Large (L)', 'Extra large (XL)'].map((size) => (
                      <label key={size} className="flex items-center text-zinc-900 dark:text-zinc-300">
                        <input 
                          type="checkbox" 
                          className="mr-2 bg-zinc-700 border-zinc-600"
                          onChange={() => handleFilterChange('sizes', size)}
                        />
                        {size}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Products List */}
          <div className="flex-1">
            <div className="flex justify-between items-center p-6 mb-6 rounded-lg border backdrop-blur-xl bg-white/20 dark:bg-black/20 border-zinc-400/50 dark:border-zinc-700/50">
              <span className="text-zinc-900 dark:text-zinc-300">{loading || error ? 0 : filteredProducts.length} products</span>
            </div>
            {loading ? (
              <div className="py-20 text-center text-zinc-500">Loading products...</div>
            ) : error ? (
              <div className="py-20 text-center text-red-500">{error}</div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:gap-6 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
                {filteredProducts.map((product: ProductWithSizes) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-[120] flex">
          <div className="overflow-y-auto p-6 w-4/5 max-w-xs h-full bg-white border-r shadow-2xl dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-black dark:text-white">Filter</h2>
              <button
                className="text-black dark:text-white hover:text-[#059669] text-2xl"
                onClick={() => setShowMobileFilters(false)}
              >
                &times;
              </button>
            </div>
            {/* Sort By Dropdown (mobile only) */}
            <div className="mb-8">
              <label htmlFor="sortByMobile" className="block mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">Sort By</label>
              <select
                id="sortByMobile"
                className="px-3 py-2 w-full text-black rounded border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 dark:text-white"
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
              >
                <option value="no-sort">No Sort</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">Newest</option>
                <option value="featured">Featured</option>
                <option value="top-selling">Top Selling</option>
              </select>
            </div>
            {/* Filters content (same as desktop) */}
            {/* Category (with color/size for each) - Mobile */}
            <div className="mb-8">
              <button
                type="button"
                className="flex justify-between items-center mb-4 w-full"
                onClick={() => toggleCollapse('category')}
              >
                <h3 className="font-semibold text-black dark:text-white">Category</h3>
                <ChevronDown className={`h-5 w-5 text-zinc-900 dark:text-zinc-300 transition-transform ${collapsed.category ? 'rotate-180' : ''}`} />
              </button>
              <div
                className={`transition-all duration-500 ease overflow-hidden ${collapsed.category ? 'max-h-0 opacity-0 pointer-events-none' : 'max-h-[500px] opacity-100 pointer-events-auto'}`}
              >
                <div className="space-y-6">
                  {categories.map(category => (
                    <div key={category.id}>
                      <label className="flex items-center font-semibold text-zinc-900 dark:text-zinc-200">
                        <input
                          type="checkbox"
                          className="mr-2 bg-zinc-700 border-zinc-600"
                          checked={filters.categories[0] === category.slug}
                          onChange={() => handleCategorySelect(category.slug)}
                        />
                        {category.name}
                      </label>
                      {filters.categories[0] === category.slug && (
                        <>
                          <div className="flex flex-wrap gap-2 mt-2 ml-8">
                            {getUniqueColorsForCategory(category.slug).map(color => (
                              <label key={color} className="flex items-center text-zinc-900 dark:text-zinc-300">
                                <input
                                  type="checkbox"
                                  className="mr-1 bg-zinc-700 border-zinc-600"
                                  checked={filters.colors?.includes(color)}
                                  onChange={() => handleFilterChange('colors', color)}
                                />
                                <span className="capitalize">{color}</span>
                              </label>
                            ))}
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2 ml-8">
                            {getUniqueSizesForCategory(category.slug).map(size => (
                              <label key={size} className="flex items-center text-zinc-900 dark:text-zinc-300">
                                <input
                                  type="checkbox"
                                  className="mr-1 bg-zinc-700 border-zinc-600"
                                  checked={filters.sizes?.includes(size)}
                                  onChange={() => handleFilterChange('sizes', size)}
                                />
                                <span>{size}</span>
                              </label>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Price filter for mobile */}
            <div className="mb-8">
              <button
                type="button"
                className="flex justify-between items-center mb-4 w-full"
                onClick={() => toggleCollapse('price')}
              >
                <h3 className="font-semibold text-black dark:text-white">Price</h3>
                <ChevronDown className={`h-5 w-5 text-zinc-900 dark:text-zinc-300 transition-transform ${collapsed.price ? 'rotate-180' : ''}`} />
              </button>
              <div className={`transition-all duration-500 ease overflow-hidden ${collapsed.price ? 'max-h-0 opacity-0 pointer-events-none' : 'max-h-[100px] opacity-100 pointer-events-auto'}`}>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    className="px-3 py-2 w-20 text-black rounded border bg-zinc-100 dark:bg-zinc-700 placeholder:text-black dark:placeholder:text-white dark:text-white border-zinc-600/50 dark:border-zinc-500"
                    value={filters.priceMin}
                    onChange={(e) => setFilters(prev => ({ ...prev, priceMin: e.target.value }))}
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    className="px-3 py-2 w-20 text-black rounded border bg-zinc-100 dark:bg-zinc-700 placeholder:text-black dark:placeholder:text-white dark:text-white border-zinc-600/50 dark:border-zinc-500"
                    value={filters.priceMax}
                    onChange={(e) => setFilters(prev => ({ ...prev, priceMax: e.target.value }))}
                  />
                </div>
              </div>
            </div>
            {/* Size filter for mobile, only show if a category is selected */}
            {filters.categories.length > 0 && (
              <div className="mb-8">
                <button
                  type="button"
                  className="flex justify-between items-center mb-4 w-full"
                  onClick={() => toggleCollapse('size')}
                >
                  <h3 className="font-semibold text-black dark:text-white">Size</h3>
                  <ChevronDown className={`h-5 w-5 text-zinc-900 dark:text-zinc-300 transition-transform ${collapsed.size ? 'rotate-180' : ''}`} />
                </button>
                <div className={`transition-all duration-500 ease overflow-hidden ${collapsed.size ? 'max-h-0 opacity-0 pointer-events-none' : 'max-h-[200px] opacity-100 pointer-events-auto'}`}>
                  <div className="space-y-2">
                    {getUniqueSizesForCategory(filters.categories[0]).map(size => (
                      <label key={size} className="flex items-center text-zinc-900 dark:text-zinc-300">
                        <input
                          type="checkbox"
                          className="mr-2 bg-zinc-700 border-zinc-600"
                          checked={filters.sizes?.includes(size)}
                          onChange={() => handleFilterChange('sizes', size)}
                        />
                        {size}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* Overlay click to close */}
          <div className="flex-1 h-full bg-black bg-opacity-40" onClick={() => setShowMobileFilters(false)} />
        </div>
      )}
    </div>
  );
};

export default ProductsPage;