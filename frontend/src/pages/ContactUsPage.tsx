import React from 'react';
import { FaInstagram, FaTiktok, FaFacebook, FaWhatsapp, FaEnvelope } from 'react-icons/fa';

const CONTACTS = [
  {
    name: 'Instagram',
    icon: <FaInstagram className="text-pink-500 text-4xl" />,
    url: 'https://www.instagram.com/shortcut._eg?igsh=MTZnZ3h5bmJhdXYzcQ==',
    display: 'Contact us via Instagram',
  },
  {
    name: 'TikTok',
    icon: <FaTiktok className="text-black dark:text-white text-4xl" />,
    url: 'https://www.tiktok.com/@short.cut.eg?_t=ZS-8xRKjtDUSxR&_r=1',
    display: 'Contact us via TikTok',
  },
  {
    name: 'Facebook',
    icon: <FaFacebook className="text-blue-600 text-4xl" />,
    url: 'https://www.facebook.com/share/12Kzjf6qBvH/',
    display: 'Contact us via Facebook',
  },
  {
    name: 'WhatsApp',
    icon: <FaWhatsapp className="text-green-500 text-4xl" />,
    url: 'https://wa.me/201006832350',
    display: 'Contact us via WhatsApp',
  },
  {
    name: 'Gmail',
    icon: <FaEnvelope className="text-red-500 text-4xl" />,
    url: 'mailto:shortcut756@gmail.com',
    display: 'Contact us via Gmail',
  },
];

const ContactUsPage = () => (
  <div className="min-h-screen bg-gradient-to-br from-[#f0fdfa] via-white to-[#e0f7fa] dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 flex flex-col items-center py-16 px-4">
    <h1 className="text-5xl sm:text-6xl font-extrabold text-[#059669] dark:text-white mb-8 text-center drop-shadow">Contact Us</h1>
    <p className="text-lg sm:text-xl text-zinc-700 dark:text-zinc-300 mb-12 text-center max-w-2xl">We'd love to hear from you! Connect with us on your favorite platform below.</p>
    <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-8">
      {CONTACTS.map(({ name, icon, url, display }) => (
        <a
          key={name}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center gap-4 px-8 py-8 rounded-2xl shadow-xl bg-white/90 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-700 hover:scale-105 hover:shadow-2xl transition-all text-center"
        >
          <span>{icon}</span>
          <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{display}</span>
        </a>
      ))}
    </div>
  </div>
);

export default ContactUsPage; 