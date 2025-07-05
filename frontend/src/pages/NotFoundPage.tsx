import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white via-[#e0f7fa] to-[#f0fdfa] dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 px-4">
      <div className="max-w-lg w-full flex flex-col items-center">
        {/* SVG Illustration */}
        <svg width="220" height="180" viewBox="0 0 220 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-8 animate-bounce-slow">
          <ellipse cx="110" cy="160" rx="80" ry="12" fill="#059669" fillOpacity="0.12" />
          <rect x="40" y="40" width="140" height="80" rx="20" fill="#059669" fillOpacity="0.15" />
          <rect x="60" y="60" width="100" height="40" rx="10" fill="#059669" fillOpacity="0.25" />
          <text x="110" y="100" textAnchor="middle" fontSize="48" fontWeight="bold" fill="#059669" opacity="0.8">404</text>
          <circle cx="80" cy="80" r="8" fill="#059669" fillOpacity="0.5" />
          <circle cx="140" cy="80" r="8" fill="#059669" fillOpacity="0.5" />
          <ellipse cx="110" cy="120" rx="18" ry="6" fill="#059669" fillOpacity="0.2" />
        </svg>
        <h1 className="text-4xl font-extrabold text-zinc-900 dark:text-white mb-4 text-center">Oops! Page not found</h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-300 mb-8 text-center">
          Looks like you got lost in the store.<br />
          The page you’re looking for doesn’t exist.
        </p>
        <Link
          to="/"
          className="inline-block px-8 py-3 bg-[#059669] text-white font-semibold rounded-lg shadow-lg hover:bg-[#157557] transition-colors text-lg"
        >
          Go back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage; 