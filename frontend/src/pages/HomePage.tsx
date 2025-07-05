import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getCollectionImages, CollectionImage, getProducts, getCategories, Category } from '../services/productService';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

// This will be replaced with dynamic categories from the API

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

// Add MarqueeBanner component

/*
const getAnimationDuration = () => {
  // Optionally scale animation duration as well, or keep it fixed
  return typeof window !== 'undefined' && window.innerWidth < 640 ? 9000 : 30000;
};
*/

/*
const MarqueeBanner: React.FC = () => {
  const [message, setMessage] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const [animationDuration, setAnimationDuration] = useState(getAnimationDuration());

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/site-announcement/`)
      .then(res => res.json())
      .then(data => setMessage(data.message || ''));
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setAnimationDuration(getAnimationDuration());
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!message) return null;
  return (
    <div className="marquee-container" ref={containerRef}>
      <div
        className="marquee-row"
        style={{
          animationDuration: `${animationDuration / 1000}s`,
        }}
      >
        <span className="inline-block px-8 font-bold whitespace-nowrap">{message}</span>
        <span className="inline-block px-8 font-bold whitespace-nowrap">{message}</span>
      </div>
    </div>
  );
};
*/

// Add marquee animation to index.css or here via style tag if not present

const HomePage = () => {
  // Animation for 'Shop by Categories' section
  const categoriesRef = useRef<HTMLDivElement | null>(null);
  const [categoriesInView, setCategoriesInView] = useState(false);

  // Animation for 'All Products' section
  const productsRef = useRef<HTMLDivElement | null>(null);

  // Animation for 'About' section
  const aboutRef = useRef<HTMLDivElement | null>(null);

  // Hero carousel state
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [heroImages, setHeroImages] = useState<string[]>([]);

  // Fetch collection gallery images from backend
  useEffect(() => {
    (async () => {
      const collections: CollectionImage[] = await getCollectionImages();
      // Use main image if available, otherwise fallback to gallery images
      const heroImgs: string[] = collections
        .map(col => col.image ? (col.image.startsWith('http') ? col.image : `${apiBaseUrl}${col.image}`) : null)
        .filter((img): img is string => !!img);
      // If no main images, fallback to gallery images
      if (heroImgs.length === 0) {
        const galleryImages: string[] = collections
          .flatMap(col => col.images)
          .map(img => img.image.startsWith('http') ? img.image : `${apiBaseUrl}${img.image}`);
        setHeroImages(galleryImages);
      } else {
        setHeroImages(heroImgs);
      }
    })();
  }, []);

  // Hero button animation state
  const [buttonVisible, setButtonVisible] = useState(false);

  useEffect(() => {
    (async () => {
      await getProducts({ ordering: '-created_at' });
      // setAllProducts(products); // This line was removed as per the edit hint
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
          // setProductsInView(true); // This line was removed as per the edit hint
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
          // setAboutInView(true); // This line was removed as per the edit hint
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(refCurrent);
    return () => observer.disconnect();
  }, []);

  const [categories, setCategories] = useState<Category[]>([]);
  // Remove categoryImages state

  useEffect(() => {
    (async () => {
      const categoriesData = await getCategories();
      setCategories(categoriesData);
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
        {/* Marquee Banner at the bottom of the hero section */}
        {/** <div className="absolute bottom-0 left-0 z-30 w-full">
          <MarqueeBanner />
        </div> **/}
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
              {categories.map(cat => (
                <Link to={`/products?category=${cat.slug}`} className="cursor-pointer group" key={cat.id}>
                  <div className="overflow-hidden relative w-full rounded-xl shadow-md transition-transform duration-300 aspect-square group-hover:scale-105">
                    {cat.image ? (
                      <img
                        src={cat.image.startsWith('http') ? cat.image : `${apiBaseUrl}${cat.image}`}
                        alt={cat.name}
                        className="object-cover absolute inset-0 w-full h-full transition-transform duration-500 group-hover:scale-110"
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : (
                      <div className="flex absolute inset-0 justify-center items-center w-full h-full text-2xl bg-zinc-200 text-zinc-400">No Image</div>
                    )}
                    <div className="flex absolute bottom-0 left-0 flex-col items-start p-4 w-full bg-gradient-to-t from-black/80 to-black/0">
                      <h3 className="mb-1 text-lg font-bold text-white">{cat.name}</h3>
                      <p className="text-sm text-white/80">{cat.description || 'Explore our collection'}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;