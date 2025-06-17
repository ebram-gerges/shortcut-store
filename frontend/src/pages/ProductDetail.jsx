import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import { useTheme } from '../hooks/useTheme';
import { motion } from 'framer-motion';
import { FaHeart, FaRegHeart } from 'react-icons/fa';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);
  const { addToCart } = useCart();
  const { isDarkMode } = useTheme();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await api.get(`products/${id}/`);
        setProduct(res.data);
      } catch (err) {
        setError('Failed to load product.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // Check if product is in wishlist on mount
  useEffect(() => {
    const checkWishlist = async () => {
      try {
        const res = await api.get('wishlist/');
        if (res.data && Array.isArray(res.data)) {
          setInWishlist(res.data.some(item => item.product === Number(id)));
        }
      } catch {}
    };
    checkWishlist();
  }, [id]);

  const handleWishlist = async () => {
    setWishlistLoading(true);
    try {
      if (!inWishlist) {
        await api.post('wishlist/', { product: id });
        setInWishlist(true);
      } else {
        // Find wishlist item id
        const res = await api.get('wishlist/');
        const item = res.data.find(item => item.product === Number(id));
        if (item) {
          await api.delete(`wishlist/${item.id}/`);
          setInWishlist(false);
        }
      }
    } catch (err) {
      // Optionally show error
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleAddToCart = () => {
    if ((colors.length > 0 && !selectedColor) || (sizes.length > 0 && !selectedSize)) return;
    addToCart({
      ...product,
      color: selectedColor,
      size: selectedSize,
      quantity,
    });
  };

  const isAddToCartDisabled =
    (colors.length > 0 && !selectedColor) ||
    (sizes.length > 0 && !selectedSize);

  if (loading) return <div className="text-center text-lg">Loading...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;
  if (!product) return <div className="text-center text-lg">Product not found.</div>;

  // Prepare images, colors, sizes
  const images = product.images || (product.image ? [product.image] : []);
  const colors = product.color_variants?.map(v => ({ name: v.color, value: v.color_hex || v.color })) || [];
  const sizes = product.available_sizes || [];

  return (
    <div className={`min-h-screen py-8 ${isDarkMode ? 'bg-gradient-to-br from-[#071a13] via-[#113c2b] to-[#1e3a2f]' : 'bg-gradient-to-br from-[#e6fff6] via-[#b2f5ea] to-[#a7ffeb]'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative">
              {product.sale_percent > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute shadow top-2 right-2 badge-sale"
                >
                  SALE
                </motion.div>
              )}
              {images.length > 0 && (
                <img
                  src={images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              )}
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-3 gap-4">
                {images.slice(1).map((image, index) => (
                  <div key={index} className="aspect-w-1 aspect-h-1 overflow-hidden rounded-lg">
                    <img
                      src={image}
                      alt={`${product.name} ${index + 2}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6 bg-shortcut-glass-card rounded-2xl shadow-glass p-8">
            <div>
              <h1 className="text-3xl font-bold text-shortcut-text-primary dark:text-white">
                {product.name}
              </h1>
              <div className="mt-2 flex items-center space-x-4">
                <span className="text-2xl font-bold text-shortcut-emerald">
                  {product.price} EGP
                </span>
                {product.originalPrice && (
                  <span className="text-lg text-shortcut-text-secondary line-through">
                    {product.originalPrice} EGP
                  </span>
                )}
              </div>
            </div>

            <p className="text-shortcut-text-secondary dark:text-gray-300">{product.description}</p>

            {/* Color Selection */}
            {colors.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-shortcut-text-primary dark:text-white">Color</h3>
                <div className="mt-2 flex space-x-2">
                  {colors.map((color) => (
                    <button
                      key={color.value}
                      className={`w-8 h-8 rounded-full border-2 ${selectedColor === color.value ? 'border-shortcut-blue' : 'border-transparent'}`}
                      style={{ backgroundColor: color.value }}
                      onClick={() => setSelectedColor(color.value)}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {sizes.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-shortcut-text-primary dark:text-white">Size</h3>
                <div className="mt-2 grid grid-cols-5 gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      className={`px-4 py-2 border rounded-md ${selectedSize === size ? 'border-shortcut-blue bg-shortcut-blue text-white' : 'border-shortcut-border-light hover:border-shortcut-border-medium'}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <h3 className="text-sm font-medium text-shortcut-text-primary dark:text-white">Quantity</h3>
              <div className="mt-2 flex items-center space-x-4">
                <button
                  className="w-8 h-8 border border-shortcut-border-light rounded-md flex items-center justify-center"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  -
                </button>
                <span className="text-shortcut-text-primary dark:text-white">{quantity}</span>
                <button
                  className="w-8 h-8 border border-shortcut-border-light rounded-md flex items-center justify-center"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </button>
              </div>
            </div>

            {/* Wishlist Button */}
            <button
              className={`flex items-center gap-2 px-4 py-2 rounded-md border border-shortcut-blue text-shortcut-blue bg-white/80 dark:bg-gray-900/60 shadow transition ${inWishlist ? 'bg-red-100 dark:bg-red-900/40 border-red-400 text-red-600' : ''}`}
              onClick={handleWishlist}
              disabled={wishlistLoading}
              aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              {inWishlist ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
              {inWishlist ? 'Wishlisted' : 'Add to Wishlist'}
            </button>

            {/* Add to Cart Button */}
            <button
              className={`w-full btn-primary py-3 rounded-md mt-4 ${isAddToCartDisabled ? 'opacity-60 cursor-not-allowed' : ''}`}
              onClick={handleAddToCart}
              disabled={isAddToCartDisabled}
            >
              Add to Cart
            </button>

            {/* Features */}
            {product.features && product.features.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-shortcut-text-primary dark:text-white mb-2">
                  Features
                </h3>
                <ul className="list-disc list-inside space-y-1 text-shortcut-text-secondary dark:text-gray-300">
                  {product.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;