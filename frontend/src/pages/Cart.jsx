import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      const res = await api.get('cart/');
      setCartItems(res.data);
    } catch (err) {
      setError('Failed to load cart items');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    try {
      await api.patch(`cart/${itemId}/`, { quantity: newQuantity });
      fetchCartItems();
    } catch (err) {
      setError('Failed to update quantity');
    }
  };

  const removeItem = async (itemId) => {
    try {
      await api.delete(`cart/${itemId}/`);
      fetchCartItems();
    } catch (err) {
      setError('Failed to remove item');
    }
  };

  const subtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const shipping = 10;
  const total = subtotal + shipping;

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-shortcut-text-primary mb-8">Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-shortcut-text-primary mb-4">
              Your cart is empty
            </h2>
            <Link
              to="/products"
              className="inline-block bg-shortcut-blue text-white px-6 py-3 rounded-md hover:bg-opacity-90 transition-colors duration-300"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-shortcut-glass-card border border-emerald-200/40 dark:border-emerald-900/30 shadow-glass rounded-xl overflow-hidden">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center p-6 border-b border-shortcut-border-light last:border-b-0"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded-md"
                    />
                    <div className="ml-6 flex-1">
                      <h3 className="text-lg font-medium text-shortcut-text-primary">
                        {item.name}
                      </h3>
                      <p className="text-shortcut-text-secondary">
                        Size: {item.size} | Color: {item.color}
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="text-shortcut-text-secondary hover:text-shortcut-text-primary"
                          >
                            -
                          </button>
                          <span className="text-shortcut-text-primary">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="text-shortcut-text-secondary hover:text-shortcut-text-primary"
                          >
                            +
                          </button>
                        </div>
                        <span className="text-lg font-medium text-shortcut-text-primary">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="ml-6 text-shortcut-text-secondary hover:text-shortcut-text-primary"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-shortcut-glass-strong border border-emerald-200/40 dark:border-emerald-900/30 shadow-glass rounded-xl p-6">
                <h2 className="text-xl font-semibold text-shortcut-text-primary mb-4">
                  Order Summary
                </h2>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-shortcut-text-secondary">Subtotal</span>
                    <span className="text-shortcut-text-primary">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-shortcut-text-secondary">Shipping</span>
                    <span className="text-shortcut-text-primary">${shipping.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-shortcut-border-light pt-4">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold text-shortcut-text-primary">
                        Total
                      </span>
                      <span className="text-lg font-semibold text-shortcut-text-primary">
                        ${total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <Link
                    to="/checkout"
                    className="block w-full bg-shortcut-blue text-white text-center py-3 rounded-md hover:bg-opacity-90 transition-colors duration-300"
                  >
                    Proceed to Checkout
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart; 