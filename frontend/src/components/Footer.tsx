import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer 
      className="border-t border-gray-200 dark:border-gray-700"
      style={{
        background: `linear-gradient(to bottom, 
          #034c36 0%, 
          #003332 100%
        )`
      }}
    >
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                SHORTCUT STORE
              </h2>
            </div>
            <p className="text-gray-200 mb-6 leading-relaxed">
              Premium clothing designed for tech enthusiasts and gamers who value simplicity, 
              comfort, and style. Quality materials, innovative designs.
            </p>
            
            {/* Social Media Links */}
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all duration-300 group shadow-sm"
                aria-label="Facebook"
              >
                <svg className="w-5 h-5 text-white group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all duration-300 group shadow-sm"
                aria-label="Instagram"
              >
                <svg className="w-5 h-5 text-white group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323c-.875.807-2.026 1.297-3.323 1.297zm7.718-1.297c-.875.807-2.026 1.297-3.323 1.297s-2.448-.49-3.323-1.297c-.807-.875-1.297-2.026-1.297-3.323s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323z"/>
                </svg>
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all duration-300 group shadow-sm"
                aria-label="YouTube"
              >
                <svg className="w-5 h-5 text-white group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all duration-300 group shadow-sm"
                aria-label="TikTok"
              >
                <svg className="w-5 h-5 text-white group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-6">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-gray-200 hover:text-emerald-300 transition-colors duration-300">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-gray-200 hover:text-emerald-300 transition-colors duration-300">
                  Shop All
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-200 hover:text-emerald-300 transition-colors duration-300">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-200 hover:text-emerald-300 transition-colors duration-300">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-200 hover:text-emerald-300 transition-colors duration-300">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-6">
              Customer Service
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/shipping" className="text-gray-200 hover:text-emerald-300 transition-colors duration-300">
                  Shipping & Delivery
                </Link>
              </li>
              <li>
                <Link to="/returns" className="text-gray-200 hover:text-emerald-300 transition-colors duration-300">
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link to="/size-guide" className="text-gray-200 hover:text-emerald-300 transition-colors duration-300">
                  Size Guide
                </Link>
              </li>
              <li>
                <Link to="/track-order" className="text-gray-200 hover:text-emerald-300 transition-colors duration-300">
                  Track Order
                </Link>
              </li>
              <li>
                <Link to="/support" className="text-gray-200 hover:text-emerald-300 transition-colors duration-300">
                  Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-6">
              Stay Updated
            </h3>
            <p className="text-gray-200 mb-4 leading-relaxed">
              Subscribe to our newsletter for exclusive offers, new arrivals, and style tips.
            </p>
            <form className="space-y-3">
              <div className="relative">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all duration-300 text-white placeholder-gray-300 shadow-sm backdrop-blur-sm"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 shadow-sm"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/20 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            
            {/* Copyright */}
            <div className="text-gray-200 text-sm">
              © 2025 <span className="font-semibold text-white">SHORTCUT STORE</span>. All rights reserved.
            </div>

            {/* Legal Links */}
            <div className="flex flex-wrap items-center space-x-6 text-sm">
              <Link to="/privacy" className="text-gray-200 hover:text-emerald-300 transition-colors duration-300">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-200 hover:text-emerald-300 transition-colors duration-300">
                Terms of Service
              </Link>
              <Link to="/cookies" className="text-gray-200 hover:text-emerald-300 transition-colors duration-300">
                Cookie Policy
              </Link>
            </div>

            {/* Payment Methods */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-5 bg-white/20 rounded flex items-center justify-center shadow-sm backdrop-blur-sm">
                  <span className="text-xs font-semibold text-white">VISA</span>
                </div>
                <div className="w-8 h-5 bg-white/20 rounded flex items-center justify-center shadow-sm backdrop-blur-sm">
                  <span className="text-xs font-semibold text-white">MC</span>
                </div>
                <div className="w-8 h-5 bg-white/20 rounded flex items-center justify-center shadow-sm backdrop-blur-sm">
                  <span className="text-xs font-semibold text-white">PP</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;