import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const Checkout = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    try {
      await api.post('orders/', {
        shipping: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zipCode,
        },
        payment: {
          card_number: formData.cardNumber,
          expiry_date: formData.expiryDate,
          cvv: formData.cvv,
        },
      });
      setSuccess(true);
      setFormData({
        firstName: '', lastName: '', email: '', address: '', city: '', state: '', zipCode: '', cardNumber: '', expiryDate: '', cvv: '',
      });
      fetchCartItems();
    } catch (err) {
      setError('Failed to place order');
    }
  };

  const subtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const shipping = cartItems.length > 0 ? 10 : 0;
  const total = subtotal + shipping;

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-shortcut-bg-primary py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-shortcut-text-primary mb-8">Checkout</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-shortcut-text-primary mb-4">
                  Personal Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-shortcut-text-secondary mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-shortcut-border-light rounded focus:outline-none focus:border-shortcut-blue"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-shortcut-text-secondary mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-shortcut-border-light rounded focus:outline-none focus:border-shortcut-blue"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-shortcut-text-secondary mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-shortcut-border-light rounded focus:outline-none focus:border-shortcut-blue"
                      required
                    />
                  </div>
                </div>
              </div>
              {/* Shipping Address */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-shortcut-text-primary mb-4">
                  Shipping Address
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-shortcut-text-secondary mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-shortcut-border-light rounded focus:outline-none focus:border-shortcut-blue"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-shortcut-text-secondary mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-shortcut-border-light rounded focus:outline-none focus:border-shortcut-blue"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-shortcut-text-secondary mb-1">
                        State
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-shortcut-border-light rounded focus:outline-none focus:border-shortcut-blue"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-shortcut-text-secondary mb-1">
                        ZIP Code
                      </label>
                      <input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-shortcut-border-light rounded focus:outline-none focus:border-shortcut-blue"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
              {/* Payment Information */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-shortcut-text-primary mb-4">
                  Payment Information
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-shortcut-text-secondary mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-shortcut-border-light rounded focus:outline-none focus:border-shortcut-blue"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-shortcut-text-secondary mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        name="expiryDate"
                        value={formData.expiryDate}
                        onChange={handleInputChange}
                        placeholder="MM/YY"
                        className="w-full p-2 border border-shortcut-border-light rounded focus:outline-none focus:border-shortcut-blue"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-shortcut-text-secondary mb-1">
                        CVV
                      </label>
                      <input
                        type="text"
                        name="cvv"
                        value={formData.cvv}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-shortcut-border-light rounded focus:outline-none focus:border-shortcut-blue"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
              {error && <div className="text-red-500 text-center">{error}</div>}
              {success && <div className="text-green-600 text-center">Order placed successfully!</div>}
              <button
                type="submit"
                className="w-full bg-shortcut-blue text-white py-3 rounded-md hover:bg-opacity-90 transition-colors duration-300"
              >
                Place Order
              </button>
            </form>
          </div>
          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-shortcut-text-primary mb-4">
                Order Summary
              </h2>
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div className="flex items-center justify-between" key={item.id}>
                    <span className="text-shortcut-text-secondary">{item.name} x{item.quantity}</span>
                    <span className="text-shortcut-text-primary">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t border-shortcut-border-light pt-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-shortcut-text-secondary">Subtotal</span>
                    <span className="text-shortcut-text-primary">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-shortcut-text-secondary">Shipping</span>
                    <span className="text-shortcut-text-primary">${shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span className="text-shortcut-text-primary">Total</span>
                    <span className="text-shortcut-text-primary">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout; 