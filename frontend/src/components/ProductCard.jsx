import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, scale: 1.06, boxShadow: '0 0 32px 0 #10b98188' }}
      className="transition-transform duration-300 cursor-pointer rounded-2xl shadow-glass bg-shortcut-glass-card"
    >
      <Link to={`/products/${product.id}`} className="block">
        <div className="relative">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-72 object-contain rounded-t-2xl bg-white"
          />
          {product.sale && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-2 right-2 badge-sale shadow"
            >
              SALE
            </motion.div>
          )}
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-shortcut-text-light mb-2">
            {product.name}
          </h3>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold text-shortcut-emerald">
                {product.price} EGP
              </span>
              {product.originalPrice && (
                <span className="text-sm text-shortcut-text-muted line-through">
                  {product.originalPrice} EGP
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2 mb-4">
            {product.colors?.map((color) => (
              <div
                key={color}
                className="w-4 h-4 rounded-full border border-white/20"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <div className="flex items-center space-x-2 mb-4">
            {product.sizes?.map((size) => (
              <span
                key={size}
                className="px-2 py-1 text-xs border border-white/20 rounded"
              >
                {size}
              </span>
            ))}
          </div>
        </div>
      </Link>
      <div className="p-4 pt-0">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => addToCart(product)}
          className="w-full btn-primary"
        >
          Add to Cart
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ProductCard; 