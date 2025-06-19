import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, User, Heart, ShoppingCart, ChevronDown, LogOut, Sun, Moon, Menu, X as Close } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import CartSidebar from './CartSidebar';
import WishlistSidebar from './WishlistSidebar';
import { navLinks } from '../constants/constants';
import { CurrencyContext, useCurrency, Currency } from '../context/CurrencyContext';

const Header = ({ toggleTheme, theme }: { toggleTheme: () => void, theme: string }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const { currency, setCurrency } = useCurrency();
  
  const { getTotalItems } = useCart();
  const { getTotalItems: getWishlistItems } = useWishlist();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const toggleDropdown = (dropdown: string) => {
    setIsDropdownOpen(isDropdownOpen === dropdown ? null : dropdown);
  };

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
  };

  return (
    <>
      <div className="fixed w-full top-0 z-50 bg-white border-b border-gray-200 dark:bg-zinc-800 dark:border-zinc-500">
        {/* Top bar */}
        <div className="flex max-md:flex-col gap-2 max-md:gap-4 items-center justify-center dark:bg-black text-center py-2 text-sm bg-gray-200">
          <span className="text-black dark:text-white">WELCOME TO SHORTCUT STORE</span>
          <span className="text-[#059669]">BUY 3 & GET FREE SHIPPING!</span>
        </div>

        {/* Main navigation */}
        <div className="px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <a href="/" className="text-xl font-bold text-black dark:text-white hover:text-[#059669] transition-colors">
              Shortcut Store
            </a>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navLinks.map((link) => (
                <a href={link.href} className="text-black dark:text-white hover:text-[#059669] transition-colors">
                  {link.name}
                </a>
              ))}
              
              <div className="relative">
                <button
                  onClick={() => toggleDropdown('tshirts')}
                  className="flex items-center text-black dark:text-white hover:text-[#059669] transition-colors"
                >
                  T-Shirts <ChevronDown className="ml-1 h-4 w-4" />
                </button>
                {isDropdownOpen === 'tshirts' && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg py-2">
                    <Link to="/products?category=tshirts" className="block px-4 py-2 text-white hover:bg-gray-700">
                      All T-Shirts
                    </Link>
                    <Link to="/products?category=graphic" className="block px-4 py-2 text-white hover:bg-gray-700">
                      Graphic Tees
                    </Link>
                    <Link to="/products?category=basic" className="block px-4 py-2 text-white hover:bg-gray-700">
                      Basic Tees
                    </Link>
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  onClick={() => toggleDropdown('bottoms')}
                  className="flex items-center text-black dark:text-white hover:text-[#059669] transition-colors"
                >
                  Bottoms <ChevronDown className="ml-1 h-4 w-4" />
                </button>
                {isDropdownOpen === 'bottoms' && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg py-2">
                    <Link to="/products?category=pants" className="block px-4 py-2 text-white hover:bg-gray-700">
                      Pants
                    </Link>
                    <Link to="/products?category=shorts" className="block px-4 py-2 text-white hover:bg-gray-700">
                      Shorts
                    </Link>
                    <Link to="/products?category=jeans" className="block px-4 py-2 text-white hover:bg-gray-700">
                      Jeans
                    </Link>
                  </div>
                )}
              </div>

              <Link to="/" className="text-black dark:text-white hover:text-[#059669] transition-colors">
                Customer Service
              </Link>
            </nav>

            {/* Right side icons */}
            <div className="hidden lg:flex items-center space-x-4">
              <button className="text-black dark:text-white hover:text-[#059669] transition-colors">
                <Search className="h-6 w-6" />
              </button>
              
              <button
                onClick={toggleTheme}
                className="text-black dark:text-white hover:text-[#059669] transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
              </button>
              
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 bg-gray-200 dark:bg-gray-800 text-black dark:text-white px-3 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
                  >
                    <User className="h-5 w-5" />
                    <span className="hidden md:block">{user.name}</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  {isUserMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2">
                      <Link to="/profile" className="block px-4 py-2 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        Profile
                      </Link>
                      <Link to="/orders" className="block px-4 py-2 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        Orders
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center transition-colors"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <a
                  href="/login"
                  className="bg-[#059669] text-white px-4 py-2 rounded-lg hover:bg-[#059669]/90 transition-colors dark:bg-[#059669] dark:text-white dark:hover:bg-[#059669]/80"
                >
                  Login
                </a>
              )}
              
              <button
                onClick={() => setIsWishlistOpen(true)}
                className="text-black dark:text-white hover:text-[#059669] transition-colors relative"
              >
                <Heart className="h-6 w-6" />
              </button>
              
              <button
                onClick={() => setIsCartOpen(true)}
                className="text-black dark:text-white hover:text-[#059669] transition-colors relative"
              >
                <ShoppingCart className="h-6 w-6" />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs dark:bg-red-400 dark:text-black">
                    {getTotalItems()}
                  </span>
                )}
              </button>
              
              <select
                className="bg-gray-200 dark:bg-gray-800 text-black dark:text-white px-2 py-1 rounded border border-gray-300 dark:border-gray-700 focus:ring-[#059669]"
                value={currency}
                onChange={e => setCurrency(e.target.value as Currency)}
              >
                <option value="EGP">EGP</option>
                <option value="USD">USD</option>
              </select>
            </div>

            {/* Hamburger menu button */}
            <button
              className="lg:hidden text-black dark:text-white hover:text-[#059669] transition-colors p-2 ml-auto"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-7 w-7" />
            </button>
          </div>
        </div>
      </div>

      {/* Sidebars */}
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <WishlistSidebar isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} />

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-60 lg:hidden">
          <div className="fixed right-0 top-0 h-full w-4/5 max-w-xs bg-white dark:bg-zinc-800 shadow-xl p-6 flex flex-col">
            <button
              className="absolute top-4 right-4 text-black dark:text-white hover:text-[#059669]"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Close menu"
            >
              <Close className="h-7 w-7" />
            </button>
            <nav className="flex flex-col space-y-4 mt-10">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-lg text-black dark:text-white hover:text-[#059669] transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </a>
              ))}
              {/* Dropdowns for T-Shirts and Bottoms */}
              <div>
                <button
                  onClick={() => toggleDropdown('tshirts')}
                  className="flex items-center w-full text-lg text-black dark:text-white hover:text-[#059669] transition-colors"
                >
                  T-Shirts <ChevronDown className="ml-1 h-4 w-4" />
                </button>
                {isDropdownOpen === 'tshirts' && (
                  <div className="ml-4 mt-2 flex flex-col space-y-2">
                    <Link to="/products?category=tshirts" className="block px-2 py-1 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded" onClick={() => setIsMobileMenuOpen(false)}>
                      All T-Shirts
                    </Link>
                    <Link to="/products?category=graphic" className="block px-2 py-1 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded" onClick={() => setIsMobileMenuOpen(false)}>
                      Graphic Tees
                    </Link>
                    <Link to="/products?category=basic" className="block px-2 py-1 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded" onClick={() => setIsMobileMenuOpen(false)}>
                      Basic Tees
                    </Link>
                  </div>
                )}
              </div>
              <div>
                <button
                  onClick={() => toggleDropdown('bottoms')}
                  className="flex items-center w-full text-lg text-black dark:text-white hover:text-[#059669] transition-colors"
                >
                  Bottoms <ChevronDown className="ml-1 h-4 w-4" />
                </button>
                {isDropdownOpen === 'bottoms' && (
                  <div className="ml-4 mt-2 flex flex-col space-y-2">
                    <Link to="/products?category=pants" className="block px-2 py-1 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded" onClick={() => setIsMobileMenuOpen(false)}>
                      Pants
                    </Link>
                    <Link to="/products?category=shorts" className="block px-2 py-1 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded" onClick={() => setIsMobileMenuOpen(false)}>
                      Shorts
                    </Link>
                    <Link to="/products?category=jeans" className="block px-2 py-1 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded" onClick={() => setIsMobileMenuOpen(false)}>
                      Jeans
                    </Link>
                  </div>
                )}
              </div>
              <Link to="/" className="text-lg text-black dark:text-white hover:text-[#059669] transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                Customer Service
              </Link>
              {/* Divider */}
              <hr className="my-4 border-gray-300 dark:border-gray-700" />
              {/* Right side actions in mobile menu */}
              <button className="text-black dark:text-white hover:text-[#059669] transition-colors flex items-center space-x-2" onClick={() => setIsMobileMenuOpen(false)}>
                <Search className="h-6 w-6" /> <span>Search</span>
              </button>
              <button onClick={() => { setIsWishlistOpen(true); setIsMobileMenuOpen(false); }} className="text-black dark:text-white hover:text-[#059669] transition-colors flex items-center space-x-2">
                <Heart className="h-6 w-6" /> <span>Wishlist</span>
              </button>
              <button onClick={() => { setIsCartOpen(true); setIsMobileMenuOpen(false); }} className="text-black dark:text-white hover:text-[#059669] transition-colors flex items-center space-x-2">
                <ShoppingCart className="h-6 w-6" /> <span>Cart</span>
              </button>
              <select
                className="bg-gray-200 dark:bg-gray-800 text-black dark:text-white px-2 py-1 rounded border border-gray-300 dark:border-gray-700 focus:ring-[#059669] mt-2"
                value={currency}
                onChange={e => setCurrency(e.target.value as Currency)}
              >
                <option value="EGP">EGP</option>
                <option value="USD">USD</option>
              </select>
              {user ? (
                <button onClick={handleLogout} className="text-black dark:text-white hover:text-[#059669] transition-colors flex items-center space-x-2 mt-2">
                  <LogOut className="h-5 w-5" /> <span>Logout</span>
                </button>
              ) : (
                <a
                  href="/login"
                  className="bg-[#059669] text-white px-4 py-2 rounded-lg hover:bg-[#059669]/90 transition-colors dark:bg-[#059669] dark:text-white dark:hover:bg-[#059669]/80 mt-2 text-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </a>
              )}
              <button
                onClick={toggleTheme}
                className="text-black dark:text-white hover:text-[#059669] transition-colors flex items-center space-x-2 mt-2"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />} <span>Theme ({theme === 'dark' ? 'Dark' : 'Light'})</span>
              </button>
            </nav>
          </div>
          {/* Click outside to close */}
          <div className="flex-1" onClick={() => setIsMobileMenuOpen(false)} />
        </div>
      )}
    </>
  );
};

export default Header;