import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Package, Calendar, BadgeCheck } from 'lucide-react';

interface OrderItem {
  id: number;
  product: { id: number; name: string; image: string };
  quantity: number;
  price: number;
  color: string;
  size: string;
}

interface Order {
  id: number;
  total_price: number;
  created_at: string;
  items: OrderItem[];
}

const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/orders/user-orders/')
      .then(res => setOrders(res.data.orders))
      .catch(() => setError('Could not fetch your orders.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen relative z-20 py-8 pt-[125px] bg-zinc-900">
      <div className="max-w-4xl mx-auto px-4 lg:px-8">
        <h1 className="text-3xl font-bold text-white mb-8">Your Orders</h1>
        {orders.length === 0 ? (
          <div className="text-center text-zinc-400 text-lg">You have no orders yet.</div>
        ) : (
          <div className="space-y-8">
            {orders.map(order => (
              <div key={order.id} className="bg-zinc-800/60 border border-zinc-700 rounded-xl p-6 shadow-lg">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
                  <div className="flex items-center gap-3">
                    <BadgeCheck className="w-6 h-6 text-[#059669]" />
                    <span className="text-lg text-white font-semibold">Order #{order.id}</span>
                  </div>
                  <div className="flex items-center gap-3 text-zinc-400">
                    <Calendar className="w-5 h-5" />
                    <span>{new Date(order.created_at).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-3 text-zinc-400">
                    <Package className="w-5 h-5" />
                    <span>Total: <span className="text-white font-bold">LE {order.total_price.toFixed(2)}</span></span>
                  </div>
                </div>
                <div className="border-t border-zinc-700 pt-4">
                  <h3 className="text-white font-semibold mb-2">Items</h3>
                  <div className="space-y-3">
                    {order.items.map(item => (
                      <div key={item.id} className="flex items-center gap-4 bg-zinc-900/60 rounded-lg p-3">
                        <div className="w-12 h-12 bg-zinc-700 rounded flex items-center justify-center overflow-hidden">
                          {item.product.image ? (
                            <img src={item.product.image} alt={item.product.name} className="object-cover w-full h-full" />
                          ) : (
                            <span className="text-zinc-400 text-xs">IMG</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="text-white font-medium">{item.product.name}</div>
                          <div className="text-zinc-400 text-sm">{item.color} • {item.size} • Qty: {item.quantity}</div>
                        </div>
                        <div className="text-white font-semibold">LE {(item.price * item.quantity).toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage; 