import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, Package, Truck } from 'lucide-react';
import api from '../services/api';
import { isOneSizeCategory } from '../utils/oneSizeCategory';

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  color: string;
  size: string;
  image: string;
}

interface Order {
  id: number;
  serial?: string;
  total_price: number;
  created_at: string;
  items: OrderItem[];
}

const OrderSuccessPage = () => {
  const location = useLocation();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Define a type for location.state
  type LocationState = { order_id?: string };

  useEffect(() => {
    // Try to get order_id from state or query param
    let orderId = null;
    const state = location.state as LocationState | null;
    if (state && state.order_id) {
      orderId = state.order_id;
    } else {
      const params = new URLSearchParams(window.location.search);
      orderId = params.get('order_id');
    }
    if (!orderId) {
      setError('No order ID found.');
      setLoading(false);
      return;
    }
    api.get(`/api/orders/summary/${orderId}/`)
      .then(res => {
        const orderData = res.data.order;
        setOrder({
          id: orderData.id,
          serial: orderData.serial,
          total_price: Number(orderData.total_price),
          created_at: orderData.created_at,
          items: (orderData.items as Array<{
            product: { id: number; name: string; image: string };
            price: string | number;
            quantity: number;
            color: string;
            size: string;
          }>).map((item) => ({
            id: item.product.id,
            name: item.product.name,
            price: Number(item.price),
            quantity: item.quantity,
            color: item.color,
            size: item.size,
            image: item.product.image,
          })),
        });
      })
      .catch((error) => {
        console.error('Order fetch error:', error);
        if (error.response) {
          console.error('Error response:', error.response.data);
          setError(`Could not fetch order details: ${error.response.data.error || error.response.statusText}`);
        } else {
          setError('Could not fetch order details.');
        }
      })
      .finally(() => setLoading(false));
  }, [location]);

  const estimatedDelivery = order ? new Date(new Date(order.created_at).getTime() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString() : '';

  if (loading) return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  if (!order) return null;

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
            Order Serial: {order.serial}
          </p>
          <p className="text-xl text-[#059669] font-bold mt-2">
            Total: LE {order.total_price.toFixed(2)}
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
              {order.items.map((item) => (
                <div key={`${item.id}-${item.color}-${item.size}`} className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-zinc-700 rounded-lg flex items-center justify-center overflow-hidden">
                    {item.image ? (
                      <img src={`${import.meta.env.VITE_API_BASE_URL}${item.image}`} alt={item.name} className="object-cover w-full h-full" />
                    ) : (
                      <span className="text-zinc-400 text-xs">IMG</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-medium">{item.name}</h4>
                    <p className="text-zinc-400 text-sm">
                      {isOneSizeCategory(undefined, undefined) && item.color // fallback, update if product.category/subcategory available
                        ? `one size ${item.name} (${item.color})`
                        : `${item.color} • ${item.size} • Qty: ${item.quantity}`}
                    </p>
                  </div>
                  <span className="text-white font-semibold">
                    LE {item.price.toFixed(2)}
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