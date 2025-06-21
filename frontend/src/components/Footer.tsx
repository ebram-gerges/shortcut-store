import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <>
    <div className="relative w-full bottom-0 z-40 bg-white border-zinc-200 dark:bg-black dark:border-zinc-500 py-10">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-20">
          {/* About Section */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-black dark:text-white">ABOUT SHORTCUT STORE</h3>
            <p className="text-zinc-700 dark:text-zinc-400  mb-8">
              We are a clothing brand designed for tech enthusiasts and gamers who value simplicity.
            </p>
            <Link to="/products" className="border border-[#059669] text-[#059669] px-6 py-2 rounded hover:bg-[#059669] hover:text-white transition-colors">
              Discover Products
            </Link>
            <div className="flex gap-4 mt-8">
              <Link to="" target="_blank" rel="noopener noreferrer"> <img src="https://www.citypng.com/public/uploads/preview/round-black-facebook-fb-logo-icon-sign-701751695134781upkxjlqwck.png" alt="Facebook" className="h-12 p-2 bg-white rounded-full" title='Facebook'/>
              </Link>
              <Link to="" target="_blank" rel="noopener noreferrer"> <img src="https://upload.wikimedia.org/wikipedia/commons/2/27/CIS-A2K_Instagram_Icon_%28Black%29.svg" alt="Instagram" className="h-12 p-2 bg-white rounded-full" title='Instagram'/>
              </Link>
                <Link to="" target="_blank" rel="noopener noreferrer"> <img src="https://www.citypng.com/public/uploads/preview/hd-black-round-circle-outline-youtube-yt-logo-icon-png-701751695120640nmh2ehgx1v.png" alt="Youtube" className="h-12 p-2 bg-white rounded-full" title='Youtube'/>
              </Link>
              <Link to="" target="_blank" rel="noopener noreferrer"> <img src="https://vnpa.org.au/wp-content/uploads/2024/05/tiktok-icon-1080.png" alt="Tiktok" className="h-12 p-2 bg-white rounded-full" title='Tiktok'/>
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-3 text-zinc-700 dark:text-zinc-400">
              <li><Link to="/" className="hover:text-white transition-colors">About us</Link></li>
              <li><Link to="/" className="hover:text-white transition-colors">Contact us</Link></li>
              <li><Link to="/" className="hover:text-white transition-colors">FAQ's</Link></li>
              <li><Link to="/" className="hover:text-white transition-colors">Shipping & Delivery</Link></li>
              <li><Link to="/" className="hover:text-white transition-colors">Return & Exchange</Link></li>
              <li><Link to="/" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-semibold mb-6">Join For Exclusive Email Offers!</h3>
            <p className="text-zinc-700 dark:text-zinc-400 mb-4">
              Enter your email to receive the latest offers and new products.
            </p>
            <div className="flex max-md:flex-col">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 bg-zinc-200 dark:bg-zinc-800 placeholder:text-black dark:placeholder:text-white border border-zinc-700 px-4 py-3 rounded-l-lg max-md:rounded-t-lg max-md:rounded-b-none focus:outline-none focus:border-[#059669]"
              />
              <button className="bg-[#059669] text-white px-6 py-3 rounded-r-lg max-md:rounded-t-none max-md:rounded-b-lg hover:bg-[#059669]/90 transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-zinc-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-zinc-700 dark:text-zinc-400">
            © 2025 RIGHTS RESERVED TO <span className="text-black dark:text-white font-semibold">SHORTCUT STORE</span>
          </p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <img src="https://logowik.com/content/uploads/images/visa-payment-card1873.jpg" alt="Visa" className="h-12 rounded-lg" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Mastercard-logo.png" alt="Mastercard" className="h-12 p-1 bg-white rounded-lg" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Meeza.svg/512px-Meeza.svg.png" alt="Meeza" className="h-12" />
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default Footer;