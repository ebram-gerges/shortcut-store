import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import ProductCard from '../components/ProductCard';
import api from '../api/axios';

const Home = () => {
  const [products, setProducts] = useState([]);
  const staticCategories = [
    {
      name: 'T-Shirts',
      image: '/categories/tshirts.jpg',
    },
    {
      name: 'Basic Tops',
      image: '/categories/basictops.jpg',
    },
    {
      name: 'Shoes',
      image: '/categories/shoes.jpg',
    },
  ];
  const [categories] = useState(staticCategories);
  const [featuredProduct, setFeaturedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await api.get('products/');
        const data = res.data;
        setProducts(data);
        // Pick one featured product (first one)
        if (data.length > 0) {
          const prod = data[0];
          setFeaturedProduct({
            id: prod.id,
            name: prod.name,
            price: prod.price,
            image: prod.image,
            colors: prod.color_variants?.map((v) => v.color_hex || v.color) || [],
            sizes: prod.available_sizes || [],
            sale: prod.sale_percent > 0,
            originalPrice: prod.price,
          });
        } else {
          setFeaturedProduct(null);
        }
      } catch (err) {
        setError('Failed to load products.');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[70vh] min-h-[500px] bg-transparent overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/hero-bg.jpg"
            alt="Hero Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40" />
        </div>
        <div className="relative h-full text-center px-4 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl h-[270px] p-8 rounded-2xl shadow-glass flex flex-col items-center justify-center bg-[#047857A0] backdrop-blur-md"
          >
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 font-montserrat">
              Discover Your Style
            </h1>
            <p className="text-[18px] text-white mb-8 font-montserrat">
              Shop the latest trends in fashion and accessories
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-shortcut-black px-8 py-3 rounded-full text-lg font-semibold hover:bg-opacity-90 transition-all transition ease-out duration-200 font-montserrat"
            >
              Shop Now
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Featured Product */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-shortcut-text-primary mb-8 text-center text-white font-montserrat">
            Featured Product
          </h2>
          {loading ? (
            <div className="text-center text-lg">Loading...</div>
          ) : error ? (
            <div className="text-center text-red-500">{error}</div>
          ) : featuredProduct ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              <ProductCard product={featuredProduct} />
            </div>
          ) : (
            <div className="text-center text-lg">No featured product found.</div>
          )}
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 px-4 bg-transparent">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-shortcut-text-primary mb-8 text-center font-montserrat text-white">
            Shop by Category
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.02 }}
                className="relative h-64 rounded-lg overflow-hidden cursor-pointer bg-shortcut-glass-card shadow-glass"
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                  <h3 className="text-2xl font-bold text-white">{category.name}</h3>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 