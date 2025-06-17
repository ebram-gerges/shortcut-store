/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'shortcut': {
          // Base Colors
          'black': '#000000',
          'white': '#ffffff',
          'cream': '#fefefe',
          'light-grey': '#f8fafc',
          'medium-grey': '#64748b',
          'dark-grey': '#1e293b',

          // Forest Green Colors
          'forest-green': '#1B4D3E',  // Darker forest green
          'forest-green-light': '#2E7D32',  // Lighter forest green
          'emerald': '#008c4a',
          'emerald-bright': '#00c96b',
          'emerald-dark': '#005c2a',
          'lime-green': '#32cd32',
          'electric-green': '#00ff00',
          'matrix-green': '#00ff41',

          // Sale Colors
          'sale-red': '#dc2626',
          'sale-red-dark': '#b91c1c',
          'sale-red-light': '#ef4444',
          'sale': '#ff3b3b',

          // Product Colors
          'burgundy': '#800020',
          'navy': '#001f3f',
          'violet': '#8a2be2',
          'brown': '#8b4513',
          'olive': '#808000',
          'iron-grey': '#71797e',
          'sierra-blue': '#69a7ce',
          'carbon-grey': '#625d5d',

          // Text Colors
          'text-primary': '#2C3E50',
          'text-secondary': '#34495E',
          'text-muted': '#7fa88a',
          'text-light': '#e6ffe6',
          'text-accent': '#00ff41',

          // Background Colors
          'bg-primary': '#ffffff',
          'bg-secondary': '#f8fafc',
          'bg-tertiary': '#f1f5f9',
          'bg-dark': '#0a1a12',
          'bg-accent': '#00ff41',

          // Border Colors
          'border-light': '#e2e8f0',
          'border-medium': '#cbd5e1',
          'border-dark': '#064E3B',  // Using dark emerald
          'border-accent': '#00ff41',

          // Status Colors
          'success': '#27AE60',
          'warning': '#F39C12',
          'error': '#E74C3C',
          'info': '#3498DB',

          // Price Colors
          'price': '#2C3E50',
          'sale-price': '#E74C3C',
          'original-price': '#95A5A6',

          // Dark Theme Colors
          'dark': {
            'bg-primary': '#064E3B',  // Dark emerald
            'bg-secondary': '#1B4D3E',  // Dark forest green
            'bg-tertiary': '#1e293b',
            'text-primary': '#ffffff',
            'text-secondary': '#cccccc',
            'text-muted': '#95A5A6',
            'border-light': '#465C71',
            'border-medium': '#5D6D7E',
            'border-dark': '#064E3B',  // Dark emerald
            'price': '#ffffff',
            'sale-price': '#E74C3C',
            'original-price': '#cccccc',
            'success': '#2ECC71',
            'warning': '#F1C40F',
            'error': '#E74C3C',
            'info': '#3498DB'
          },
          'glass': 'rgba(10,26,18,0.7)',
        },
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        montserrat: ['Montserrat', 'sans-serif'],
      },
      boxShadow: {
        'sm': '0 0.125rem 0.25rem rgba(26, 26, 26, 0.075)',
        'md': '0 0.5rem 1rem rgba(26, 26, 26, 0.15)',
        'lg': '0 1rem 3rem rgba(26, 26, 26, 0.175)',
        'glass': '0 8px 32px 0 rgba(10, 26, 18, 0.37)',
      },
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      backgroundImage: {
        'radial-green-glow': 'radial-gradient(circle at 50% 40%, #00ffb0 0%, #00c96b 40%, #008c4a 70%, #0a1a12 100%)',
      },
    },
  },
  plugins: [],
}; 