import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Star, ChevronDown, Heart } from 'lucide-react';
import { mockProducts } from '../data/mockData';
import { useCurrency } from '../context/CurrencyContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

function getQueryParams(search: string) {
  const params = new URLSearchParams(search);
  return {
    category: params.get('category'),
    season: params.get('season'),
    sort: params.get('sort'),
  };
}

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
  });
  const [sortBy, setSortBy] = useState('featured');
  const [collapsed, setCollapsed] = useState({
    availability: true,
    price: true,
    size: true,
    category: true,
    season: true,
  });

  const { currency } = useCurrency();
  const conversionRate = 50; // 1 USD = 50 EGP
  const { addItem } = useCart();
  const { items: wishlistItems, addItem: addWishlistItem } = useWishlist();

  // Set initial filters from query params
  useEffect(() => {
    let newFilters = { ...filters };
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

  const getDisplayPrice = (price: number) => {
    if (currency === 'USD') {
      return `USD ${(price / conversionRate).toFixed(2)}`;
    }
    return `LE ${price}`;
  };

  const handleFilterChange = (type: 'availability' | 'sizes' | 'categories' | 'seasons', value: string) => {
    setFilters(prev => ({
      ...prev,
      [type]: prev[type].includes(value)
        ? (prev[type] as string[]).filter((item: string) => item !== value)
        : [...(prev[type] as string[]), value]
    }));
  };

  const toggleCollapse = (section: 'availability' | 'price' | 'size' | 'category' | 'season') => {
    setCollapsed(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Helper to filter products
  const filteredProducts = mockProducts
    .filter(product => {
      // Category filter
      if (filters.categories.length > 0 && !filters.categories.includes(product.category)) return false;
      // Season filter
      if (filters.seasons.length > 0 && !filters.seasons.includes(product.season)) return false;
      // Availability filter
      if (filters.availability.length > 0) {
        if (filters.availability.includes('in-stock') && !product.inStock) return false;
        if (filters.availability.includes('out-of-stock') && product.inStock) return false;
      }
      // Price filter
      if (filters.priceMin && product.price < Number(filters.priceMin)) return false;
      if (filters.priceMax && product.price > Number(filters.priceMax)) return false;
      // Size filter
      if (filters.sizes.length > 0 && !filters.sizes.some(size => product.sizes?.includes(size))) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'newest') return b.id - a.id;
      return 0; // featured or default
    });

  const handleQuickAdd = (product: typeof mockProducts[0]) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price, // always store in EGP
      color: product.colors[0],
      size: product.sizes[0],
    });
  };

  const handleQuickWishlist = (product: typeof mockProducts[0]) => {
    addWishlistItem({
      id: product.id,
      name: product.name,
      price: product.price,
      color: product.colors[0],
      size: product.sizes[0],
    });
  };

  const isInWishlist = (product: typeof mockProducts[0]) =>
    wishlistItems.some(
      (item) => item.id === product.id && item.color === product.colors[0] && item.size === product.sizes[0]
    );

  return (
    <div className="relative z-20 min-h-screen pt-[125px] py-8">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <h1 className="text-3xl font-bold text-black dark:text-white mb-8">Products</h1>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            <div className=" backdrop-blur-xl bg-white/20 dark:bg-black/20 rounded-lg p-6 pb-4 border border-zinc-400/50 dark:border-zinc-700/50">
              <h2 className="text-xl font-semibold text-black dark:text-white mb-8">Filter</h2>
              
              {/* Category */}
              <div className="mb-8">
                <button
                  type="button"
                  className="flex items-center justify-between w-full mb-4"
                  onClick={() => toggleCollapse('category' as any)}
                >
                  <h3 className="text-black dark:text-white font-semibold">Category</h3>
                  <ChevronDown className={`h-5 w-5 text-zinc-900 dark:text-zinc-300 transition-transform ${collapsed.category ? 'rotate-180' : ''}`} />
                </button>
                <div
                  className={`transition-all duration-500 ease overflow-hidden ${collapsed.category ? 'max-h-0 opacity-0 pointer-events-none' : 'max-h-[500px] opacity-100 pointer-events-auto'}`}
                >
                  <div className="space-y-2">
                    <div>
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">T-Shirts</span>
                      <label className="flex items-center text-zinc-900 dark:text-zinc-300 ml-4">
                        <input
                          type="checkbox"
                          className="mr-2 bg-zinc-700 border-zinc-600"
                          checked={filters.categories.includes('tshirts-graphic')}
                          onChange={() => handleFilterChange('categories', 'tshirts-graphic')}
                        />
                        Graphic Tees
                      </label>
                      <label className="flex items-center text-zinc-900 dark:text-zinc-300 ml-4">
                        <input
                          type="checkbox"
                          className="mr-2 bg-zinc-700 border-zinc-600"
                          checked={filters.categories.includes('tshirts-basic')}
                          onChange={() => handleFilterChange('categories', 'tshirts-basic')}
                        />
                        Basic Tees
                      </label>
                    </div>
                    <div className="mt-2">
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">Bottoms</span>
                      <label className="flex items-center text-zinc-900 dark:text-zinc-300 ml-4">
                        <input
                          type="checkbox"
                          className="mr-2 bg-zinc-700 border-zinc-600"
                          checked={filters.categories.includes('bottoms-pants')}
                          onChange={() => handleFilterChange('categories', 'bottoms-pants')}
                        />
                        Pants
                      </label>
                      <label className="flex items-center text-zinc-900 dark:text-zinc-300 ml-4">
                        <input
                          type="checkbox"
                          className="mr-2 bg-zinc-700 border-zinc-600"
                          checked={filters.categories.includes('bottoms-shorts')}
                          onChange={() => handleFilterChange('categories', 'bottoms-shorts')}
                        />
                        Shorts
                      </label>
                      <label className="flex items-center text-zinc-900 dark:text-zinc-300 ml-4">
                        <input
                          type="checkbox"
                          className="mr-2 bg-zinc-700 border-zinc-600"
                          checked={filters.categories.includes('bottoms-jeans')}
                          onChange={() => handleFilterChange('categories', 'bottoms-jeans')}
                        />
                        Jeans
                      </label>
                    </div>
                    <div className="mt-2">
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">Shoes</span>
                      <label className="flex items-center text-zinc-900 dark:text-zinc-300 ml-4">
                        <input
                          type="checkbox"
                          className="mr-2 bg-zinc-700 border-zinc-600"
                          checked={filters.categories.includes('shoes')}
                          onChange={() => handleFilterChange('categories', 'shoes')}
                        />
                        Shoes
                      </label>
                    </div>
                    <div className="mt-2">
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">Sets</span>
                      <label className="flex items-center text-zinc-900 dark:text-zinc-300 ml-4">
                        <input
                          type="checkbox"
                          className="mr-2 bg-zinc-700 border-zinc-600"
                          checked={filters.categories.includes('sets')}
                          onChange={() => handleFilterChange('categories', 'sets')}
                        />
                        Sets
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Availability */}
              <div className="mb-8">
                <button
                  type="button"
                  className="flex items-center justify-between w-full mb-4"
                  onClick={() => toggleCollapse('availability')}
                >
                  <h3 className="text-black dark:text-white font-semibold">Availability</h3>
                  <ChevronDown className={`h-5 w-5 text-zinc-900 dark:text-zinc-300 transition-transform ${collapsed.availability ? 'rotate-180' : ''}`} />
                </button>
                <div
                  className={`transition-all duration-500 ease overflow-hidden ${collapsed.availability ? 'max-h-0 opacity-0 pointer-events-none' : 'max-h-[200px] opacity-100 pointer-events-auto'}`}
                >
                  <div className="space-y-2">
                    <label className="flex items-center text-zinc-900 dark:text-zinc-300">
                      <input 
                        type="checkbox" 
                        className="mr-2 bg-zinc-700 border-zinc-600"
                        onChange={() => handleFilterChange('availability', 'in-stock')}
                      />
                      In stock
                    </label>
                    <label className="flex items-center text-zinc-900 dark:text-zinc-300">
                      <input 
                        type="checkbox" 
                        className="mr-2 bg-zinc-700 border-zinc-600"
                        onChange={() => handleFilterChange('availability', 'out-of-stock')}
                      />
                      Out of stock
                    </label>
                  </div>
                </div>
              </div>

              {/* Price */}
              <div className="mb-8">
                <button
                  type="button"
                  className="flex items-center justify-between w-full mb-4"
                  onClick={() => toggleCollapse('price')}
                >
                  <h3 className="text-black dark:text-white font-semibold">Price</h3>
                  <ChevronDown className={`h-5 w-5 text-zinc-900 dark:text-zinc-300 transition-transform ${collapsed.price ? 'rotate-180' : ''}`} />
                </button>
                <div
                  className={`transition-all duration-500 ease overflow-hidden ${collapsed.price ? 'max-h-0 opacity-0 pointer-events-none' : 'max-h-[100px] opacity-100 pointer-events-auto'}`}
                >
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      className="bg-zinc-100 dark:bg-zinc-700 placeholder:text-black dark:placeholder:text-white text-black dark:text-white px-3 py-2 rounded border border-zinc-600/50 dark:border-zinc-500 w-20"
                      value={filters.priceMin}
                      onChange={(e) => setFilters(prev => ({ ...prev, priceMin: e.target.value }))}
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      className="bg-zinc-100 dark:bg-zinc-700 placeholder:text-black dark:placeholder:text-white text-black dark:text-white px-3 py-2 rounded border border-zinc-600/50 dark:border-zinc-500 w-20"
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
                  className="flex items-center justify-between w-full mb-4"
                  onClick={() => toggleCollapse('size')}
                >
                  <h3 className="text-black dark:text-white font-semibold">Size</h3>
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

              {/* Season */}
              <div className="">
                <button
                  type="button"
                  className="flex items-center justify-between w-full mb-4"
                  onClick={() => toggleCollapse('season' as any)}
                >
                  <h3 className="text-black dark:text-white font-semibold">Season</h3>
                  <ChevronDown className={`h-5 w-5 text-zinc-900 dark:text-zinc-300 transition-transform ${collapsed.season ? 'rotate-180' : ''}`} />
                </button>
                <div
                  className={`transition-all duration-500 ease overflow-hidden ${collapsed.season ? 'max-h-0 opacity-0 pointer-events-none' : 'max-h-[100px] opacity-100 pointer-events-auto'}`}
                >
                  <div className="space-y-2">
                    <label className="flex items-center text-zinc-900 dark:text-zinc-300 ml-4">
                      <input
                        type="checkbox"
                        className="mr-2 bg-zinc-700 border-zinc-600"
                        checked={filters.seasons.includes('summer')}
                        onChange={() => handleFilterChange('seasons', 'summer')}
                      />
                      Summer
                    </label>
                    <label className="flex items-center text-zinc-900 dark:text-zinc-300 ml-4">
                      <input
                        type="checkbox"
                        className="mr-2 bg-zinc-700 border-zinc-600"
                        checked={filters.seasons.includes('winter')}
                        onChange={() => handleFilterChange('seasons', 'winter')}
                      />
                      Winter
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:w-3/4">
            <div className="flex justify-between items-center mb-6 backdrop-blur-xl bg-white/20 dark:bg-black/20 rounded-lg p-6 border border-zinc-400/50 dark:border-zinc-700/50">
              <span className="text-zinc-900 dark:text-zinc-300">{filteredProducts.length} products</span>
              <select 
                className="bg-zinc-100 dark:bg-zinc-700 placeholder:text-black dark:placeholder:text-white text-black dark:text-white pl-4 md:pr-6 max-md:w-28 py-2 rounded-md border border-zinc-600/40"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">Newest</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 md:gap-6 gap-4">
              {filteredProducts.map((product) => (
                <div key={product.id} className="backdrop-blur-xl bg-white/50 dark:bg-black/20 border-2 border-zinc-500/50 dark:border-zinc-300/50 rounded-lg overflow-hidden hover:transform hover:scale-105 transition-transform">
                  <Link to={`/products/${product.id}`}>
                    <div className="h-64 bg-zinc-600 flex items-center justify-center">
                      <span className="text-zinc-400">Product Image</span>
                    </div>
                  </Link>
                  
                  <div className="p-4">
                    <Link to={`/products/${product.id}`}>
                      <h3 className="text-black dark:text-white font-semibold mb-2 hover:text-[#059669] transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    
                    <div className="flex items-center mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(product.rating) 
                              ? 'dark:text-yellow-400 text-yellow-500 fill-current' 
                              : 'text-zinc-600 dark:text-zinc-400'
                          }`}
                        />
                      ))}
                      <span className="text-zinc-700 dark:text-zinc-400 text-sm ml-2">({product.rating})</span>
                    </div>
                    
                    <div className="flex flex-col md:flex-row gap-5 max-lg:my-4 justify-between items-center">
                      <span className="text-black dark:text-white font-bold">{getDisplayPrice(product.price)}</span>
                      <div className="flex items-center gap-2 w-full md:w-auto">
                        <button
                          className="p-2 rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
                          title={isInWishlist(product) ? 'Already in wishlist' : 'Add to wishlist'}
                          onClick={() => handleQuickWishlist(product)}
                          disabled={isInWishlist(product)}
                          type="button"
                        >
                          <Heart className={`w-4 h-4 ${isInWishlist(product) ? 'text-[#1fffb8] fill-[#1fffb8]' : 'text-zinc-500'}`} fill={isInWishlist(product) ? '#1fffb8' : 'none'} />
                        </button>
                        <button
                          className="bg-[#059669] text-white px-4 py-2 rounded hover:bg-[#059669]/90 transition-colors disabled:opacity-50 max-md:w-full"
                          onClick={() => handleQuickAdd(product)}
                          disabled={!product.inStock}
                        >
                          Quick add
                        </button>
                      </div>
                    </div>
                    
                    {!product.inStock && (
                      <div className="text-red-500 text-xs mt-2">Out of stock</div>
                    )}
                    
                    {/* Color variants */}
                    <div className="flex space-x-2 mt-10">
                      {product.colors.map((color, index) => (
                        <div
                          key={index}
                          className={`w-6 h-6 rounded-full border-2 border-zinc-600`}
                          style={{ backgroundColor: color }}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;