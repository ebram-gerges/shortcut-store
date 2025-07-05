import React, { useEffect, useState } from 'react';
import { X, Heart, ShoppingCart, Check } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { getProductBySlug } from '../services/productService';
import { Product } from '../types/product';
import { Link } from 'react-router-dom';

interface WishlistSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const WishlistSidebar: React.FC<WishlistSidebarProps> = ({ isOpen, onClose }) => {
  const { items, removeItem } = useWishlist();
  const { addItem, removeItem: removeCartItem, items: cartItems } = useCart();

  const [productCache, setProductCache] = useState<{ [id: number]: Product }>({});
  const [loadingProducts, setLoadingProducts] = useState<{ [id: number]: boolean }>({});

  const isInCart = (item: {id: number; color: string; size: string}) =>
    cartItems.some(
      (cartItem) => cartItem.id === item.id && cartItem.color === item.color && cartItem.size === item.size
    );

  const handleToggleCart = (item: {id: number; name: string; price: number; color: string; size: string}) => {
    if (isInCart(item)) {
      removeCartItem(item.id);
    } else {
      const product = productCache[item.id];
      let imageUrl: string | undefined = undefined;
      if (product && product.color_variants) {
        const colorVariant = product.color_variants.find(cv => cv.color === item.color);
        if (colorVariant && colorVariant.images && colorVariant.images.length > 0) {
          const primaryImg = colorVariant.images.find(img => img.is_primary) || colorVariant.images[0];
          imageUrl = primaryImg.image;
        } else if (product && product.indoor_image) {
          imageUrl = product.indoor_image;
        }
      }
      addItem({
        id: item.id,
        name: item.name,
        price: item.price,
        color: item.color,
        size: item.size,
        image: imageUrl || '',
      });
    }
  };

  // Fetch product data for items in wishlist if not already cached
  useEffect(() => {
    items.forEach((item) => {
      if (item.slug && !productCache[item.id] && !loadingProducts[item.id]) {
        setLoadingProducts((prev) => ({ ...prev, [item.id]: true }));
        getProductBySlug(item.slug)
          .then((product) => {
            setProductCache((prev) => ({ ...prev, [item.id]: product }));
          })
          .finally(() => {
            setLoadingProducts((prev) => ({ ...prev, [item.id]: false }));
          });
      }
    });
    // eslint-disable-next-line
  }, [items]);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isOpen]);

  // Always render when open, only delay unmounting on close for slide-out
  const [shouldRender, setShouldRender] = useState(isOpen);
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
    } else {
      const timeout = setTimeout(() => setShouldRender(false), 500);
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);
  if (!isOpen && !shouldRender) return null;

  return (
    <div className={`fixed inset-0 z-[200] overflow-hidden ${isOpen ? '' : 'pointer-events-none'}`}>
      <div className={`absolute inset-0 bg-black bg-opacity-30 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`} onClick={onClose}></div>
      <div
        className={`absolute right-0 top-0 h-full w-[80vw] max-w-xs sm:w-full sm:max-w-md bg-white/50 dark:bg-zinc-900/30 backdrop-blur-xl shadow-xl transition-transform duration-500 transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ transitionTimingFunction: 'cubic-bezier(0,0,0,0.99)' }}
      >
        <div className="flex h-full flex-col border-l border-zinc-700/50 dark:border-zinc-400/40">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-700 px-6 py-4">
            <h2 className="text-lg font-semibold dark:text-white text-black">Wishlist</h2>
            <button
              onClick={onClose}
              className="dark:text-zinc-400 text-zinc-900 hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Wishlist Items */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Heart className="h-16 w-16 text-zinc-600 mb-4" />
                <p className="dark:text-zinc-400 text-zinc-900 text-lg mb-2">Your wishlist is empty</p>
                <p className="dark:text-zinc-500 text-zinc-900 text-sm">Save items you love for later</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => {
                  const product = productCache[item.id];
                  let imageUrl: string | undefined = undefined;
                  if (product && product.color_variants) {
                    const colorVariant = product.color_variants.find(cv => cv.color === item.color);
                    if (colorVariant && colorVariant.images && colorVariant.images.length > 0) {
                      const primaryImg = colorVariant.images.find(img => img.is_primary) || colorVariant.images[0];
                      imageUrl = primaryImg.image;
                    } else if (product && product.indoor_image) {
                      imageUrl = product.indoor_image;
                    }
                  } else if (product && product.indoor_image) {
                    imageUrl = product.indoor_image;
                  }
                  // Fallback to mockProducts for inStock
                  const inStock = product?.in_stock;
                  return (
                    <div key={`${item.id}-${item.color}-${item.size}`} className="bg-zinc-300/50 dark:bg-zinc-800/60 border border-zinc-600/50 dark:border-zinc-400/30 backdrop-blur-xl rounded-lg p-4">
                      <div className="flex items-start space-x-4">
                        <div className="w-16 h-16 bg-zinc-700 rounded-lg flex items-center justify-center overflow-hidden">
                          {imageUrl ? (
                            <img src={imageUrl} alt={item.name} className="object-contain w-full h-full" />
                          ) : loadingProducts[item.id] ? (
                            <span className="text-zinc-400 text-xs animate-pulse">Loading...</span>
                          ) : (
                            <span className="text-zinc-400 text-xs">IMG</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <Link to={`/products/${product?.slug || item.slug}`} className="text-white font-medium hover:underline">
                            {item.name}
                          </Link>
                          <p className="text-zinc-400 text-sm">
                            {item.color} • {item.size}
                          </p>
                          <p className="text-[#059669] font-semibold">LE {item.price}</p>
                          {!inStock && (
                            <div className="text-red-500 text-xs mt-2">Out of stock</div>
                          )}
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-zinc-400 hover:text-red-400 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="mt-3 flex space-x-2">
                        <button
                          onClick={() => handleToggleCart(item)}
                          className={`flex-1 py-2 px-3 rounded text-sm font-medium flex items-center justify-center transition-colors
                            ${isInCart(item) ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-[#059669] text-white hover:bg-[#157557]'}
                            ${!inStock ? 'opacity-50 cursor-not-allowed' : ''}`}
                          disabled={!inStock}
                        >
                          {isInCart(item) ? (
                            <>
                              <Check className="h-4 w-4 mr-1" />
                              Added to Cart
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="h-4 w-4 mr-1" />
                              Add to Cart
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WishlistSidebar;