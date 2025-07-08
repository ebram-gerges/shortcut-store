import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Modal from './ui/Modal';

const Footer = () => {
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showReturn, setShowReturn] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showCookies, setShowCookies] = useState(false);

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 lg:gap-12">
          
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
              {/* Replace YouTube with WhatsApp */}
              <a 
                href="https://wa.me/201234567890" target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all duration-300 group shadow-sm"
                aria-label="WhatsApp"
              >
                <svg className="w-5 h-5 text-white group-hover:text-white" fill="currentColor" viewBox="0 0 32 32">
                  <path d="M16 2.938c-7.285 0-13.188 5.903-13.188 13.188 0 2.326.607 4.594 1.762 6.594l-1.844 6.75 6.938-1.813c1.938 1.094 4.094 1.719 6.344 1.719 7.285 0 13.188-5.903 13.188-13.188s-5.903-13.188-13.188-13.188zM16 27.063c-2.031 0-4.031-.531-5.781-1.531l-.406-.25-4.125 1.094 1.094-4.031-.25-.406c-1.094-1.75-1.688-3.75-1.688-5.844 0-6.094 4.969-11.063 11.063-11.063s11.063 4.969 11.063 11.063-4.969 11.063-11.063 11.063zM22.406 19.781c-.344-.188-2.031-1-2.344-1.125-.313-.125-.531-.188-.75.188s-.875 1.125-1.063 1.344c-.188.219-.375.25-.719.094-.344-.156-1.438-.531-2.75-1.688-1.016-.906-1.703-2.031-1.906-2.375-.188-.344-.021-.531.125-.719.125-.156.281-.406.438-.625.156-.219.219-.375.344-.625.125-.25.063-.469-.031-.656-.094-.188-.75-1.813-1.031-2.469-.281-.656-.563-.563-.75-.563-.188 0-.406-.031-.625-.031s-.563.063-.844.406c-.281.344-1.094 1.063-1.094 2.594s1.125 3.031 1.281 3.25c.156.219 2.219 3.406 5.406 4.625.75.313 1.344.5 1.813.625.75.188 1.438.156 1.969.094.594-.063 1.813-.75 2.063-1.469.25-.719.25-1.344.188-1.469-.063-.125-.281-.188-.594-.344z"/>
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
              {/* Removed FAQ link */}
            </ul>
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
              <button onClick={() => setShowPrivacy(true)} className="text-gray-200 hover:text-emerald-300 transition-colors duration-300 underline">
                Privacy Policy
              </button>
              <button onClick={() => setShowReturn(true)} className="text-gray-200 hover:text-emerald-300 transition-colors duration-300 underline">
                Return Policy
              </button>
              <button onClick={() => setShowTerms(true)} className="text-gray-200 hover:text-emerald-300 transition-colors duration-300 underline">
                Terms of Service
              </button>
              <button onClick={() => setShowCookies(true)} className="text-gray-200 hover:text-emerald-300 transition-colors duration-300 underline">
                Cookie Policy
              </button>
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
      <Modal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} title="Privacy Policy">
        {/* Privacy Policy content will go here */}
        <p><b>Introduction:</b> At Shortcut, your privacy is important to us. We are committed to protecting your personal information and being transparent about how we use it.</p>
        <p><b>Information We Collect:</b> We collect information you provide when you create an account, place an order, or contact us. This may include your name, email, address, and payment details.</p>
        <p><b>How We Use Your Information:</b> We use your information to process orders, provide customer support, and improve our services. We do not sell your data to third parties.</p>
        <p><b>Cookies:</b> Shortcut uses cookies to enhance your browsing experience. You can manage cookie preferences in your browser settings.</p>
        <p><b>Security:</b> We implement industry-standard security measures to protect your data.</p>
        <p><b>Contact:</b> For privacy questions, contact us at support@shortcut-eg.com.</p>
      </Modal>
      <Modal isOpen={showReturn} onClose={() => setShowReturn(false)} title="Return Policy">
        {/* Return Policy content will go here */}
        <p><b>Returns:</b> If you are not satisfied with your purchase, you may return items within 14 days of receipt for a refund or exchange. Items must be unused and in original packaging.</p>
        <p><b>Process:</b> To initiate a return, contact us at support@shortcut-eg.com with your order details. We will provide instructions for returning your item.</p>
        <p><b>Refunds:</b> Refunds are processed within 7 business days after we receive your returned item.</p>
        <p><b>Contact:</b> For return questions, contact us at support@shortcut-eg.com.</p>
      </Modal>
      <Modal isOpen={showTerms} onClose={() => setShowTerms(false)} title="Terms of Service">
        {/* Terms of Service content will go here */}
        <p><b>Acceptance of Terms:</b> By using Shortcut, you agree to our terms and conditions. Please read them carefully before using our website or services.</p>
        <p><b>Orders:</b> All orders are subject to acceptance and availability. We reserve the right to refuse or cancel any order at our discretion.</p>
        <p><b>Intellectual Property:</b> All content on this site is the property of Shortcut and may not be used without permission.</p>
        <p><b>Limitation of Liability:</b> Shortcut is not liable for any indirect or consequential damages arising from the use of our site or products.</p>
        <p><b>Contact:</b> For questions about our terms, contact us at support@shortcut-eg.com.</p>
      </Modal>
      <Modal isOpen={showCookies} onClose={() => setShowCookies(false)} title="Cookie Policy">
        {/* Cookie Policy content will go here */}
        <p><b>What Are Cookies?</b> Cookies are small text files stored on your device to help us improve your experience on our site.</p>
        <p><b>How We Use Cookies:</b> We use cookies to remember your preferences, analyze site traffic, and personalize content.</p>
        <p><b>Managing Cookies:</b> You can control or delete cookies through your browser settings. Disabling cookies may affect site functionality.</p>
        <p><b>Contact:</b> For questions about our cookie policy, contact us at support@shortcut-eg.com.</p>
      </Modal>
    </footer>
  );
};

export default Footer;