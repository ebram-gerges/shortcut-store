import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await api.get(`products/${id}/`);
        setProduct(res.data);
      } catch (err) {
        setError('Failed to load product.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <div className="text-center text-lg">Loading...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;
  if (!product) return <div className="text-center text-lg">Product not found.</div>;

  // Prepare images, colors, sizes
  const images = product.images || (product.image ? [product.image] : []);
  const colors = product.color_variants?.map(v => ({ name: v.color, value: v.color_hex || v.color })) || [];
  const sizes = product.available_sizes || [];

  return (
    <div className="min-h-screen bg-shortcut-bg-primary py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            {images.length > 0 && (
              <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg">
                <img
                  src={images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            {images.length > 1 && (
              <div className="grid grid-cols-3 gap-4">
                {images.slice(1).map((image, index) => (
                  <div key={index} className="aspect-w-1 aspect-h-1 overflow-hidden rounded-lg">
                    <img
                      src={image}
                      alt={`${product.name} ${index + 2}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-shortcut-text-primary">
                {product.name}
              </h1>
              <div className="mt-2 flex items-center space-x-4">
                <span className="text-2xl font-bold text-shortcut-text-primary">
                  {product.price} EGP
                </span>
                {product.originalPrice && (
                  <span className="text-lg text-shortcut-text-secondary line-through">
                    {product.originalPrice} EGP
                  </span>
                )}
              </div>
            </div>

            <p className="text-shortcut-text-secondary">{product.description}</p>

            {/* Color Selection */}
            {colors.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-shortcut-text-primary">Color</h3>
                <div className="mt-2 flex space-x-2">
                  {colors.map((color) => (
                    <button
                      key={color.value}
                      className={`w-8 h-8 rounded-full border-2 ${selectedColor === color.value ? 'border-shortcut-blue' : 'border-transparent'}`}
                      style={{ backgroundColor: color.value }}
                      onClick={() => setSelectedColor(color.value)}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {sizes.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-shortcut-text-primary">Size</h3>
                <div className="mt-2 grid grid-cols-5 gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      className={`px-4 py-2 border rounded-md ${selectedSize === size ? 'border-shortcut-blue bg-shortcut-blue text-white' : 'border-shortcut-border-light hover:border-shortcut-border-medium'}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <h3 className="text-sm font-medium text-shortcut-text-primary">Quantity</h3>
              <div className="mt-2 flex items-center space-x-4">
                <button
                  className="w-8 h-8 border border-shortcut-border-light rounded-md flex items-center justify-center"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  -
                </button>
                <span className="text-shortcut-text-primary">{quantity}</span>
                <button
                  className="w-8 h-8 border border-shortcut-border-light rounded-md flex items-center justify-center"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              className="w-full bg-shortcut-blue text-white py-3 rounded-md hover:bg-opacity-90 transition-colors duration-300"
              onClick={() => {/* Add to cart logic */}}
            >
              Add to Cart
            </button>

            {/* Features */}
            {product.features && product.features.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-shortcut-text-primary mb-2">
                  Features
                </h3>
                <ul className="list-disc list-inside space-y-1 text-shortcut-text-secondary">
                  {product.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail; 