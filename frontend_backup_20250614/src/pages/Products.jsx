import React, { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard';
import api from '../api/axios';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await api.get('products/');
        setProducts(res.data);
      } catch (err) {
        setError('Failed to load products.');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-shortcut-text-primary mb-4">
            Our Products
          </h1>
          <p className="text-shortcut-text-secondary">
            Discover our latest collection of fashion and accessories
          </p>
        </div>
        {/* Filters */}
        <div className="mb-8 flex flex-wrap gap-4 justify-center items-center">
          <select className="px-4 py-2 rounded border border-gray-300 bg-white text-gray-700">
            <option>All Categories</option>
            <option>T-Shirts</option>
            <option>Basic Tops</option>
            <option>Shoes</option>
          </select>
          <select className="px-4 py-2 rounded border border-gray-300 bg-white text-gray-700">
            <option>All Colors</option>
            <option>White</option>
            <option>Black</option>
            <option>Blue</option>
            <option>Red</option>
            <option>Green</option>
          </select>
          <input type="range" min="0" max="5000" className="w-40" />
          <span className="ml-2 text-gray-600">Price</span>
        </div>
        {/* Products Grid */}
        {loading ? (
          <div className="text-center text-lg">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : products.length === 0 ? (
          <div className="text-center text-lg">No products found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={{
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  image: product.image,
                  colors: product.color_variants?.map((v) => v.color_hex || v.color) || [],
                  sizes: product.available_sizes || [],
                  sale: product.sale_percent > 0,
                  originalPrice: product.price,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Products; 