import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Heart, Plus, Minus } from 'lucide-react';
// import { mockProducts } from '../data/mockData';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useCurrency } from '../context/CurrencyContext';
import { getProductBySlug } from '../services/productService';
import { Product as ProductType } from '../types/product';
import ProductReviews from '../components/ProductReviews';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import NotFoundPage from './NotFoundPage';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { isOneSizeCategory } from '../utils/oneSizeCategory';

type ProductWithSale = ProductType & { sale_percent?: number };

// Add a helper to build <picture> sources from image_variants
function ResponsivePicture({ variants, alt, fallback, ...props }: { variants?: any, alt: string, fallback: string, [key: string]: any }) {
  if (!variants) {
    return <img src={fallback} alt={alt} {...props} />;
  }
  const getSrcSet = (fmt: string) => {
    if (!variants[fmt]) return undefined;
    return Object.entries(variants[fmt])
      .map(([size, path]) => {
        const pathStr = String(path);
        let cleanPath = pathStr.startsWith('/media/') ? pathStr : `/media/${pathStr.replace(/^\/*/, '')}`;
        return `${import.meta.env.VITE_API_BASE_URL}${cleanPath} ${size}w`;
      })
      .join(', ');
  };
  const webpSrcSet = getSrcSet('webp');
  const avifSrcSet = getSrcSet('avif');
  let defaultSrc = fallback;
  if (webpSrcSet) {
    const largest = Object.entries(variants.webp).sort((a, b) => Number(b[0]) - Number(a[0]))[0];
    if (largest) {
      const pathStr = String(largest[1]);
      let cleanPath = pathStr.startsWith('/media/') ? pathStr : `/media/${pathStr.replace(/^\/*/, '')}`;
      defaultSrc = `${import.meta.env.VITE_API_BASE_URL}${cleanPath}`;
    }
  }
  return (
    <picture>
      {avifSrcSet && <source type="image/avif" srcSet={avifSrcSet} sizes="100vw" />}
      {webpSrcSet && <source type="image/webp" srcSet={webpSrcSet} sizes="100vw" />}
      <img src={defaultSrc} alt={alt} {...props} />
    </picture>
  );
}

const ProductDetailPage = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState<ProductWithSale | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addItem } = useCart();
  const { addItem: addToWishlist, isInWishlist } = useWishlist();
  const { currency } = useCurrency();
  const conversionRate = 50;
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const [isAddedToWishlist, setIsAddedToWishlist] = useState(false);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const sliderRef = React.useRef<Slider>(null);
  const carouselInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [questionText, setQuestionText] = useState('');
  const [questionStatus, setQuestionStatus] = useState<'idle' | 'success' | 'error' | 'loading'>('idle');
  const [questionError, setQuestionError] = useState('');

  // Carousel interval duration (ms)
  const CAROUSEL_INTERVAL = 5000;
  // const SLIDE_DURATION = 600; we will use it later

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    getProductBySlug(slug)
      .then((data) => {
        setProduct(data);
        setSelectedColor(Array.isArray(data.color_variants) && data.color_variants.length > 0 ? data.color_variants[0].color : '');
        setSelectedSize(Array.isArray(data.sizes) && data.sizes.length > 0 ? data.sizes[0] : '');
        setLoading(false);
      })
      .catch(() => {
        setError('Product not found');
        setLoading(false);
      });
  }, [slug]);

  // Auto-select the first available color and the smallest available size variant when product or options change
  useEffect(() => {
    if (product) {
      if (Array.isArray(product.color_variants) && product.color_variants.length > 0) {
        setSelectedColor(product.color_variants[0].color);
      }
      if (Array.isArray(product.available_sizes) && product.available_sizes.length > 0) {
        // Sort sizes by XS < S < M < L < XL < XXL < XXXL
        const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
        const sortedSizes = [...product.available_sizes].sort((a, b) => {
          const idxA = sizeOrder.indexOf(a.toUpperCase());
          const idxB = sizeOrder.indexOf(b.toUpperCase());
          if (idxA === -1 && idxB === -1) return a.localeCompare(b);
          if (idxA === -1) return 1;
          if (idxB === -1) return -1;
          return idxA - idxB;
        });
        setSelectedSize(sortedSizes[0]);
      }
    }
  }, [product]);

  // Get images for the selected color
  const colorVariant = product ? product.color_variants?.find((cv) => cv.color === selectedColor) : undefined;
  const images = colorVariant?.images?.length ? colorVariant.images : product?.color_variants?.flatMap((cv) => cv.images || []) || [];

  // Helper to build full image URL
  const getFullUrl = (path: string | undefined) => {
    if (!path) return undefined;
    if (path.startsWith('http')) return path;
    // Ensure path starts with /media/
    let cleanPath = path.startsWith('/media/') ? path : `/media/${path.replace(/^\/*/, '')}`;
    return `${import.meta.env.VITE_API_BASE_URL}${cleanPath}`;
  };

  // Main image logic: use the currently selected image index
  const mainImage = images.length > 0 ? getFullUrl(images[currentImageIdx]?.image) : undefined;

  // Preload all images on mount
  useEffect(() => {
    images.filter(img => img?.image).forEach(img => {
      const preload = new window.Image();
      preload.src = getFullUrl(img.image) as string;
    });
  }, [images]);

  // Handler for manual image change (thumbnail click)
  const handleThumbnailClick = (idx: number) => {
    if (sliderRef.current) {
      sliderRef.current.slickGoTo(idx);
    }
    setCurrentImageIdx(idx);
  };

  // Auto-slide interval
  useEffect(() => {
    if (carouselInterval.current) clearInterval(carouselInterval.current);
    if (images.length > 1) {
      carouselInterval.current = setInterval(() => {
        console.log('Auto-slide interval fired. currentImageIdx:', currentImageIdx);
        setCurrentImageIdx((prevIdx) => (prevIdx + 1) % images.length);
      }, CAROUSEL_INTERVAL);
    }
    return () => {
      if (carouselInterval.current) clearInterval(carouselInterval.current);
    };
  }, [images.length, selectedColor]);

  // Reset carousel when color changes or images change
  useEffect(() => {
    setCurrentImageIdx(0);
    // Do not clear the interval here; let the main interval effect handle it
  }, [selectedColor, images.length]);

  // Set the web tab title to product name and selected color
  useEffect(() => {
    if (product && selectedColor) {
      document.title = `${product.name} (${selectedColor})`;
    } else if (product) {
      document.title = product.name;
    }
    return () => {
      document.title = 'Shortcut Store'; // or your default title
    };
  }, [product, selectedColor]);

  // On mount, check for saved question in localStorage
  useEffect(() => {
    const saved = localStorage.getItem('pending_question');
    if (saved) {
      try {
        const { productId, questionText: savedText } = JSON.parse(saved);
        if (product && product.id === productId) {
          setShowQuestionModal(true);
          setQuestionText(savedText);
          localStorage.removeItem('pending_question');
        }
      } catch {}
    }
  }, [product]);

  const getDisplayPrice = (price: number) => {
    if (currency === 'USD') {
      return `${(price / conversionRate).toFixed(2)} USD`;
    }
    return `${price} EGP`;
  };

  if (loading) {
    return <div className="text-white text-center py-20">Loading product...</div>;
  }
  if (error || !product) {
    return <NotFoundPage />;
  }

  const handleAddToCart = () => {
    // Get the image for the selected color variant or use the main product indoor image
    const selectedImage = colorVariant?.images?.[0]?.image || product.indoor_image || '';
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price: Number(product.price),
        color: selectedColor,
        size: selectedSize,
        image: selectedImage,
        sale_percent: product.sale_percent,
        slug: product.slug,
      });
    }
    setIsAddedToCart(true);
    setTimeout(() => setIsAddedToCart(false), 2000);
  };

  const handleAddToWishlist = () => {
    addToWishlist({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      color: selectedColor,
      size: selectedSize,
      slug: product.slug,
    });
    setIsAddedToWishlist(true);
    setTimeout(() => setIsAddedToWishlist(false), 2000);
  };

  const inWishlist = isInWishlist(product.id);

  // Find the stock item for the selected color and size
  const selectedStockItem = product?.stock_items?.find((item) => {
    const color = item.color_variant && item.color_variant.color;
    const size = item.size;
    return color === selectedColor && size === selectedSize;
  });
  const selectedInStock = selectedStockItem ? (selectedStockItem.available_quantity ?? 0) > 0 : false;
  const maxQuantity = selectedStockItem ? selectedStockItem.available_quantity ?? 1 : 1;

  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) {
      setQuestionError('Please enter your question.');
      return;
    }
    if (!isAuthenticated) {
      // Save question and redirect to login
      localStorage.setItem('pending_question', JSON.stringify({ productId: product?.id, questionText }));
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }
    setQuestionStatus('loading');
    setQuestionError('');
    try {
      await api.post('/api/products/questions/submit/', {
        product: product?.id,
        question: questionText,
        username: user?.username,
        email: user?.email,
      });
      setQuestionStatus('success');
      setQuestionText('');
    } catch (err: any) {
      setQuestionStatus('error');
      if (err.response?.data?.message) setQuestionError(err.response.data.message);
      else if (err.response?.data?.detail) setQuestionError(err.response.data.detail);
      else if (err.message) setQuestionError(err.message);
      else setQuestionError('Failed to submit your question. Please try again.');
    }
  };

  return (
    <>
      <div className="relative min-h-screen z-20 py-8 pt-[125px]">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Images */}
            <div>
              {/* Main Product Image or Color Variant Images */}
              <div className="bg-transparent h-96 lg:h-[500px] flex items-center justify-center mb-4 overflow-visible relative">
                {/* Sale badge */}
                
                <div className="w-full flex justify-center items-center">
                  <div className="w-full max-w-md mx-auto bg-white dark:bg-zinc-900 rounded-xl overflow-hidden flex items-center justify-center" style={{ maxHeight: 400 }}>
                    <AnimatePresence mode="wait" initial={false}>
                      {mainImage && (
                        <motion.img
                          key={currentImageIdx}
                      src={mainImage}
                      alt={product.name + (selectedColor ? ` (${selectedColor})` : '')}
                          className="object-contain w-full h-auto max-h-[400px]"
                          initial={{ opacity: 0, x: 40 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -40 }}
                          transition={{ duration: 0.5 }}
                        />
                  )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
              {/* Thumbnails for all images */}
              <div className="flex space-x-2 mt-2">
                {images.length > 0 ? images.map((img, idx) => (
                  <motion.img
                    key={img.id || idx}
                    src={img.image}
                    alt={img.alt_text || product.name}
                    className={`h-16 w-16 object-cover rounded border-2 cursor-pointer ${currentImageIdx === idx ? 'border-[#059669]' : 'border-zinc-600'}`}
                    onClick={() => handleThumbnailClick(idx)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1, duration: 0.5, type: 'spring', stiffness: 80 }}
                  />
                )) : null}
              </div>
            </div>

            {/* Product Details */}
            <div>
              <h1 className="text-3xl font-bold text-black dark:text-white mb-4">{product.name}</h1>
              {/* Rating */}
              <div className="flex items-center mb-4">
                {[1,2,3,4,5].map(i => {
                  const rating = typeof product.rating === 'number' ? product.rating : 0;
                  if (rating >= i) {
                    return <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20"><polygon points="9.9,1.1 7.6,6.6 1.6,7.6 6,11.9 4.9,17.9 9.9,14.9 14.9,17.9 13.8,11.9 18.2,7.6 12.2,6.6 "/></svg>;
                  } else if (rating >= i - 0.5) {
                    return <svg key={i} className="w-5 h-5 text-yellow-400" viewBox="0 0 20 20"><defs><linearGradient id={`half${i}`}><stop offset="50%" stopColor="#facc15"/><stop offset="50%" stopColor="#d1d5db"/></linearGradient></defs><polygon fill={`url(#half${i})`} points="9.9,1.1 7.6,6.6 1.6,7.6 6,11.9 4.9,17.9 9.9,14.9 14.9,17.9 13.8,11.9 18.2,7.6 12.2,6.6 "/></svg>;
                  } else {
                    return <svg key={i} className="w-5 h-5 text-zinc-300 dark:text-zinc-600" viewBox="0 0 20 20"><polygon points="9.9,1.1 7.6,6.6 1.6,7.6 6,11.9 4.9,17.9 9.9,14.9 14.9,17.9 13.8,11.9 18.2,7.6 12.2,6.6 "/></svg>;
                  }
                })}
                <span className="text-black dark:text-white font-semibold ml-2">({typeof product.rating === 'number' ? product.rating.toFixed(1) : '0.0'})</span>
              </div>
              {/* Price */}
              <div className="mb-6 flex items-center space-x-4">
                {product.sale_percent && product.sale_percent > 0 ? (
                  <>
                    <del className="text-zinc-400 dark:text-zinc-400 font-bold text-3xl">{getDisplayPrice(Number(product.price))}</del>
                    <span className="text-[#059669] dark:text-[#1fffb8] font-bold text-3xl">{getDisplayPrice(Number(product.price) * (1 - product.sale_percent / 100))}</span>
                  </>
                ) : (
                  <span className="text-black dark:text-white font-bold text-3xl">{getDisplayPrice(Number(product.price))}</span>
                )}
              </div>
              {/* Color Selection */}
              {Array.isArray(product.color_variants) && product.color_variants.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-black dark:text-white font-semibold mb-3">Color:</h3>
                  <div className="flex space-x-3">
                    {product.color_variants.map((variant) => (
                      <button
                        key={variant.color}
                        onClick={() => setSelectedColor(variant.color)}
                        className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-150 shadow-sm relative group color-option
                          ${selectedColor === variant.color ? 'border-[#059669] ring-2 ring-[#059669] scale-110 shadow-lg' : 'border-zinc-400 hover:border-[#059669]'}
                        `}
                        style={{ backgroundColor: variant.color_hex || variant.color }}
                        aria-label={variant.color}
                        type="button"
                      >
                        {selectedColor === variant.color && (
                          <span className="absolute inset-0 flex items-center justify-center">
                            <svg className="w-5 h-5 text-white drop-shadow" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                        )}
                        <span className="sr-only">{variant.color}</span>
                        {/* Tooltip */}
                        <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10">
                          {variant.color}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {/* Size Selection */}
              <div className="mb-6">
                <h3 className="text-black dark:text-white font-semibold mb-3">Size:</h3>
                {product && isOneSizeCategory(product.category, product.subcategory) && selectedColor ? (
                  <div className="text-lg font-bold text-emerald-700 dark:text-emerald-400">one size {product.name} ({selectedColor})</div>
                ) : (
                <div className="flex space-x-3">
                  {['M', 'L', 'XL', 'XXL'].map((size: string) => {
                    const displaySize = size === 'XXL' ? '2XL' : size;
                      const isAvailable = Array.isArray(product?.available_sizes) && product.available_sizes.includes(size);
                    const isSelected = selectedSize === size;
                    return (
                      <button
                        key={size}
                        onClick={() => isAvailable && setSelectedSize(size)}
                        disabled={!isAvailable}
                        className={`px-5 h-10 rounded-full border-2 flex items-center justify-center text-base font-semibold transition-all duration-150 shadow-sm
                          ${isAvailable 
                            ? (isSelected 
                              ? 'border-[#059669] bg-[#059669] text-white scale-105 shadow-lg' 
                              : 'border-zinc-400 bg-zinc-800 text-white hover:border-[#059669]')
                            : 'border-zinc-500 bg-zinc-700 text-zinc-400 cursor-not-allowed'
                          }
                        `}
                        aria-label={displaySize}
                        type="button"
                      >
                        {isAvailable ? displaySize : <del className="text-zinc-400">{displaySize}</del>}
                      </button>
                    );
                  })}
                </div>
                )}
              </div>
              {/* Stock Status */}
              <div className="mb-6">
                {selectedInStock ? (
                  <>
                    <span className="bg-[#059669] text-white px-3 py-1 rounded text-sm">
                      IN STOCK
                    </span>
                    <span className="dark:text-zinc-400 text-zinc-900 ml-2">
                      {selectedStockItem?.available_quantity} available
                    </span>
                  </>
                ) : (
                  <span className="bg-red-600 text-white px-3 py-1 rounded text-sm">
                    OUT OF STOCK
                  </span>
                )}
              </div>
              {/* Quantity */}
              <div className="mb-6">
                <h3 className="text-black dark:text-white font-semibold mb-3">Quantity:</h3>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="bg-zinc-700 border-2 border-zinc-600/50 text-white p-2 rounded hover:bg-[#059669] transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="bg-zinc-700 border-2 border-zinc-600/50 text-white px-4 py-2 rounded min-w-[3rem] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                    className="bg-zinc-700 border-2 border-zinc-600/50 text-white p-2 rounded hover:bg-[#059669] transition-colors"
                    disabled={quantity >= maxQuantity}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {/* Add to Cart */}
              <div className="space-y-4 mb-8">
                <button 
                  onClick={handleAddToCart}
                  disabled={!selectedInStock}
                  className={`w-full py-3 rounded-lg font-semibold transition-colors ${selectedInStock ? isAddedToCart ? 'bg-green-600 text-white' : 'bg-[#059669] text-white hover:bg-[#059669]/90' : 'bg-zinc-600 text-zinc-400 cursor-not-allowed'}`}
                >
                  {isAddedToCart 
                    ? '✓ Added to Cart!' 
                    : selectedInStock 
                      ? product.sale_percent && product.sale_percent > 0
                        ? `Add to Cart - ${getDisplayPrice(Number(product.price) * (1 - product.sale_percent / 100) * quantity)}`
                        : `Add to Cart - ${getDisplayPrice(Number(product.price) * quantity)}`
                      : 'Out of Stock'
                  }
                </button>
                <button 
                  onClick={handleAddToWishlist}
                  className={`w-full border py-3 rounded-lg font-semibold transition-colors flex items-center justify-center ${inWishlist || isAddedToWishlist ? 'border-red-500 text-red-500 bg-red-500 bg-opacity-10' : 'border-[#059669] text-[#059669] hover:bg-[#059669] hover:text-white'}`}
                >
                  <Heart className={`w-5 h-5 mr-2 ${inWishlist || isAddedToWishlist ? 'fill-current' : ''}`} />
                  {isAddedToWishlist 
                    ? '✓ Added to Wishlist!' 
                    : inWishlist 
                      ? 'In Wishlist'
                      : 'Add to Wishlist'
                  }
                </button>
              </div>
              {/* Ask a Question */}
              <button className="text-[#059669] dark:text-[#1b8d69] hover:text-[#1b8d69] underline" onClick={() => setShowQuestionModal(true)}>
                Ask a question
              </button>
            </div>
          </div>

          {/* Product Tabs */}
          <div className="mt-16">
            <div className="border-b border-zinc-700">
              <nav className="flex space-x-8">
                {['Description', 'Details', 'Reviews'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab.toLowerCase())}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.toLowerCase()
                        ? 'border-[#059669] text-[#1b8d69]'
                        : 'border-transparent dark:text-zinc-400 text-zinc-900 hover:text-white'
                    } transition-colors`}
                  >
                    {tab}
                  </button>
                ))}
              </nav>
            </div>

            <div className="py-8">
              {activeTab === 'description' && (
                <div className="text-zinc-900 dark:text-zinc-300 space-y-4">
                  <h4 className="text-black dark:text-white font-semibold text-lg mb-4">Product Description</h4>
                  <ul className="list-disc list-inside space-y-2">
                    <li>Embroidered Oversized Tees</li>
                    <li>100% cotton</li>
                    <li>270 GSM</li>
                    <li>Male model 185cm wearing size L</li>
                    <li>Female model 165cm wearing size S</li>
                  </ul>
                  <p className="mt-4">
                    Premium quality {product.name.toLowerCase()} designed for comfort and style. 
                    Perfect for casual wear and everyday activities. Made with high-quality materials 
                    that ensure durability and long-lasting wear.
                  </p>
                </div>
              )}
              {activeTab === 'details' && (
                <div className="text-zinc-900 dark:text-zinc-300 space-y-4">
                  <h4 className="text-black dark:text-white font-semibold text-lg mb-4">Product Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="text-black dark:text-white font-medium mb-2">Material & Care</h5>
                      <ul className="space-y-1 text-sm">
                        <li>• 100% Premium Cotton</li>
                        <li>• Machine wash cold</li>
                        <li>• Tumble dry low</li>
                        <li>• Do not bleach</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="text-black dark:text-white font-medium mb-2">Sizing</h5>
                      <ul className="space-y-1 text-sm">
                        <li>• Available in M, L, XL, 2XL</li>
                        <li>• Oversized fit</li>
                        <li>• Size up for looser fit</li>
                        <li>• Check size guide</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === 'reviews' && (
                <div className="text-zinc-900 dark:text-zinc-300 space-y-6">
                  <h4 className="text-black dark:text-white font-semibold text-lg mb-4">Customer Reviews</h4>
                  {/* Add Review Button */}
                  <div className="flex justify-end mb-6">
                    <Link
                      to={`/products/${product.slug}/review`}
                      className="inline-flex items-center px-6 py-3 bg-[#059669] text-white font-semibold rounded-lg shadow hover:bg-[#059669]/90 transition-colors"
                    >
                      Add a review to {product.name}
                    </Link>
                  </div>
                  <ProductReviews productId={product.id} productName={product.name} productSlug={product.slug} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {showQuestionModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl p-8 w-full max-w-md relative"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              <button
                className="absolute top-3 right-3 text-zinc-400 hover:text-zinc-900 dark:hover:text-white text-2xl font-bold focus:outline-none"
                onClick={() => { setShowQuestionModal(false); setQuestionStatus('idle'); setQuestionText(''); setQuestionError(''); }}
                aria-label="Close modal"
              >
                &times;
              </button>
              <h2 className="text-2xl font-bold mb-4 text-[#059669] text-center">Ask a Question</h2>
              <form onSubmit={handleQuestionSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="block text-zinc-700 dark:text-zinc-200 mb-1">Your Question</label>
                  <textarea
                    className="w-full rounded border border-zinc-300 dark:border-zinc-700 p-3 min-h-[100px] resize-y bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                    value={questionText}
                    onChange={e => setQuestionText(e.target.value)}
                    required
                  />
                </div>
                {questionError && <div className="text-red-500 text-sm">{questionError}</div>}
                <button
                  type="submit"
                  className="w-full py-3 rounded bg-[#059669] text-white font-semibold hover:bg-[#047857] transition-all text-lg disabled:opacity-60"
                  disabled={questionStatus === 'loading'}
                >
                  {questionStatus === 'loading' ? 'Sending...' : 'Send Question'}
                </button>
                {questionStatus === 'success' && <div className="text-green-600 text-center font-semibold mt-2">Your question has been sent!</div>}
                {questionStatus === 'error' && <div className="text-red-500 text-center font-semibold mt-2">{questionError}</div>}
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProductDetailPage;