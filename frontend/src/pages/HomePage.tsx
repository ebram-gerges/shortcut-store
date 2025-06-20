import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Shirt, Package, Star } from 'lucide-react';


{/*
  body::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background:
    radial-gradient(circle at 20% 80%, rgba(16, 185, 129, 0.25) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(5, 150, 105, 0.22) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(16, 185, 129, 0.20) 0%, transparent 50%),
    radial-gradient(circle at 60% 60%, rgba(52, 211, 153, 0.18) 0%, transparent 40%),
    radial-gradient(circle at 10% 10%, rgba(34, 197, 94, 0.15) 0%, transparent 30%),
    radial-gradient(circle at 90% 90%, rgba(4, 120, 87, 0.12) 0%, transparent 35%);
  pointer-events: none;
  z-index: -10;
}

[data-theme="dark"] body::before {
  background:
    radial-gradient(circle at 20% 80%, rgba(16, 185, 129, 0.12) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(5, 150, 105, 0.10) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(16, 185, 129, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 60% 60%, rgba(52, 211, 153, 0.06) 0%, transparent 40%);
}
  */}

const HomePage = () => {
  // Animation for 'Shop by Categories' section
  const categoriesRef = useRef<HTMLDivElement | null>(null);
  const [categoriesInView, setCategoriesInView] = useState(false);

  // Animation for 'Summer Collection' section
  const summerRef = useRef<HTMLDivElement | null>(null);
  const [summerInView, setSummerInView] = useState(false);

  // Animation for 'About' section
  const aboutRef = useRef<HTMLDivElement | null>(null);
  const [aboutInView, setAboutInView] = useState(false);

  useEffect(() => {
    const refCurrent = categoriesRef.current;
    if (!refCurrent) return;
    const observer = new window.IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setCategoriesInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(refCurrent);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const refCurrent = summerRef.current;
    if (!refCurrent) return;
    const observer = new window.IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSummerInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(refCurrent);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const refCurrent = aboutRef.current;
    if (!refCurrent) return;
    const observer = new window.IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAboutInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(refCurrent);
    return () => observer.disconnect();
  }, []);

  return (
    <div className='relative z-20'>
      {/* Hero Section */}
      <section className="h-[100vh] flex justify-center items-center relative text-center bg-black">
        <div className="max-w-4xl mx-auto px-4 ">
          <h1 className="text-6xl font-bold text-white mb-6 text-shadow-xl text-shadow-black" style={{ textShadow: '0px 0px 20px rgba(0, 0, 0)' }}>tshirt</h1>
          <p className="text-xl text-gray-300  mb-8" style={{ textShadow: '0px 0px 10px rgba(0, 0, 0)' }}>
            Latest Arrival! Be the first to grab it.
          </p>
          <Link
            to="/products"
            className="bg-[#059669] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#059669]/90 transition-colors inline-block shadow-[0px_0px_10px_rgba(0,0,0,0.5)]"
          >
            SHOP NOW
          </Link>
        </div>

        {/* product image */}
        {/* <div className="absolute top-0 left-0 w-full h-full bg-black">
          <img src=" alt="product image" className="w-full h-full object-cover" />
        </div> */}
      </section>

      <hr className="border-gray-700 dark:border-gray-400 border-3 w-[90%] mx-auto mt-10" />
      <div className='relative'>
        {/* Shop by Categories */}
        <section
          ref={categoriesRef}
          className={`py-20 transition-all duration-1000 ease-out transform
            ${categoriesInView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}
          `}
        >
          <div className="max-w-7xl mx-auto px-4 lg:px-8">
            <h2 className="text-3xl font-bold text-center dark:text-red-400 text-red-700 mb-12">
              Shop by Categories
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="group cursor-pointer">
                <div className="bg-gray-600 rounded-lg w-full h-[200px] max-md:h-[100px] flex items-center justify-center text-center hover:bg-gray-700 transition-colors">
                  <h3 className="text-xl font-semibold text-white dark:text-white">Shirts</h3>
                </div>
              </div>
              <div className="group cursor-pointer">
                <div className="bg-gray-600 rounded-lg w-full h-[200px] max-md:h-[100px] flex items-center justify-center text-center hover:bg-gray-700 transition-colors">
                  <h3 className="text-xl font-semibold text-white dark:text-white">Bottoms</h3>
                </div>
              </div>
              <div className="group cursor-pointer">
                <div className="bg-gray-600 rounded-lg w-full h-[200px] max-md:h-[100px] flex items-center justify-center text-center hover:bg-gray-700 transition-colors">
                  <h3 className="text-xl font-semibold text-white dark:text-white">Sets</h3>
                </div>
              </div>
            </div>
          </div>
        </section>
        <hr className="border-gray-700 dark:border-gray-400 border-3 w-[90%] mx-auto my-10" />

        {/* Summer Collection */}
        <section
          ref={summerRef}
          className={`py-20 transition-all duration-1000 ease-out transform
            ${summerInView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}
          `}
        >
          <div className="max-w-7xl mx-auto px-4 lg:px-8">
            <h2 className="text-3xl font-bold dark:text-red-400 text-red-700 mb-8">Summer Collection</h2>
            <p className="text-gray-800 dark:text-white mb-8">
              Discover the summer collection from <span className="text-black dark:text-white font-semibold">Shortcut Store</span>
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="backdrop-blur-xl border-2 border-gray-300/50 dark:border-gray-700/70 bg-gray-200/50 dark:bg-gray-700/50 rounded-lg overflow-hidden hover:transform hover:scale-105 transition-transform">
                  <div className="h-48 bg-gray-600 flex items-center justify-center">
                    <span className="text-gray-400">Product Image</span>
                  </div>
                  <div className="p-4 pt-12">
                    <h3 className="text-gray-700 dark:text-white font-semibold text-lg mb-2">Summer Item {item}</h3>
                    <p className="text-[#059669] font-bold">LE 30.00</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <hr className="border-gray-700 dark:border-gray-400 border-3 w-[90%] mx-auto my-10" />

        {/* About Section */}
        <section
          ref={aboutRef}
          className={`max-w-3xl mx-auto px-4 lg:px-8 py-20 text-center transition-all duration-1000 ease-out transform
            ${aboutInView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}
          `}
        >
            <h3 className="text-3xl font-bold mb-8 text-black dark:text-white">ABOUT SHORTCUT STORE</h3>
            <p className="text-gray-700 dark:text-gray-400  mb-8 text-lg">
              We are a clothing brand designed for tech enthusiasts and gamers who value simplicity.
              Our products blend comfort with minimalist design, offering a style that celebrates
              individuality in the digital age.
            </p>
            <Link to="/products" className="border border-[#059669] text-[#059669] px-6 py-2 rounded hover:bg-[#059669] hover:text-white transition-colors">
              Discover Products
            </Link>
        </section>
      </div>
    </div>
  );
};

export default HomePage;