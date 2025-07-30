import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getCollectionImages, CollectionImage, getProducts, getCategories, Category } from '../services/productService';
import { Product } from '../types/product';
import ReviewSummary from '../components/ReviewSummary';
import ProductCard from '../components/ProductCard';

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

// MarqueeBanner component for site announcement
const getAnimationDuration = () => (typeof window !== 'undefined' && window.innerWidth < 640 ? 9 : 14);

const MarqueeBanner: React.FC = () => {
  const [message, setMessage] = useState('');

  // Fetch the latest message from the backend
  const fetchMessage = () => {
    fetch(`/api/site-announcement/`)
      .then(res => res.json())
      .then(data => setMessage(data.message || ''));
  };

  useEffect(() => {
    fetchMessage();
  }, []);

  if (!message) return null;

  return (
    <div className="absolute bottom-0 left-0 z-30 w-full flex items-center justify-center h-12 px-4 bg-black/70 border-t border-emerald-700">
      <span className="text-white font-semibold text-base md:text-lg tracking-wide text-center w-full">
        {message}
      </span>
    </div>
  );
};

// Add marquee animation to index.css or here via style tag if not present

// Add a helper to build <picture> sources from image_variants
function ResponsivePicture({ variants, alt, fallback, ...props }: { variants?: any, alt: string, fallback: string, [key: string]: any }) {
  if (!variants) {
    return <img src={fallback} alt={alt} {...props} />;
  }
  // Build srcSet strings for each format
  const getSrcSet = (fmt: string) => {
    if (!variants[fmt]) return undefined;
    return Object.entries(variants[fmt])
      .map(([size, path]) => `${import.meta.env.VITE_API_BASE_URL}${path} ${size}w`)
      .join(', ');
  };
  const webpSrcSet = getSrcSet('webp');
  const avifSrcSet = getSrcSet('avif');
  // Use the largest webp as default src if available
  let defaultSrc = fallback;
  if (webpSrcSet) {
    const largest = Object.entries(variants.webp).sort((a, b) => Number(b[0]) - Number(a[0]))[0];
    if (largest) defaultSrc = `${import.meta.env.VITE_API_BASE_URL}${largest[1]}`;
  }
  return (
    <picture>
      {avifSrcSet && <source type="image/avif" srcSet={avifSrcSet} sizes="100vw" />}
      {webpSrcSet && <source type="image/webp" srcSet={webpSrcSet} sizes="100vw" />}
      <img src={defaultSrc} alt={alt} {...props} />
    </picture>
  );
}

const HomePage = () => {
  // Animation for 'Shop by Categories' section
  const categoriesRef = useRef<HTMLDivElement | null>(null);
  const [categoriesInView, setCategoriesInView] = useState(false);

  // Animation for 'All Products' section
  const productsRef = useRef<HTMLDivElement | null>(null);
  const [productsInView, setProductsInView] = useState(false);

  // Animation for 'About' section
  const aboutRef = useRef<HTMLDivElement | null>(null);

  // Hero carousel state
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [heroImages, setHeroImages] = useState<{ url: string, variants?: any, alt: string }[]>([]);

  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const productsPerPage = 8;

  // Fetch collection gallery images from backend
  useEffect(() => {
    (async () => {
      const collections: any[] = await getCollectionImages();
      // Use main image if available, otherwise fallback to gallery images
      let heroImgs: { url: string, variants?: any, alt: string }[] = collections
        .filter(col => !!col.image)
        .map(col => {
          const url = col.image.startsWith('http') ? col.image : `${apiBaseUrl}${col.image}`;
          return {
            url,
            variants: col.image_variants,
            alt: col.title || 'Collection',
          };
        });
      // If no main images, fallback to gallery images
      if (heroImgs.length === 0) {
        const galleryImages: { url: string, variants?: any, alt: string }[] = collections
          .flatMap(col => (col.images || []).map((img: any) => ({
            url: img.image.startsWith('http') ? img.image : `${apiBaseUrl}${img.image}`,
            variants: img.image_variants,
            alt: (col.title || 'Collection Gallery'),
          })));
        heroImgs = galleryImages;
      }
      setHeroImages(heroImgs);
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

  // Fetch products for the All Products section
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const allProducts = await getProducts({ 
          ordering: '-created_at'
        });
        
        // Simple client-side pagination
        const startIndex = (currentPage - 1) * productsPerPage;
        const endIndex = startIndex + productsPerPage;
        const paginatedProducts = allProducts.slice(startIndex, endIndex);
        
        setProducts(paginatedProducts);
        setTotalPages(Math.ceil(allProducts.length / productsPerPage));
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage, productsPerPage]);

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

  // ---
  // Previous dynamic aspect ratio code for rollback:
  /*
  const [heroAspectRatio, setHeroAspectRatio] = useState<number | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    setHeroAspectRatio(null);
  }, [currentImageIndex]);

  function handleHeroImgLoad(e: React.SyntheticEvent<HTMLImageElement, Event>) {
    const img = e.currentTarget;
    if (img.naturalWidth && img.naturalHeight) {
      setHeroAspectRatio(img.naturalWidth / img.naturalHeight);
    }
  }
  */
  // ---

  return (
    <div className='overflow-hidden relative z-20'>
      {/* Hero Section */}
      <section
        className="flex justify-center items-center relative text-center overflow-hidden"
        style={{ width: '100vw', height: '60vh', maxHeight: '100vh' }}
      >
        {/* Background Images Carousel */}
        <div className="absolute inset-0 w-full h-full">
          {heroImages.map((img, index) => (
            <div
              key={index}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                index === currentImageIndex ? 'opacity-100' : 'opacity-0'
              } flex items-center justify-center`}
            >
              <picture>
                {/* AVIF/WEBP sources if available */}
                {img.variants?.avif && (
                  <source type="image/avif" srcSet={(Object.values(img.variants.avif) as string[]).map((p) => `${p}`).join(', ')} />
                )}
                {img.variants?.webp && (
                  <source type="image/webp" srcSet={(Object.values(img.variants.webp) as string[]).map((p) => `${p}`).join(', ')} />
                )}
                <img
                  src={img.url}
                  alt={img.alt}
                  className="w-full h-full object-cover object-bottom"
                  style={{ maxWidth: '100%', maxHeight: '100%' }}
                />
              </picture>
              <div className="absolute inset-0 bg-black/40"></div>
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 w-full h-full">
          {/* Shop Now Button centered vertically with animation */}
          <div className={`absolute left-1/2 top-1/2 transform -translate-x-1/2 translate-y-[180%] transition-all duration-700 ease-out ${
            buttonVisible 
              ? 'opacity-100 scale-100'
              : 'opacity-0 scale-95'
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
          <MarqueeBanner />
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

        {/* All Products Section */}
        <section
          ref={productsRef}
          className={`py-20 transition-all duration-1000 ease-out transform
            ${productsInView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}
          `}
        >
          <div className="px-4 mx-auto max-w-7xl lg:px-8">
            <h2 className="mb-12 text-3xl font-bold text-center text-red-700 dark:text-red-400">
              All Products
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                <p>Loading products...</p>
              ) : products.length === 0 ? (
                <p>No products found.</p>
              ) : (
                products.map(product => (
                  <ProductCard product={product} key={product.id} />
                ))
              )}
            </div>
            {totalPages > 1 && (
              <div className="flex justify-center mt-10">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-zinc-700 text-white rounded-lg hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="mx-4 text-lg font-bold text-white">Page {currentPage} of {totalPages}</span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-zinc-700 text-white rounded-lg hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
            
            {/* View All Products Button */}
            <div className="flex justify-center mt-8">
              <Link
                to="/products"
                className="bg-[#059669] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#059669]/90 transition-all duration-300 inline-block shadow-lg hover:shadow-xl hover:scale-105"
              >
                View All Products
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* Website Review Section at the bottom */}
      <ReviewSummary />
    </div>
  );
};

export default HomePage;