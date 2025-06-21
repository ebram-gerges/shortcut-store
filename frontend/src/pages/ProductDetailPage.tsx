import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Star, Heart, Plus, Minus } from 'lucide-react';
import { mockProducts } from '../data/mockData';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useCurrency } from '../context/CurrencyContext';

const ProductDetailPage = () => {
  const { id } = useParams();
  const product = mockProducts.find(p => p.id === parseInt(id || '1'));
  const { addItem } = useCart();
  const { addItem: addToWishlist, isInWishlist } = useWishlist();
  const { currency } = useCurrency();
  const conversionRate = 50;
  const getDisplayPrice = (price: number) => {
    if (currency === 'USD') {
      return `$${(price / conversionRate).toFixed(2)}`;
    }
    return `LE ${price}`;
  };
  const [selectedColor, setSelectedColor] = useState('black');
  const [selectedSize, setSelectedSize] = useState('L');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const [isAddedToWishlist, setIsAddedToWishlist] = useState(false);

  if (!product) {
    return <div className="text-white text-center py-20">Product not found</div>;
  }

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        color: selectedColor,
        size: selectedSize,
      });
    }
    
    setIsAddedToCart(true);
    setTimeout(() => setIsAddedToCart(false), 2000);
  };

  const handleAddToWishlist = () => {
    addToWishlist({
      id: product.id,
      name: product.name,
      price: product.price,
      color: selectedColor,
      size: selectedSize,
    });
    
    setIsAddedToWishlist(true);
    setTimeout(() => setIsAddedToWishlist(false), 2000);
  };

  const totalPrice = (product.price * quantity).toFixed(2);
  const inWishlist = isInWishlist(product.id);

  return (
    <div className="relative min-h-screen z-20 py-8 pt-[125px]">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div>
            <div className="bg-gray-700 rounded-lg h-96 lg:h-[500px] flex items-center justify-center mb-4">
              <span className="text-gray-400 text-lg">Product picture</span>
            </div>
            <div className="bg-gray-700 rounded-lg h-24 w-24 flex items-center justify-center">
              <span className="text-gray-400 text-xs text-center">Mini Product picture preview</span>
            </div>
          </div>

          {/* Product Details */}
          <div>
            <h1 className="text-3xl font-bold text-black dark:text-white mb-4">{product.name}</h1>
            
            {/* Rating */}
            <div className="flex items-center mb-4">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.floor(product.rating) 
                      ? 'text-yellow-400 fill-current' 
                      : 'text-gray-600'
                  }`}
                />
              ))}
              <span className="text-black dark:text-white font-semibold ml-2">({product.rating})</span>
            </div>

            {/* Price */}
            <div className="text-2xl font-bold dark:text-yellow-400 text-yellow-600 mb-6">
              {getDisplayPrice(product.price)}
            </div>

            {/* Color Selection */}
            <div className="mb-6">
              <h3 className="text-black dark:text-white font-semibold mb-3">Color: {selectedColor}</h3>
              <div className="flex space-x-3">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-8 h-8 rounded-full border-2 ${
                      selectedColor === color ? 'border-[#059669]' : 'border-gray-600'
                    }`}
                    style={{ backgroundColor: color }}
                  ></button>
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div className="mb-6">
              <h3 className="text-black dark:text-white font-semibold mb-3">Size:</h3>
              <div className="flex space-x-3">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 border rounded ${
                      selectedSize === size
                        ? 'border-[#059669] bg-[#059669] text-white'
                        : 'border-gray-600 text-black dark:text-white hover:border-[#059669]'
                    } transition-colors`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Stock Status */}
            <div className="mb-6">
              {product.inStock ? (
                <>
                  <span className="bg-[#059669] text-white px-3 py-1 rounded text-sm">
                    IN STOCK
                  </span>
                  <span className="dark:text-gray-400 text-gray-900 ml-2">
                    In Stock ({product.stock} available)
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
                  className="bg-gray-700 border-2 border-gray-600/50 text-white p-2 rounded hover:bg-[#059669] transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="bg-gray-700 border-2 border-gray-600/50 text-white px-4 py-2 rounded min-w-[3rem] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="bg-gray-700 border-2 border-gray-600/50 text-white p-2 rounded hover:bg-[#059669] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <div className="space-y-4 mb-8">
              <button 
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                  product.inStock
                    ? isAddedToCart
                      ? 'bg-green-600 text-white'
                      : 'bg-[#059669] text-white hover:bg-[#059669]/90'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isAddedToCart 
                  ? '✓ Added to Cart!' 
                  : product.inStock 
                    ? `Add to Cart - ${getDisplayPrice(product.price * quantity)}`
                    : 'Out of Stock'
                }
              </button>
              <button 
                onClick={handleAddToWishlist}
                className={`w-full border py-3 rounded-lg font-semibold transition-colors flex items-center justify-center ${
                  inWishlist || isAddedToWishlist
                    ? 'border-red-500 text-red-500 bg-red-500 bg-opacity-10'
                    : 'border-[#059669] text-[#059669] hover:bg-[#059669] hover:text-white'
                }`}
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
            <button className="text-teal-500 dark:text-teal-400 hover:text-teal-300 underline">
              Ask a question
            </button>
          </div>
        </div>

        {/* Product Tabs */}
        <div className="mt-16">
          <div className="border-b border-gray-700">
            <nav className="flex space-x-8">
              {['Description', 'Details', 'Reviews'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab.toLowerCase())}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.toLowerCase()
                      ? 'border-teal-500 text-teal-400'
                      : 'border-transparent dark:text-gray-400 text-gray-900 hover:text-white'
                  } transition-colors`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          <div className="py-8">
            {activeTab === 'description' && (
              <div className="text-gray-900 dark:text-gray-300 space-y-4">
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
              <div className="text-gray-900 dark:text-gray-300 space-y-4">
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
                      <li>• Available in S, M, L, XL</li>
                      <li>• Oversized fit</li>
                      <li>• Size up for looser fit</li>
                      <li>• Check size guide</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'reviews' && (
              <div className="text-gray-900 dark:text-gray-300 space-y-6">
                <h4 className="text-black dark:text-white font-semibold text-lg mb-4">Customer Reviews</h4>
                <div className="space-y-4">
                  <div className="bg-gray-200 dark:bg-gray-800 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                        ))}
                      </div>
                      <span className="text-black dark:text-white font-medium ml-2">Ahmed M.</span>
                    </div>
                    <p className="text-gray-900 dark:text-gray-300">Great quality and comfortable fit. Exactly as described!</p>
                  </div>
                  <div className="bg-gray-200 dark:bg-gray-800 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <div className="flex">
                        {[...Array(4)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                        ))}
                        <Star className="w-4 h-4 text-gray-600" />
                      </div>
                      <span className="text-black dark:text-white font-medium ml-2">Sarah K.</span>
                    </div>
                    <p className="text-gray-900 dark:text-gray-300">Love the design and material. Fast shipping too!</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;