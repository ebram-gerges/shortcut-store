import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Package, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';

type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  color: string;
  size: string;
};

const OrderSuccessPage = () => {
  const { clearCart } = useCart();
  const [orderItems, setOrderItems] = useState<CartItem[]>([]);
  useEffect(() => {
    const saved = localStorage.getItem('lastOrderItems');
    if (saved) {
      setOrderItems(JSON.parse(saved));
      localStorage.removeItem('lastOrderItems');
    }
    clearCart();
  }, []);

  const orderNumber = `SC${Date.now().toString().slice(-6)}`;
  const estimatedDelivery = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString();

  return (
    <div className="min-h-screen relative z-20 py-8 pt-[125px]">
      <div className="max-w-3xl mx-auto px-4 lg:px-8">
        <div className="text-center mb-12">
          <div className="mx-auto w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Order Confirmed!</h1>
          <p className="text-xl text-zinc-300 mb-2">
            Thank you for your purchase
          </p>
          <p className="text-zinc-400">
            Order #{orderNumber}
          </p>
        </div>

        <div className="bg-zinc-800/50 backdrop-blur-xl border border-zinc-600/50 rounded-lg p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-[#059669] rounded-full flex items-center justify-center">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Order Processing</h3>
                <p className="text-zinc-400 text-sm">We're preparing your items</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-[#059669] rounded-full flex items-center justify-center">
                <Truck className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-zinc-400 font-semibold">Estimated Delivery</h3>
                <p className="text-zinc-400 text-sm">{estimatedDelivery}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-zinc-700 pt-6">
            <h3 className="text-white font-semibold mb-4">Order Items</h3>
            <div className="space-y-4">
              {orderItems.map((item) => (
                <div key={`${item.id}-${item.color}-${item.size}`} className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-zinc-700 rounded-lg flex items-center justify-center">
                    <span className="text-zinc-400 text-xs">IMG</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-medium">{item.name}</h4>
                    <p className="text-zinc-400 text-sm">
                      {item.color} • {item.size} • Qty: {item.quantity}
                    </p>
                  </div>
                  <span className="text-white font-semibold">
                    LE {(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-zinc-800/50 backdrop-blur-xl border border-zinc-600/50 rounded-lg p-6 mb-8">
          <h3 className="text-white font-semibold mb-4">What's Next?</h3>
          <div className="space-y-3 text-zinc-300">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-[#1b8d69] rounded-full mt-2"></div>
              <p>You'll receive an email confirmation shortly</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-[#1b8d69] rounded-full mt-2"></div>
              <p>We'll send you tracking information once your order ships</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-[#1b8d69] rounded-full mt-2"></div>
              <p>Your order will be delivered within 3-5 business days</p>
            </div>
          </div>
        </div>

        <div className="text-center space-y-4">
          <Link
            to="/products"
            className="inline-block bg-[#059669] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#157557] transition-colors"
          >
            Continue Shopping
          </Link>
          <div>
            <Link
              to="/"
              className="text-zinc-400 hover:text-white transition-colors"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;