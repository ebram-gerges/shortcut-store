import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
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

const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.get(`/api/orders/summary/${id}/`)
      .then(res => setOrder(res.data.order))
      .catch(() => setError('Could not fetch order details.'))
      .finally(() => setLoading(false));
  }, [id]);

  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
    return `${import.meta.env.VITE_API_BASE_URL}${imagePath}`;
  };

  const getOrderBreakdown = (order: Order) => {
    let subtotal = 0;
    let saleDiscount = 0;
    let afterSaleTotal = 0;
    order.items.forEach(item => {
      const base = (item.original_price || 0) * item.quantity;
      subtotal += base;
      const afterSale = item.product.sale_percent && item.product.sale_percent > 0
        ? base * (1 - item.product.sale_percent / 100)
        : base;
      saleDiscount += base - afterSale;
      afterSaleTotal += afterSale;
    });
    const total = order.total_price;
    const voucherDiscount = afterSaleTotal - total;
    return { subtotal, saleDiscount, voucherDiscount, total };
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-400">{error}</div>;
  if (!order) return null;

  const breakdown = getOrderBreakdown(order);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-zinc-900 to-zinc-800 px-4 py-12">
      <div className="w-full max-w-2xl bg-zinc-900 rounded-xl shadow-lg p-8">
        <button className="mb-4 text-zinc-400 hover:text-white" onClick={() => navigate(-1)}>&larr; Back</button>
        <h1 className="text-2xl font-bold text-white mb-2">Order Details</h1>
        <div className="mb-2 text-zinc-400">Serial: <span className="text-green-400 font-mono">{order.serial}</span></div>
        <div className="mb-2 text-zinc-400">Status: <span className="text-white">{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span></div>
        <div className="mb-2 text-zinc-400">Placed: <span className="text-white">{new Date(order.created_at).toLocaleString()}</span></div>
        <div className="mb-4 text-zinc-400">Total: <span className="text-white font-bold">{order.total_price.toFixed(2)} EGP</span></div>
        <div className="mb-4">
          <h3 className="text-white font-semibold mb-2">Items</h3>
          <ul className="space-y-2">
            {order.items.map(item => {
              const salePercent = typeof item.product.sale_percent === 'number' ? item.product.sale_percent : 0;
              const hasSale = salePercent > 0 && item.original_price && item.original_price > item.price / item.quantity;
              const perItemPrice = item.price / item.quantity;
              return (
                <li key={item.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-zinc-700 rounded flex items-center justify-center overflow-hidden">
                    {item.product.image ? (
                      <img src={getImageUrl(item.product.image)} alt={item.product.name} className="object-cover w-full h-full" />
                    ) : (
                      <span className="text-zinc-400 text-xs">IMG</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-white text-sm font-medium">{item.product.name}</div>
                    <div className="text-zinc-400 text-xs">
                      {isOneSizeCategory(item.product.category, item.product.subcategory) && item.color
                        ? `one size ${item.product.name} (${item.color})`
                        : `${item.color} • ${item.size} • Qty: ${item.quantity}`}
                    </div>
                    {hasSale && (
                      <div className="text-green-400 text-xs font-semibold mt-1">{salePercent}% OFF</div>
                    )}
                  </div>
                  <div className="flex flex-col items-end min-w-[110px]">
                    {hasSale ? (
                      <>
                        <span className="text-zinc-400 text-xs line-through">{item.original_price?.toFixed(2)} EGP</span>
                        <span className="text-white text-xs">{perItemPrice.toFixed(2)} EGP each</span>
                        <span className="text-white font-semibold mt-1">Total: {item.price.toFixed(2)} EGP</span>
                      </>
                    ) : (
                      <>
                        <span className="text-white text-xs">{perItemPrice.toFixed(2)} EGP each</span>
                        <span className="text-white font-semibold mt-1">Total: {item.price.toFixed(2)} EGP</span>
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
        {/* Price breakdown */}
        <div className="bg-zinc-800 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-2">Price Breakdown</h4>
          <ul className="text-zinc-300 text-sm space-y-1">
            <li>Subtotal: <span className="text-white font-semibold">{breakdown.subtotal.toFixed(2)} EGP</span></li>
            <li>Sale Discount: <span className="text-green-400 font-semibold">-{breakdown.saleDiscount.toFixed(2)} EGP</span></li>
            <li>Voucher Discount: <span className="text-blue-400 font-semibold">-{breakdown.voucherDiscount.toFixed(2)} EGP</span></li>
            <li className="mt-2">Total: <span className="text-white font-bold">{breakdown.total.toFixed(2)} EGP</span></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage; 