import React from 'react';
import { FaRocket, FaHeart, FaLeaf } from 'react-icons/fa';

const AboutUsPage = () => (
  <div className="min-h-screen bg-gradient-to-br from-[#e0f7fa] via-white to-[#f0fdfa] dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 flex flex-col items-center">
    {/* Hero Section */}
    <section className="w-full py-20 px-4 flex flex-col items-center justify-center text-center bg-gradient-to-r from-[#059669] via-[#34d399] to-[#e0f2fe] dark:from-[#059669] dark:via-zinc-800 dark:to-zinc-900 relative">
      <h1 className="text-5xl sm:text-6xl font-extrabold text-white drop-shadow mb-4">Welcome to Shortcut</h1>
      <p className="text-xl sm:text-2xl text-white/90 max-w-2xl mx-auto mb-8">Empowering self-expression through modern, high-quality fashion for every lifestyle.</p>
    </section>
    {/* Cards Section */}
    <section className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-3 gap-8 mt-[-60px] z-10 px-4">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl p-8 flex flex-col items-center text-center border-t-4 border-[#059669]">
        <FaRocket className="text-[#059669] text-4xl mb-4" />
        <h2 className="text-2xl font-bold mb-2">Our Story</h2>
        <p className="text-zinc-700 dark:text-zinc-300">Shortcut started with a simple idea: make style accessible, comfortable, and inspiring for everyone. We’re a passionate team dedicated to bringing you the best in modern fashion.</p>
      </div>
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl p-8 flex flex-col items-center text-center border-t-4 border-[#059669]">
        <FaHeart className="text-[#059669] text-4xl mb-4" />
        <h2 className="text-2xl font-bold mb-2">Our Mission</h2>
        <p className="text-zinc-700 dark:text-zinc-300">To inspire confidence and creativity by delivering unique, comfortable, and affordable fashion for all. We’re committed to quality, sustainability, and a seamless shopping experience.</p>
      </div>
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl p-8 flex flex-col items-center text-center border-t-4 border-[#059669]">
        <FaLeaf className="text-[#059669] text-4xl mb-4" />
        <h2 className="text-2xl font-bold mb-2">Our Values</h2>
        <ul className="list-disc list-inside text-zinc-700 dark:text-zinc-300 text-left mx-auto max-w-xs">
          <li>Creativity & Innovation</li>
          <li>Quality & Comfort</li>
          <li>Inclusivity & Diversity</li>
          <li>Customer-Centric Service</li>
          <li>Sustainability & Responsibility</li>
        </ul>
      </div>
    </section>
    {/* Call to Action */}
    <section className="w-full max-w-2xl text-center mt-16 mb-12 px-4">
      <h2 className="text-2xl font-semibold text-[#059669] mb-2">Join the Shortcut Community</h2>
      <p className="text-zinc-600 dark:text-zinc-400 mb-6">Follow us on social media and be part of our journey. Thank you for choosing Shortcut—where your style journey begins!</p>
      <a href="/products" className="inline-block px-8 py-3 rounded-full bg-[#059669] text-white font-bold text-lg shadow-lg hover:bg-[#047857] transition">Shop Now</a>
    </section>
  </div>
);

export default AboutUsPage; 