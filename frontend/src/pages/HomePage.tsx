import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getCollectionImages, CollectionImage, getCategoryImages, CategoryImage as CategoryImageType, getProducts, Product } from '../services/productService';
import ReviewSummary from '../components/ReviewSummary';
import ProductCard from '../components/ProductCard';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

const CATEGORY_CARDS = [
  { key: 'tshirts', label: 'T-Shirts', desc: 'Explore our collection' },
  { key: 'basictop', label: 'Basic Top', desc: 'Minimalist essentials' },
  { key: 'sets', label: 'Suits', desc: 'Complete your look' },
];

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
    radial-gradient(circle at 60% 60%, rgba(52, 211, 153, 0.06) 0%, transparent 40%);
}
*/}

const HomePage = () => {
  // Animation for 'Shop by Categories' section
  const categoriesRef = useRef<HTMLDivElement | null>(null);
  const [categoriesInView, setCategoriesInView] = useState(false);

  // Animation for 'All Products' section
  const productsRef = useRef<HTMLDivElement | null>(null);
  const [productsInView, setProductsInView] = useState(false);

  // Animation for 'About' section
  const aboutRef = useRef<HTMLDivElement | null>(null);
  const [aboutInView, setAboutInView] = useState(false);

  // Hero carousel state
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [heroImages, setHeroImages] = useState<string[]>([]);

  // Fetch collection gallery images from backend
  useEffect(() => {
    (async () => {
      const collections: CollectionImage[] = await getCollectionImages();
      const galleryImages: string[] = collections
        .flatMap(col => col.images)
        .map(img => img.image.startsWith('http') ? img.image : `${apiBaseUrl}${img.image}`);
      if (galleryImages.length > 0) {
        setHeroImages(galleryImages);
      }
    })();
  }, []);

  // Hero button animation state
  const [buttonVisible, setButtonVisible] = useState(false);

  // Get all products in stock (replacing summer collection)
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  useEffect(() => {
    (async () => {
      const products = await getProducts({ ordering: '-created_at' });
      setAllProducts(products);
    })();
  }, []);

  // Hero carousel effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, [heroImages.length]);

  // Hero button pop-up animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setButtonVisible(true);
    }, 1000); // Show button after 1 second

    return () => clearTimeout(timer);
  }, []);

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
    const refCurrent = productsRef.current;
    if (!refCurrent) return;
    const observer = new window.IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setProductsInView(true);
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

  const [categoryImages, setCategoryImages] = useState<Record<string, string>>({});

  useEffect(() => {
    (async () => {
      const imagesArr: CategoryImageType[] = await getCategoryImages();
      const images: Record<string, string> = {};
      for (const cat of CATEGORY_CARDS) {
        const found = imagesArr.find(img => img.category === cat.key);
        if (found && found.image) {
          images[cat.key] = found.image.startsWith('http') ? found.image : `${apiBaseUrl}${found.image}`;
        }
      }
      setCategoryImages(images);
    })();
  }, []);

  return (
    <div className='overflow-hidden relative z-20'>
      {/* Hero Section */}
      <section className="h-[60vh] flex justify-center items-center relative text-center overflow-hidden">
        {/* Background Images Carousel */}
        <div className="absolute inset-0 w-full h-full">
          {heroImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                index === currentImageIndex ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img
                src={image}
                alt={`Collection ${index + 1}`}
                className="object-cover w-full h-full"
                onError={(e) => {
                  // Fallback to gradient background if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                  }
                }}
              />
              {/* Dark overlay for better text readability */}
              <div className="absolute inset-0 bg-black/40"></div>
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="flex relative z-10 flex-col justify-end items-center px-4 pb-20 mx-auto max-w-4xl h-full">
          {/* Shop Now Button at the bottom with pop-up animation */}
          <div className={`transition-all duration-700 ease-out transform ${
            buttonVisible 
              ? 'opacity-100 scale-100 translate-y-0' 
              : 'opacity-0 scale-95 translate-y-10'
          }`}>
            <Link
              to="/products"
              className="bg-[#059669] text-white px-8 py-4 rounded-lg font-semibold hover:bg-[#059669]/90 transition-all duration-300 inline-block shadow-[0px_0px_20px_rgba(0,0,0,0.5)] hover:shadow-[0px_0px_30px_rgba(0,0,0,0.7)] hover:scale-105"
            >
              SHOP NOW
            </Link>
          </div>
        </div>

        {/* Carousel Indicators */}
        <div className="flex absolute bottom-8 left-1/2 z-10 space-x-3 transform -translate-x-1/2">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentImageIndex 
                  ? 'bg-white scale-125' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      <hr className="border-zinc-700 dark:border-zinc-400 border-3 w-[90%] mx-auto mt-10" />
      <div className='relative'>
        {/* Shop by Categories */}
        <section
          ref={categoriesRef}
          className={`py-20 transition-all duration-1000 ease-out transform
            ${categoriesInView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}
          `}
        >
          <div className="px-4 mx-auto max-w-7xl lg:px-8">
            <h2 className="mb-12 text-3xl font-bold text-center text-red-700 dark:text-red-400">
              Shop by Categories
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {CATEGORY_CARDS.map(cat => (
                <Link to={`/products?category=${cat.key}`} className="cursor-pointer group" key={cat.key}>
                  <div className="overflow-hidden relative w-full rounded-xl shadow-md transition-transform duration-300 aspect-square group-hover:scale-105">
                    {categoryImages[cat.key] ? (
                      <img
                        src={categoryImages[cat.key]}
                        alt={cat.label}
                        className="object-cover absolute inset-0 w-full h-full transition-transform duration-500 group-hover:scale-110"
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : (
                      <div className="flex absolute inset-0 justify-center items-center w-full h-full text-2xl bg-zinc-200 text-zinc-400">No Image</div>
                    )}
                    <div className="flex absolute bottom-0 left-0 flex-col items-start p-4 w-full bg-gradient-to-t from-black/80 to-black/0">
                      <h3 className="mb-1 text-lg font-bold text-white">{cat.label}</h3>
                      <p className="text-sm text-white/80">{cat.desc}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
        <hr className="border-zinc-700 dark:border-zinc-400 border-3 w-[90%] mx-auto my-10" />

        {/* All Products Collection */}
        <section
          ref={productsRef}
          className={`py-20 transition-all duration-1000 ease-out transform
            ${productsInView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}
          `}
        >
          <div className="px-4 mx-auto max-w-7xl lg:px-8">
            <h2 className="mb-8 text-3xl font-bold text-red-700 dark:text-red-400">Discover Latest Releases</h2>
            <p className="mb-8 text-zinc-800 dark:text-white">
              The newest arrivals from <span className="font-semibold text-black dark:text-white">Shortcut Store</span>
            </p>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {allProducts.map((item) => (
                <ProductCard product={item} key={item.id} />
              ))}
            </div>
          </div>
        </section>

        <hr className="border-zinc-700 dark:border-zinc-400 border-3 w-[90%] mx-auto my-10" />

        {/* Review Summary */}
        <ReviewSummary />

        <hr className="border-zinc-700 dark:border-zinc-400 border-3 w-[90%] mx-auto my-10" />

        {/* About Section */}
        <section
          ref={aboutRef}
          className={`max-w-3xl mx-auto px-4 lg:px-8 py-20 text-center transition-all duration-1000 ease-out transform
            ${aboutInView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}
          `}
        >
            <h3 className="mb-8 text-3xl font-bold text-black dark:text-white">ABOUT SHORTCUT STORE</h3>
            <p className="mb-8 text-lg text-zinc-700 dark:text-zinc-400">
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