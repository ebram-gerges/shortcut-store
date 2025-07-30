import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Shield, ArrowLeft, CircleDollarSign, AlertTriangle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { fetchUserProfile } from '../services/authService';
import { isOneSizeCategory } from '../utils/oneSizeCategory';

// Phone number formatting utility
const formatPhoneNumber = (phone: string): string => {
  // Remove any existing country code or + symbol
  let cleanPhone = phone.replace(/^\+/, '').replace(/^20/, '');
  
  // Remove leading 0 if present
  if (cleanPhone.startsWith('0')) {
    cleanPhone = cleanPhone.substring(1);
  }
  
  // Add +20 prefix
  return `+20${cleanPhone}`;
};

const CheckoutPage = () => {
  const { items, getTotalPrice, clearCart } = useCart();
  const { user, isAuthenticated, token } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    governorate: '',
    email: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',
  });
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherApplied, setVoucherApplied] = useState(false);
  const [voucherError, setVoucherError] = useState('');
  const [voucherDiscount, setVoucherDiscount] = useState(0);
  const [voucherPercent, setVoucherPercent] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (user && token) {
      const getUserProfile = async () => {
        try {
          const profile = await fetchUserProfile(token);
          setFormData(prevData => ({
            ...prevData,
            firstName: profile.first_name || '',
            lastName: profile.last_name || '',
            phone: formatPhoneNumber(profile.phone || ''),
            address: profile.address || '',
            city: profile.city || '',
            governorate: profile.governorate || '',
            email: profile.email || '',
          }));
        } catch (error) {
          console.error('Failed to fetch user profile', error);
          toast.error('Could not load user data.');
        }
      };
      getUserProfile();
    }
  }, [user, token]);

  // Remove shipping fee logic
  const subtotal = getTotalPrice();
  // const shipping = subtotal > 100 ? 0 : 15; // REMOVED
  // const totalBeforeDiscount = subtotal + shipping; // REPLACED WITH:
  const totalBeforeDiscount = subtotal;
  const total = Math.max(0, totalBeforeDiscount - voucherDiscount);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      // Format phone number before sending to backend
      const formattedPhone = formatPhoneNumber(formData.phone);
      
      // Call backend to place order (update this endpoint as needed)
      const response = await api.post('/api/orders/place/', {
        items,
        ...formData,
        phone: formattedPhone,
        paymentMethod,
        voucherCode: voucherApplied ? voucherCode : undefined,
      });
      
      // Only clear cart after successful order placement
      clearCart();
      const orderId = response.data.order_id;
      navigate(`/order-success?order_id=${orderId}`, { state: { order_id: orderId } });
    } catch (err: unknown) {
      let message = 'Order failed. Please try again.';
      if (err && typeof err === 'object' && 'response' in err && err.response && typeof err.response === 'object' && 'data' in err.response && err.response.data && typeof err.response.data === 'object' && 'detail' in err.response.data) {
        // @ts-expect-error: dynamic error object from axios, not typed
        message = err.response.data.detail;
      } else if (err instanceof Error) {
        message = err.message;
      }
      toast.error(message, { style: { background: '#1b1b1b', color: '#fff', border: '1px solid #059669' } });
      // Don't clear cart on error - let user try again
    } finally {
      setIsProcessing(false);
    }
  };

  // Voucher apply handler
  const handleApplyVoucher = async () => {
    setVoucherError('');
    setVoucherApplied(false);
    setVoucherDiscount(0);
    setVoucherPercent(0);
    if (!voucherCode.trim()) return;
    try {
      // Call backend to validate voucher
      const res = await api.post('/api/vouchers/apply/', {
        code: voucherCode,
        items,
        total: totalBeforeDiscount.toFixed(2),
      });
      setVoucherApplied(true);
      // Ensure discount values are always numbers and not NaN
      const discountAmount = Number(res.data.discount_amount);
      const discountPercent = Number(res.data.discount_percent);
      setVoucherDiscount(!isNaN(discountAmount) && isFinite(discountAmount) ? discountAmount : 0);
      setVoucherPercent(!isNaN(discountPercent) && isFinite(discountPercent) ? discountPercent : 0);
      toast.success(`Voucher applied! -${!isNaN(discountPercent) && isFinite(discountPercent) ? discountPercent : 0}%`);
    } catch (err: unknown) {
      function isAxiosErrorWithErrorField(e: unknown): e is { response: { data: { error: string } } } {
        if (typeof e !== 'object' || e === null) return false;
        const maybeResponse = (e as { response?: unknown }).response;
        if (typeof maybeResponse !== 'object' || maybeResponse === null) return false;
        const maybeData = (maybeResponse as { data?: unknown }).data;
        if (typeof maybeData !== 'object' || maybeData === null) return false;
        return 'error' in maybeData;
      }
      if (isAxiosErrorWithErrorField(err)) {
        setVoucherError(err.response.data.error || 'Invalid voucher code.');
      } else {
        setVoucherError('Invalid voucher code.');
      }
      setVoucherApplied(false);
      setVoucherDiscount(0);
      setVoucherPercent(0);
    }
  };

  if (items.length === 0) {
    return (
      <div className="py-8 min-h-screen bg-zinc-900">
        <div className="px-4 mx-auto max-w-4xl text-center lg:px-8">
          <h1 className="mb-8 text-3xl font-bold text-white">Your cart is empty</h1>
          <button
            onClick={() => navigate('/products')}
            className="bg-[#059669] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#1b8d69] transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-20 py-8 pt-2 min-h-screen">
      {/* Login Required Modal */}
      {showLoginModal && (
        <div className="flex fixed inset-0 z-50 justify-center items-center bg-black/60">
          <div className="flex flex-col items-center p-8 w-full max-w-md bg-white rounded-2xl border shadow-2xl dark:bg-zinc-900 border-zinc-700">
            <AlertTriangle className="w-12 h-12 text-[#059669] mb-4" />
            <h2 className="mb-2 text-2xl font-bold text-zinc-900 dark:text-white">Login Required</h2>
            <p className="mb-6 text-center text-zinc-700 dark:text-zinc-300">You need to login to checkout.</p>
            <button
              className="w-full bg-[#059669] text-white py-3 px-4 rounded-lg font-semibold hover:bg-[#157557] focus:outline-none focus:ring-2 focus:ring-[#059669] focus:ring-offset-2 focus:ring-offset-zinc-900 transition-colors"
              onClick={() => navigate('/login')}
            >
              Go to Login
            </button>
          </div>
        </div>
      )}
      <div className={`max-w-6xl mx-auto px-4 lg:px-8 ${showLoginModal ? 'blur-sm pointer-events-none select-none' : ''}`}>
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center mb-4 transition-colors dark:text-zinc-400 text-zinc-900 hover:text-white"
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-black dark:text-white">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Checkout Form */}
          <div className="space-y-8">
            {/* Contact Information */}
            <div className="p-6 rounded-lg border backdrop-blur-xl bg-zinc-800/60 dark:bg-zinc-900/20 border-zinc-400/50 dark:border-zinc-700/50">
              <h2 className="mb-6 text-xl font-semibold text-white">Contact Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-zinc-200">
                    Email address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-zinc-700/30 backdrop-blur-xl border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-[#059669]"
                    placeholder="your@email.com"
                  />
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="p-6 rounded-lg border backdrop-blur-xl bg-zinc-800/60 dark:bg-zinc-900/20 border-zinc-400/50 dark:border-zinc-700/50">
              <h2 className="mb-6 text-xl font-semibold text-white">Shipping Address</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block mb-2 text-sm font-medium text-zinc-300">
                    First name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-zinc-700/30 backdrop-blur-xl border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-[#059669]"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-zinc-300">
                    Last name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-zinc-700/30 backdrop-blur-xl border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-[#059669]"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block mb-2 text-sm font-medium text-zinc-300">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-zinc-700/30 backdrop-blur-xl border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-[#059669]"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-zinc-300">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-zinc-700/30 backdrop-blur-xl border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-[#059669]"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-zinc-300">
                    Governorate
                  </label>
                  <input
                    type="text"
                    name="governorate"
                    value={formData.governorate}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-zinc-700/30 backdrop-blur-xl border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-[#059669]"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block mb-2 text-sm font-medium text-zinc-300">
                    Phone number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-zinc-700/30 backdrop-blur-xl border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-[#059669]"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="p-6 rounded-lg border backdrop-blur-xl bg-zinc-800/60 dark:bg-zinc-900/20 border-zinc-400/50 dark:border-zinc-700/50">
              <h2 className="mb-6 text-xl font-semibold text-white">Payment Method</h2>
              
              <div className="mb-6 space-y-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash"
                    checked={paymentMethod === 'cash'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-[#059669] bg-zinc-700 border-zinc-600"
                  />
                  <CircleDollarSign className="mr-2 ml-3 w-5 h-5 text-zinc-100" />
                  <span className="text-white">Cash on Delivery</span>
                </label>
              </div>

              <div className="p-4 rounded-lg bg-zinc-700/30">
                <p className="text-sm text-zinc-300">
                  Pay with cash when your order is delivered. No additional fees.
                </p>
              </div>
            </div>

            {/* Voucher Code Field */}
            <div className="p-6 rounded-lg border backdrop-blur-xl bg-zinc-800/60 dark:bg-zinc-900/20 border-zinc-400/50 dark:border-zinc-700/50">
              <h2 className="mb-4 text-xl font-semibold text-white">Have a voucher code?</h2>
              <div className="flex flex-col gap-2 items-stretch sm:flex-row">
                <input
                  type="text"
                  value={voucherCode}
                  onChange={e => setVoucherCode(e.target.value)}
                  placeholder="Enter voucher code"
                  className="flex-1 px-4 py-3 w-full text-white rounded-lg border border-zinc-700 bg-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-green-500"
                  disabled={voucherApplied}
                />
                <button
                  type="button"
                  onClick={handleApplyVoucher}
                  className={`w-full sm:w-auto px-6 py-3 rounded-lg font-semibold transition-colors ${voucherApplied ? 'text-white bg-green-700' : 'text-white bg-green-600 hover:bg-green-700'}`}
                  disabled={voucherApplied}
                >
                  {voucherApplied ? 'Applied' : 'Apply'}
                </button>
              </div>
              {voucherError && <div className="mt-2 text-red-400">{voucherError}</div>}
              {voucherApplied && (
                <div className="mt-2 text-green-400">Voucher applied: -{typeof voucherPercent === 'number' && !isNaN(voucherPercent) ? voucherPercent.toFixed(2) : '0.00'}% (-LE {typeof voucherDiscount === 'number' && !isNaN(voucherDiscount) ? voucherDiscount.toFixed(2) : '0.00'})</div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <div className="p-6 rounded-lg border backdrop-blur-xl bg-zinc-800/60 dark:bg-zinc-900/20 border-zinc-400/50 dark:border-zinc-700/50">
              <h2 className="mb-6 text-xl font-semibold text-white">Order Summary</h2>
              
              <div className="mb-6 space-y-4">
                {items.map((item) => {
                  const salePercent = typeof item.sale_percent === 'number' ? item.sale_percent : 0;
                  const hasSale = salePercent > 0;
                  const basePrice = item.price;
                  const salePrice = hasSale ? basePrice * (1 - salePercent / 100) : basePrice;
                  return (
                    <div key={`${item.id}-${item.color}-${item.size}`} className="flex items-center space-x-4">
                      <div className="flex overflow-hidden justify-center items-center w-16 h-16 rounded-lg bg-zinc-700">
                        {item.image ? (
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <span className="text-xs text-zinc-100">IMG</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-white">{item.name}</h3>
                        <p className="text-sm text-zinc-100">
                          {/* Remove item.product references, use only item fields */}
                          {item.color && item.size
                            ? `${item.color} • ${item.size} • Qty: ${item.quantity}`
                            : `Qty: ${item.quantity}`}
                        </p>
                        {hasSale && (
                          <div className="mt-1 text-xs font-semibold text-green-400">{salePercent}% OFF</div>
                        )}
                      </div>
                      <span className="flex flex-col items-end font-semibold text-white">
                        {hasSale ? (
                          <>
                            <span className="mb-1 text-sm line-through text-zinc-400">{(basePrice * item.quantity).toFixed(2)} EGP</span>
                            <span className="text-base font-bold text-green-400">{(salePrice * item.quantity).toFixed(2)} EGP</span>
                          </>
                        ) : (
                          <span className="text-base">{(basePrice * item.quantity).toFixed(2)} EGP</span>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 space-y-2 border-t border-zinc-700">
                <div className="flex justify-between text-zinc-100">
                  <span>Subtotal</span>
                  <span>{subtotal.toFixed(2)} EGP</span>
                </div>
                {/* Delivery message replaces shipping fee */}
                <div className="flex justify-between text-zinc-100">
                  <span>Delivery</span>
                  <span className="text-yellow-400 text-sm">
                    The delivery cost will be sent to you via WhatsApp or email within 24 hours.
                  </span>
                </div>
                <div className="flex justify-between mt-4 text-lg font-semibold text-white">
                  <span>Total</span>
                  <span>{total.toFixed(2)} EGP</span>
                </div>
                {voucherApplied && (
                  <div className="flex justify-between mt-1 text-sm text-green-400">
                    <span>Voucher Discount</span>
                    <span>-{typeof voucherDiscount === 'number' && !isNaN(voucherDiscount) ? voucherDiscount.toFixed(2) : '0.00'} EGP</span>
                  </div>
                )}
              </div>
            </div>

            {/* Security Features */}
            <div className="p-6 rounded-lg border backdrop-blur-xl bg-zinc-800/60 dark:bg-zinc-900/20 border-zinc-400/50 dark:border-zinc-700/50">
              <div className="flex items-center space-x-4 text-zinc-100">
                <Shield className="h-6 w-6 text-[#1b8d69]" />
                <div>
                  <p className="font-medium">Secure Checkout</p>
                  <p className="text-sm">Your payment information is encrypted</p>
                </div>
              </div>
              <div className="flex items-center mt-4 space-x-4 text-zinc-100">
                <Truck className="h-6 w-6 text-[#1b8d69]" />
                <div>
                  <p className="font-medium">Delivery Policy</p>
                  <p className="text-sm">
                    Delivery cost will be communicated to you via WhatsApp or email after order placement.
                  </p>
                </div>
              </div>
            </div>

            {/* Place Order Button */}
            <form onSubmit={handleSubmit}>
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-[#059669] text-white py-4 rounded-lg font-semibold hover:bg-[#157557] focus:outline-none focus:ring-2 focus:ring-[#059669] focus:ring-offset-2 focus:ring-offset-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isProcessing ? 'Processing...' : `Place Order - ${total.toFixed(2)} EGP`}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;