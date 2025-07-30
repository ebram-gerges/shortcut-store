import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Modal from './ui/Modal';
import { FaInstagram, FaTiktok, FaFacebook, FaWhatsapp, FaEnvelope } from 'react-icons/fa';

const Footer = () => {
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showReturn, setShowReturn] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showCookies, setShowCookies] = useState(false);
  const [showDelivery, setShowDelivery] = useState(false);

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
                href="https://www.instagram.com/shortcut._eg?igsh=MTZnZ3h5bmJhdXYzcQ==" 
                target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-pink-500 hover:text-white transition-all duration-300 group shadow-sm"
                aria-label="Instagram"
              >
                <FaInstagram className="w-5 h-5 text-white group-hover:text-white" />
              </a>
              <a 
                href="https://www.tiktok.com/@short.cut.eg?_t=ZS-8xRKjtDUSxR&_r=1" target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-black hover:text-white transition-all duration-300 group shadow-sm"
                aria-label="TikTok"
              >
                <FaTiktok className="w-5 h-5 text-white group-hover:text-white" />
              </a>
              <a 
                href="https://www.facebook.com/share/12Kzjf6qBvH/" target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all duration-300 group shadow-sm"
                aria-label="Facebook"
              >
                <FaFacebook className="w-5 h-5 text-white group-hover:text-white" />
              </a>
              <a 
                href="https://wa.me/201274334267" target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-green-500 hover:text-white transition-all duration-300 group shadow-sm"
                aria-label="WhatsApp"
              >
                <FaWhatsapp className="w-5 h-5 text-white group-hover:text-white" />
              </a>
              <a 
                href="mailto:shortcut756@gmail.com" target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-all duration-300 group shadow-sm"
                aria-label="Gmail"
              >
                <FaEnvelope className="w-5 h-5 text-white group-hover:text-white" />
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
                  Contact Us
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
              <button onClick={() => setShowDelivery(true)} className="text-gray-200 hover:text-emerald-300 transition-colors duration-300 underline">
                Delivery Policy
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
        <div className="space-y-4">
          <p><b>Return Window:</b> You may return items within 14 days of receipt for a refund or exchange. Items must be unused, unworn, and in their original packaging with all tags attached.</p>
          
          <p><b>Return Process:</b> To initiate a return, contact us at support@shortcut-eg.com with your order details. We will provide instructions for returning your item.</p>
          
          <p><b>Return Shipping:</b> Customers are responsible for return shipping costs unless the item is defective or we sent the wrong item.</p>
          
          <p><b>Refunds:</b> Refunds are processed within 7 business days after we receive your returned item. The refund will be issued to your original payment method.</p>
          
          <p><b>Exchanges:</b> We offer exchanges for different sizes or colors, subject to availability.</p>
          
          <p><b>Non-Returnable Items:</b> Sale items, personalized items, and items marked as final sale cannot be returned.</p>
          
          <p><b>Contact:</b> For return questions, contact us at support@shortcut-eg.com or WhatsApp: +201274334267</p>
        </div>
      </Modal>
      
      <Modal isOpen={showDelivery} onClose={() => setShowDelivery(false)} title="Delivery Policy">
        <div className="space-y-4">
          <p><b>Delivery Cost:</b> Delivery costs vary based on your location and are calculated after order placement. You will receive the exact delivery cost via WhatsApp or email within 24 hours of placing your order.</p>
          
          <p><b>Delivery Areas:</b> We deliver to all major cities and governorates in Egypt. Delivery to remote areas may take longer and may have additional costs.</p>
          
          <p><b>Delivery Time:</b> Standard delivery takes 3-5 business days after order confirmation. Express delivery options may be available for an additional fee.</p>
          
          <p><b>Order Processing:</b> Orders are processed within 24 hours during business days. Orders placed on weekends or holidays will be processed on the next business day.</p>
          
          <p><b>Delivery Confirmation:</b> You will receive delivery updates via WhatsApp or email, including tracking information when available.</p>
          
          <p><b>Delivery Issues:</b> If you experience any delivery issues, please contact us immediately at support@shortcut-eg.com or WhatsApp: +201274334267</p>
          
          <p><b>Contact:</b> For delivery questions, contact us at support@shortcut-eg.com or WhatsApp: +201274334267</p>
        </div>
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