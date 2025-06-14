import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Link } from 'react-router-dom';

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const res = await api.get('wishlist/');
      setWishlist(res.data);
    } catch (err) {
      setError('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (itemId) => {
    try {
      await api.delete(`wishlist/${itemId}/`);
      fetchWishlist();
    } catch (err) {
      setError('Failed to remove item');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-shortcut-bg-primary py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-shortcut-text-primary mb-8">Wishlist</h1>
        {wishlist.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-shortcut-text-primary mb-4">
              Your wishlist is empty
            </h2>
            <Link
              to="/products"
              className="inline-block bg-shortcut-blue text-white px-6 py-3 rounded-md hover:bg-opacity-90 transition-colors duration-300"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlist.map((item) => (
              <div key={item.id} className="bg-white dark:bg-gray-900/60 rounded-lg shadow-md p-4 flex flex-col items-center glassy">
                <img src={item.image} alt={item.name} className="w-32 h-32 object-cover rounded mb-4" />
                <h3 className="text-lg font-semibold text-shortcut-text-primary dark:text-shortcut-dark-text-primary mb-2">{item.name}</h3>
                <p className="text-shortcut-text-secondary dark:text-gray-300 mb-2">EGP {item.price}</p>
                <div className="flex gap-2">
                  <Link
                    to={`/products/${item.product}`}
                    className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => removeFromWishlist(item.id)}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist; 