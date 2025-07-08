import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Heart, ShoppingCart, ChevronDown, LogOut, Sun, Moon, Menu, X as Close, Home, User } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { getCategories, Category } from '../services/productService';
import { useAuth } from '../context/AuthContext';
import CartSidebar from './CartSidebar';
import WishlistSidebar from './WishlistSidebar';
import { navLinks } from '../constants/constants';

// Helper to get initials from a name
const getInitials = (name: string) => {
  if (!name) return '';
  return name.substring(0, 2).toUpperCase();
};

const Header = ({ toggleTheme, theme }: { toggleTheme: () => void, theme: string }) => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showBottomNav, setShowBottomNav] = useState(false);
  const [navbarVisible, setNavbarVisible] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [lastScrollY, setLastScrollY] = useState(0);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const { getTotalItems: getCartTotalItems } = useCart();
  const { items: wishlistItems } = useWishlist();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
  };

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (currentY > lastScrollY && currentY > 40) {
            // Scrolling down
            setNavbarVisible(false);
          } else {
            // Scrolling up
            setNavbarVisible(true);
          }
          setLastScrollY(currentY);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await getCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };

    fetchCategories();
  }, []);

  // Only allow one sidebar open at a time
  const handleSetIsCartOpen = (open: boolean) => {
    if (open) setIsWishlistOpen(false);
    setIsCartOpen(open);
  };
  const handleSetIsWishlistOpen = (open: boolean) => {
    if (open) setIsCartOpen(false);
    setIsWishlistOpen(open);
  };

  // Always show bottom nav on mobile
  useEffect(() => {
    const handleResize = () => {
      setShowBottomNav(window.innerWidth < 1024); // lg breakpoint
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close user menu on outside click or route change
  useEffect(() => {
    if (!isUserMenuOpen) return;
    function handleClick(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isUserMenuOpen]);
  useEffect(() => {
    setIsUserMenuOpen(false);
  }, [location]);

  return (
    <>
      <div className={`fixed top-0 z-50 w-full border-b border-zinc-200 dark:border-zinc-700 bg-white/60 dark:bg-black/60 backdrop-blur-xl shadow-[0_2px_16px_0_rgba(0,0,0,0.08)] transition-transform duration-300 ${navbarVisible ? 'translate-y-0' : '-translate-y-full'}`}>
        {/* Main navigation (always visible) */}
        <div className="px-4">
          <div className="flex relative justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="whitespace-nowrap flex items-center text-xl font-bold text-black dark:text-white hover:text-[#059669] transition-colors">
              <img src="/media/site-logo.svg" alt="Shortcut Store Logo" style={{ height: 40, width: 'auto' }} className="mr-2" />
            </Link>

            {/* Desktop Navigation (lg and up) */}
            <nav className="hidden items-center space-x-8 xl:flex">
              {navLinks.map((link) => (
                <div key={`nav-${link.name}`} className="inline-block relative align-middle group">
                  <Link
                    to={link.href}
                    className="whitespace-nowrap text-sm text-black dark:text-white hover:text-[#059669] transition-colors px-1"
                  >
                    {link.name}
                    <span
                      className="absolute left-0 right-0 mx-auto -bottom-2 h-[3px] bg-[#059669] rounded transition-transform duration-300 origin-center scale-x-0 group-hover:scale-x-100 pointer-events-none"
                    ></span>
                  </Link>
                </div>
              ))}
              {categories.map(category => (
                <div key={`nav-${category.slug}`} className="inline-block relative align-middle group">
                  <Link
                    to={`/products?category=${category.slug}`}
                    className="whitespace-nowrap block text-sm text-black dark:text-white hover:text-[#059669] transition-colors px-1"
                  >
                    {category.name}
                    <span
                      className="absolute left-0 right-0 mx-auto -bottom-2 h-[3px] bg-[#059669] rounded transition-transform duration-300 origin-center scale-x-0 group-hover:scale-x-100 pointer-events-none"
                    ></span>
                  </Link>
                </div>
              ))}
            </nav>

            {/* Right side icons (lg and up) */}
            <div className="hidden items-center space-x-4 lg:flex max-xl:ml-auto">
              <button
                onClick={toggleTheme}
                className="text-black dark:text-white hover:text-[#059669] transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
              </button>

              {user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 text-black rounded-lg transition-colors dark:text-white"
                    aria-haspopup="true"
                    aria-expanded={isUserMenuOpen}
                    aria-controls="user-menu-dropdown"
                  >
                    <div
                      className="flex justify-center items-center w-8 h-8 text-sm font-bold text-white rounded-full"
                      style={{ backgroundColor: user.avatar_color || '#059669' }}
                    >
                      {getInitials(user.username)}
                    </div>
                    <span className="hidden md:block">{user.username}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {isUserMenuOpen && (
                    <div id="user-menu-dropdown" className="absolute right-0 top-full z-20 py-2 mt-2 w-48 bg-white rounded-lg shadow-lg dark:bg-zinc-800">
                      <Link to="/profile" className="block px-4 py-2 text-black transition-colors dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700">
                        Profile
                      </Link>
                      <Link to="/orders" className="block px-4 py-2 text-black transition-colors dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700">
                        Orders
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center px-4 py-2 w-full text-left text-black transition-colors dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700"
                      >
                        <LogOut className="mr-2 w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="bg-[#059669] text-white px-4 py-2 rounded-lg hover:bg-[#059669]/90 transition-colors dark:bg-[#059669] dark:text-white dark:hover:bg-[#059669]/80"
                >
                  Login
                </Link>
              )}

              <div className="flex items-center space-x-4">
                {/* Cart Icon */}
                <button
                  onClick={() => handleSetIsCartOpen(true)}
                  className="relative group"
                  aria-label="Open cart"
                >
                  <ShoppingCart className={`h-7 w-7 ${theme === 'dark' ? 'text-white' : 'text-black'} group-hover:text-[#059669] transition-colors`} />
                  {getCartTotalItems() > 0 && (
                    <span className="absolute -top-2 -right-2 bg-[#059669] text-white text-xs font-bold rounded-full px-2 py-0.5 shadow-lg animate-bounce z-10">
                      {getCartTotalItems()}
                    </span>
                  )}
                </button>
                {/* Wishlist Icon */}
                <button
                  onClick={() => handleSetIsWishlistOpen(true)}
                  className="relative group"
                  aria-label="Open wishlist"
                >
                  <Heart className={`h-7 w-7 ${theme === 'dark' ? 'text-white' : 'text-black'} group-hover:text-[#059669] transition-colors`} />
                  {wishlistItems.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs font-bold rounded-full px-2 py-0.5 shadow-lg animate-bounce z-10">
                      {wishlistItems.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Mobile quick access icons (profile, cart, wishlist) - centered */}
            <div className="flex absolute top-1/2 left-1/2 z-20 items-center space-x-10 transform -translate-x-1/2 -translate-y-1/2 lg:hidden">
              {/* Profile Icon or Avatar */}
              {user ? (
                <Link to="/profile" className="flex justify-center items-center">
                  <div
                    className="flex justify-center items-center w-8 h-8 text-sm font-bold text-white rounded-full"
                    style={{ backgroundColor: user.avatar_color || '#059669' }}
                  >
                    {getInitials(user.username)}
                  </div>
                </Link>
              ) : (
                <Link to="/login" className="flex justify-center items-center">
                  <User className="w-8 h-8 text-black dark:text-white" />
                </Link>
              )}
              {/* Cart Icon */}
              <button
                onClick={() => handleSetIsCartOpen(true)}
                className="relative group"
                aria-label="Open cart"
              >
                <ShoppingCart className={`h-7 w-7 ${theme === 'dark' ? 'text-white' : 'text-black'} group-hover:text-[#059669] transition-colors`} />
                {getCartTotalItems() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#059669] text-white text-xs font-bold rounded-full px-2 py-0.5 shadow-lg animate-bounce z-10">
                    {getCartTotalItems()}
                  </span>
                )}
              </button>
              {/* Wishlist Icon */}
              <button
                onClick={() => handleSetIsWishlistOpen(true)}
                className="relative group"
                aria-label="Open wishlist"
              >
                <Heart className={`h-7 w-7 ${theme === 'dark' ? 'text-white' : 'text-black'} group-hover:text-[#059669] transition-colors`} />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs font-bold rounded-full px-2 py-0.5 shadow-lg animate-bounce z-10">
                    {wishlistItems.length}
                  </span>
                )}
              </button>
            </div>

            {/* Hamburger menu button (mobile) */}
            <button
              className="xl:hidden flex items-center justify-center p-2 rounded-md text-black dark:text-white hover:text-[#059669] focus:outline-none"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-7 h-7" />
            </button>
          </div>
        </div>
      </div>

      {/* Sidebars */}
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <WishlistSidebar isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} />

      {/* Hamburger Menu Overlay for mobile */}
      <div className={`fixed inset-0 z-50 bg-black bg-opacity-60 lg:hidden transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div
          className={`fixed right-0 top-0 h-full w-4/5 max-w-xs bg-white/50 dark:bg-zinc-800/30 backdrop-blur-xl border-l-2 border-zinc-300/50 dark:border-zinc-700/50 shadow-xl p-6 flex flex-col transition-transform duration-500 transform ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
          style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
        >
          <button
            className="absolute top-4 right-4 text-black dark:text-white hover:text-[#059669]"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <Close className="w-6 h-6" />
          </button>
          <nav className="flex flex-col mt-12 space-y-6">
            {navLinks.map((link) => (
              <Link
                key={`mobile-nav-${link.name}`}
                to={link.href}
                className="text-black dark:text-white hover:text-[#059669] transition-colors px-4 py-2 rounded-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <button
              onClick={toggleTheme}
              className="flex items-center px-4 py-2 w-full text-left text-black rounded-lg transition-colors dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700"
            >
              {theme === 'dark' ? <Sun className="mr-2 w-5 h-5" /> : <Moon className="mr-2 w-5 h-5" />}
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </button>
          </nav>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      {showBottomNav && (
        <nav className="fixed bottom-3 left-1/2 -translate-x-1/2 z-[130] w-[95vw] max-w-md bg-white/90 dark:bg-zinc-900/90 rounded-2xl shadow-2xl flex justify-around items-center py-2 px-2 border border-zinc-200 dark:border-zinc-700 lg:hidden">
          <Link to="/" className="flex flex-col items-center text-xs text-zinc-700 dark:text-zinc-200">
            <Home className="mb-1 w-7 h-7" />
            Shop
          </Link>
          <button onClick={() => user ? window.location.href = '/profile' : window.location.href = '/login'} className="flex flex-col items-center text-xs text-zinc-700 dark:text-zinc-200">
            <User className="mb-1 w-7 h-7" />
            Account
          </button>
          <button onClick={() => handleSetIsWishlistOpen(true)} className="flex relative flex-col items-center text-xs text-zinc-700 dark:text-zinc-200">
            <Heart className="mb-1 w-7 h-7" />
            Wishlist
            {wishlistItems.length > 0 && <span className="absolute top-0 right-0 bg-[#059669] text-white text-xs rounded-full px-1">{wishlistItems.length}</span>}
          </button>
          <button onClick={() => handleSetIsCartOpen(true)} className="flex relative flex-col items-center text-xs text-zinc-700 dark:text-zinc-200">
            <ShoppingCart className="mb-1 w-7 h-7" />
            Cart
            {getCartTotalItems() > 0 && <span className="absolute top-0 right-0 bg-[#059669] text-white text-xs rounded-full px-1">{getCartTotalItems()}</span>}
          </button>
        </nav>
      )}

      {/* Mobile user/account dropdown (with theme toggle) */}
      {user && (
        <div className="relative lg:hidden hidden">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center space-x-2 text-black rounded-lg transition-colors dark:text-white"
          >
            <div
              className="flex justify-center items-center w-8 h-8 text-sm font-bold text-white rounded-full"
              style={{ backgroundColor: user.avatar_color || '#059669' }}
            >
              {getInitials(user.username)}
            </div>
            <ChevronDown className="w-4 h-4" />
          </button>
          {isUserMenuOpen && (
            <div className="absolute right-0 top-full z-20 py-2 mt-2 w-48 bg-white rounded-lg shadow-lg dark:bg-zinc-800">
              <Link to="/profile" className="block px-4 py-2 text-black transition-colors dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700">
                Profile
              </Link>
              <Link to="/orders" className="block px-4 py-2 text-black transition-colors dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700">
                Orders
              </Link>
              <button
                onClick={toggleTheme}
                className="flex items-center px-4 py-2 w-full text-left text-black transition-colors dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700"
              >
                {theme === 'dark' ? <Sun className="mr-2 w-4 h-4" /> : <Moon className="mr-2 w-4 h-4" />}
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 w-full text-left text-black transition-colors dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700"
              >
                <LogOut className="mr-2 w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default Header;