import React from 'react';
import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartSidebar: React.FC<CartSidebarProps> = ({ isOpen, onClose }) => {
  const { items, updateQuantity, removeItem, getTotalPrice } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <div className={`fixed inset-0 z-50 overflow-hidden ${isOpen ? '' : 'pointer-events-none'}`}>
      <div className={`absolute inset-0 bg-black bg-opacity-30 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`} onClick={onClose}></div>
      <div
        className={`absolute right-0 top-0 h-full w-[80vw] max-w-xs sm:w-full sm:max-w-md bg-white/50 dark:bg-zinc-900/30 backdrop-blur-xl shadow-xl transition-transform duration-500 transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ transitionTimingFunction: 'cubic-bezier(0,0,0,0.99)' }}
      >
        <div className="flex h-full flex-col border-l border-zinc-700/50 dark:border-zinc-400/40">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-700 px-6 py-4">
            <h2 className="text-lg font-semibold text-black dark:text-white">Shopping Cart</h2>
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <ShoppingBag className="h-16 w-16 text-zinc-600 mb-4" />
                <p className="dark:text-zinc-400 text-zinc-900 text-lg mb-2">Your cart is empty</p>
                <p className="dark:text-zinc-500 text-zinc-900 text-sm">Add some products to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={`${item.id}-${item.color}-${item.size}`} className="bg-zinc-300/50 dark:bg-zinc-800/60 border border-zinc-600/50 dark:border-zinc-400/30 backdrop-blur-xl rounded-lg p-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 bg-zinc-700 rounded-lg flex items-center justify-center">
                        <span className="text-zinc-400 text-xs">IMG</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-black dark:text-white font-medium">{item.name}</h3>
                        <p className="text-zinc-400 text-sm">
                          {item.color} • {item.size}
                        </p>
                        <p className="text-[#059669] font-semibold">LE {item.price}</p>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-zinc-400 hover:text-red-400 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="bg-zinc-700 text-white p-1 rounded hover:bg-zinc-600 transition-colors"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-white px-3 py-1 bg-zinc-700 rounded min-w-[2rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="bg-zinc-700 text-white p-1 rounded hover:bg-zinc-600 transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <span className="text-black dark:text-white font-semibold">
                        LE {(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-zinc-700 px-6 py-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-black dark:text-white">Total:</span>
                <span className="text-xl font-bold text-[#059669]">
                  LE {getTotalPrice().toFixed(2)}
                </span>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full bg-[#059669] text-white py-3 rounded-lg font-semibold hover:bg-[#059669]/90 transition-colors"
              >
                Checkout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartSidebar;