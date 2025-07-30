import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { isOneSizeCategory } from '../utils/oneSizeCategory';

interface OrderItem {
  id: number;
  product: { id: number; name: string; image: string; sale_percent?: number };
  quantity: number;
  price: number; // final price after sale
  original_price?: number;
  color: string;
  size: string;
}

interface Order {
  id: number;
  serial: string;
  status: string;
  total_price: number;
  created_at: string;
  shipping_address?: string;
  shipping_city?: string;
  shipping_governorate?: string;
  items: OrderItem[];
}

const OrderTrackingPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    api.get('/api/orders/user-orders/')
      .then(res => {
        setOrders(res.data.orders);
        // Debug: log the response
        console.log('API response:', res.data);
      })
      .catch((err) => {
        setError('Could not fetch your orders.');
        // Debug: log the error
        console.error('API error:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
    // Prepend backend base URL if relative
    return `${import.meta.env.VITE_API_BASE_URL}${imagePath}`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br md:flex-row from-zinc-900 to-zinc-800">
      {/* Sidebar or section title */}
      <div className="hidden p-8 w-64 border-r md:block bg-zinc-950 border-zinc-800">
        <h2 className="mb-4 text-2xl font-bold text-white">Your Orders</h2>
        <div className="text-zinc-400">Track, return, or reorder items</div>
      </div>
      {/* Orders list */}
      <div className="flex-1 p-4 md:p-8">
        <h1 className="mb-6 text-3xl font-bold text-left text-white md:hidden">Your Orders</h1>
        {loading ? (
          <div className="text-left text-white">Loading...</div>
        ) : error ? (
          <div className="text-left text-red-400">{error}</div>
        ) : orders.length === 0 ? (
          <div className="text-left text-zinc-400">You have no orders yet.</div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {orders.map(order => (
              <div key={order.id} className="flex flex-col gap-6 py-8 md:flex-row md:items-start">
                {/* Order summary info */}
                <div className="min-w-[220px] mb-4 md:mb-0">
                  <div className="mb-1 text-xs text-zinc-400">ORDER PLACED</div>
                  <div className="mb-2 font-semibold text-white">{new Date(order.created_at).toLocaleDateString()}</div>
                  <div className="mb-1 text-xs text-zinc-400">TOTAL</div>
                  <div className="mb-2 font-semibold text-white">{order.total_price.toFixed(2)} EGP</div>
                  <div className="mb-1 text-xs text-zinc-400">ORDER #</div>
                  <div className="mb-2 font-mono text-green-400">{order.serial}</div>
                  <div className="mb-1 text-xs text-zinc-400">STATUS</div>
                  <div className="mb-2 font-semibold text-white">{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</div>
                </div>
                {/* Order items */}
                <div className="flex flex-col flex-1 gap-4">
                  {order.items.map(item => {
                    const salePercent = typeof item.product.sale_percent === 'number' ? item.product.sale_percent : 0;
                    const hasSale = salePercent > 0 && item.original_price && item.original_price > item.price / item.quantity;
                    const perItemPrice = item.price / item.quantity;
                    return (
                      <button
                        key={item.id}
                        className="flex gap-4 items-center p-3 w-full text-left rounded-lg transition group hover:bg-zinc-900/60"
                        onClick={() => navigate(`/order/${order.id}`)}
                      >
                        <div className="flex overflow-hidden justify-center items-center w-16 h-16 rounded bg-zinc-700">
                          {item.product.image ? (
                            <img src={getImageUrl(item.product.image)} alt={item.product.name} className="object-cover w-full h-full" />
                          ) : (
                            <span className="text-xs text-zinc-400">IMG</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="text-base font-medium text-white group-hover:underline">{item.product.name}</div>
                          <div className="mb-1 text-xs text-zinc-400">
                            {isOneSizeCategory(item.product.category, item.product.subcategory) && item.color
                              ? `one size ${item.product.name} (${item.color})`
                              : `${item.color} • ${item.size} • Qty: ${item.quantity}`}
                          </div>
                          {hasSale && (
                            <div className="mt-1 text-xs font-semibold text-green-400">{salePercent}% OFF</div>
                          )}
                        </div>
                        <div className="flex flex-col items-end min-w-[110px]">
                          {hasSale ? (
                            <>
                              <span className="text-xs line-through text-zinc-400">{item.original_price?.toFixed(2)} EGP</span>
                              <span className="text-xs text-white">{perItemPrice.toFixed(2)} EGP each</span>
                              <span className="mt-1 font-semibold text-white">Total: {item.price.toFixed(2)} EGP</span>
                            </>
                          ) : (
                            <>
                              <span className="text-xs text-white">{perItemPrice.toFixed(2)} EGP each</span>
                              <span className="mt-1 font-semibold text-white">Total: {item.price.toFixed(2)} EGP</span>
                            </>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTrackingPage; 