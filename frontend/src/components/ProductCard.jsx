import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';

const ALL_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

const isMobile = () => window.matchMedia('(pointer: coarse)').matches;

/**
 * @typedef {import('../services/productService').Product} Product
 */

/**
 * @param {{ product: Product }} props
 */
const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [hovered, setHovered] = useState(false);
  const [mobileActive, setMobileActive] = useState(false);
  const cardRef = useRef(null);

  // Use available_sizes from backend if present, fallback to sizes, else ALL_SIZES
  const availableSizes = (product.available_sizes && product.available_sizes.length > 0
    ? product.available_sizes
    : (product.sizes && product.sizes.length > 0
      ? product.sizes
      : ALL_SIZES)
  ).map(s => s.toUpperCase());

  // Determine if the product is on sale
  const isOnSale = product.sale_percent && product.sale_percent > 0;
  const salePrice = isOnSale ? (Number(product.price) * (1 - product.sale_percent / 100)).toFixed(2) : null;

  // Use indoor_image if present, else fallback to first color variant image
  const mainImage = product.indoor_image || (product.color_variants && product.color_variants.length > 0 && product.color_variants[0].images && product.color_variants[0].images.length > 0
    ? product.color_variants[0].images[0].image
    : undefined);

  const hasOutdoor = Boolean(product.outdoor_image);

  // Mobile touch logic
  useEffect(() => {
    if (!isMobile()) return;
    const handleTouchStart = (e) => {
      if (cardRef.current && cardRef.current.contains(e.target)) {
        setMobileActive(true);
      } else {
        setMobileActive(false);
      }
    };
    document.addEventListener('touchstart', handleTouchStart);
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
    };
  }, []);

  // Determine if the outdoor image should be shown
  const showOutdoor = isMobile() ? mobileActive : hovered;

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: isMobile() && mobileActive ? 1.06 : 1,
        boxShadow: isMobile() && mobileActive ? '0 0 32px 0 #10b98188' : undefined,
      }}
      whileHover={!isMobile() ? { y: -8, scale: 1.06, boxShadow: '0 0 32px 0 #10b98188' } : {}}
      className="relative transition-transform duration-300 cursor-pointer rounded-2xl shadow-xl bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md border border-zinc-200 dark:border-zinc-700 pb-12 w-full mx-auto min-h-[320px] sm:min-h-[320px] lg:min-h-[380px] xl:min-h-[400px]"
      onMouseEnter={() => !isMobile() && setHovered(true)}
      onMouseLeave={() => !isMobile() && setHovered(false)}
    >
      <Link to={`/products/${product.slug}`} className="block">
        <div className="relative">
          <div className="w-full aspect-[4/5] rounded-t-2xl overflow-hidden relative bg-zinc-100">
            {hasOutdoor ? (
              <>
                <motion.img
                  src={mainImage}
                  alt={product.name}
                  className="w-full h-full object-cover rounded-t-2xl absolute top-0 left-0 z-10"
                  animate={{ opacity: showOutdoor ? 0 : 1 }}
                  transition={{ duration: 0.8, ease: 'easeInOut' }}
                  style={{ pointerEvents: 'none' }}
                />
                <motion.img
                  src={product.outdoor_image}
                  alt={product.name + ' outdoor'}
                  className="w-full h-full object-cover rounded-t-2xl absolute top-0 left-0 z-10"
                  animate={{ opacity: showOutdoor ? 1 : 0 }}
                  transition={{ duration: 0.8, ease: 'easeInOut' }}
                  style={{ pointerEvents: 'none' }}
                />
              </>
            ) : (
              <img
                src={mainImage}
                alt={product.name}
                className="w-full h-full object-cover rounded-t-2xl absolute top-0 left-0 z-10"
              />
            )}
          </div>
          {/* Sizes badge full width at the bottom */}
          <div className="absolute bottom-0 left-0 w-full bg-black/70 text-white px-2 h-12 sm:h-10 flex items-center justify-center text-base font-bold select-none shadow-md z-30">
            {ALL_SIZES.map(size =>
              availableSizes.includes(size) ? (
                <span key={size} className="px-1 text-emerald-700 dark:text-emerald-400">{size}</span>
              ) : (
                <del key={size} className="opacity-60 px-1">{size}</del>
              )
            )}
          </div>
          {isOnSale && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-2 left-2 bg-red-600 text-white px-4 py-1 rounded-lg text-xs font-bold shadow-lg -rotate-[18deg] transform select-none z-30"
            >
              SALE
            </motion.div>
          )}
        </div>
        <div className="p-2 sm:p-4 lg:p-4">
          <h3 className="text-base sm:text-lg lg:text-lg font-semibold text-zinc-900 dark:text-white mb-2 truncate">
            {product.name}
          </h3>
          {/* Rating Stars */}
          <div className="flex items-center mb-2">
            {[1,2,3,4,5].map(i => {
              if (product.rating >= i) {
                return <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20"><polygon points="9.9,1.1 7.6,6.6 1.6,7.6 6,11.9 4.9,17.9 9.9,14.9 14.9,17.9 13.8,11.9 18.2,7.6 12.2,6.6 "/></svg>;
              } else if (product.rating >= i - 0.5) {
                return <svg key={i} className="w-4 h-4 text-yellow-400" viewBox="0 0 20 20"><defs><linearGradient id={`half${i}`}><stop offset="50%" stopColor="#facc15"/><stop offset="50%" stopColor="#d1d5db"/></linearGradient></defs><polygon fill={`url(#half${i})`} points="9.9,1.1 7.6,6.6 1.6,7.6 6,11.9 4.9,17.9 9.9,14.9 14.9,17.9 13.8,11.9 18.2,7.6 12.2,6.6 "/></svg>;
              } else {
                return <svg key={i} className="w-4 h-4 text-zinc-300 dark:text-zinc-600" viewBox="0 0 20 20"><polygon points="9.9,1.1 7.6,6.6 1.6,7.6 6,11.9 4.9,17.9 9.9,14.9 14.9,17.9 13.8,11.9 18.2,7.6 12.2,6.6 "/></svg>;
              }
            })}
            <span className="ml-2 text-xs text-zinc-500">{product.rating ? product.rating.toFixed(1) : '0.0'}</span>
          </div>
          <div className="flex items-center justify-between mb-2 sm:mb-4 lg:mb-4">
            <div className="flex items-center space-x-2">
              {isOnSale ? (
                <>
                  <del className="text-zinc-400 dark:text-zinc-500 font-bold text-xs sm:text-sm">{Number(product.price).toFixed(2)} EGP</del>
                  <span className="text-sm sm:text-base font-bold text-emerald-600 dark:text-emerald-400">{salePrice} EGP</span>
                </>
              ) : (
                <span className="text-sm sm:text-base font-bold text-emerald-600 dark:text-emerald-400">{Number(product.price).toFixed(2)} EGP</span>
              )}
            </div>
            {isOnSale && (
              <span className="ml-2 text-xs font-semibold text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/40 px-1 py-0.5 rounded">-{product.sale_percent}%</span>
            )}
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-4 lg:mb-4">
            {product.available_colors?.map((color) => (
              <div
                key={color}
                className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 border-zinc-300 dark:border-zinc-600 shadow-sm hover:scale-110 transition-transform duration-200"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      </Link>
      <div className="absolute left-0 bottom-0 w-full p-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => addToCart({ ...product, slug: product.slug })}
          className="w-full py-2 px-2 sm:px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-2xl shadow-emerald-200/40 dark:shadow-emerald-400/20 backdrop-blur-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:focus:ring-emerald-300 text-sm sm:text-base lg:text-base"
        >
          Add to Cart
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ProductCard;
