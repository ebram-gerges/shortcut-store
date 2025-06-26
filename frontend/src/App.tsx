import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Footer from './components/Footer';
import { CurrencyContext } from './context/CurrencyContext';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import ProfilePage from './pages/ProfilePage';
import OrdersPage from './pages/OrdersPage';
import ProductReviewPage from './pages/ProductReviewPage';
import WebsiteReviewPage from './pages/WebsiteReviewPage';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import OrderTrackingPage from './pages/OrderTrackingPage';
import Header from './components/Header';
import OrderDetailPage from './pages/OrderDetailPage';

// Suppress React Router future flag warnings
const originalWarn = console.warn;
console.warn = (...args) => {
  const message = args[0];
  if (typeof message === 'string' && 
      (message.includes('React Router Future Flag Warning') || 
       message.includes('v7_startTransition') || 
       message.includes('v7_relativeSplatPath'))) {
    return; // Suppress these specific warnings
  }
  originalWarn.apply(console, args);
};

// Global error boundary
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: unknown }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: unknown) {
    return { hasError: true, error };
  }
  componentDidCatch() {
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 dark:bg-red-900 text-red-800 dark:text-red-200">
          <h1 className="text-3xl font-bold mb-4">Something went wrong.</h1>
          <pre className="bg-red-100 dark:bg-red-800 p-4 rounded-lg max-w-xl overflow-x-auto text-sm">
            {this.state.error ? String(this.state.error) : ''}
          </pre>
          <button className="mt-6 px-4 py-2 bg-[#059669] text-white rounded" onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Layout component to wrap all routes
const Layout = ({ children, toggleTheme, theme }: { children: React.ReactNode, toggleTheme: () => void, theme: string }) => (
  <div className="min-h-screen">
    <Header toggleTheme={toggleTheme} theme={theme}/>
    <main className="pt-[110px] dark:bg-black bg-white">
      {children}
    </main>
    <Footer/>
    {/* Only one background gradient is visible at a time */}
    <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-9 dark:hidden light-gradient"></div>
    <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-9 hidden dark:block dark-gradient"></div>
  </div>
);

// ScrollToTop component
function ScrollToTop() {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

function App() {
  const [currency, setCurrency] = React.useState<'EGP' | 'USD'>('EGP');
  const getInitialTheme = () => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme');
      if (stored) return stored;
      document.documentElement.classList.add('dark');
    }
    return 'dark';
  };
  const [theme, setTheme] = useState(getInitialTheme);
  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');
  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <>
      <Toaster position="top-center" />
      <CurrencyContext.Provider value={{ currency, setCurrency }}>
        <CartProvider>
          <WishlistProvider>
            <AuthProvider>
              <ErrorBoundary>
                <BrowserRouter>
                  <ScrollToTop />
                  <Routes>
                    <Route path="/" element={<Layout toggleTheme={toggleTheme} theme={theme}><HomePage /></Layout>} />
                    <Route path="/products" element={<Layout toggleTheme={toggleTheme} theme={theme}><ProductsPage /></Layout>} />
                    <Route path="/products/:id" element={<Layout toggleTheme={toggleTheme} theme={theme}><ProductDetailPage /></Layout>} />
                    <Route path="/products/:id/review" element={<Layout toggleTheme={toggleTheme} theme={theme}><ProductReviewPage /></Layout>} />
                    <Route path="/review-website" element={<Layout toggleTheme={toggleTheme} theme={theme}><WebsiteReviewPage /></Layout>} />
                    <Route path="/login" element={<Layout toggleTheme={toggleTheme} theme={theme}><LoginPage /></Layout>} />
                    <Route path="/signup" element={<Layout toggleTheme={toggleTheme} theme={theme}><SignupPage /></Layout>} />
                    <Route path="/verify-email" element={<Layout toggleTheme={toggleTheme} theme={theme}><VerifyEmailPage /></Layout>} />
                    <Route path="/checkout" element={<Layout toggleTheme={toggleTheme} theme={theme}><CheckoutPage /></Layout>} />
                    <Route path="/order-success" element={<Layout toggleTheme={toggleTheme} theme={theme}><OrderSuccessPage /></Layout>} />
                    <Route path="/profile" element={<Layout toggleTheme={toggleTheme} theme={theme}><ProfilePage /></Layout>} />
                    <Route path="/orders" element={<Layout toggleTheme={toggleTheme} theme={theme}><OrdersPage /></Layout>} />
                    <Route path="/track-order" element={<Layout toggleTheme={toggleTheme} theme={theme}><OrderTrackingPage /></Layout>} />
                    <Route path="/order/:id" element={<Layout toggleTheme={toggleTheme} theme={theme}><OrderDetailPage /></Layout>} />
                  </Routes>
                </BrowserRouter>
              </ErrorBoundary>
            </AuthProvider>
          </WishlistProvider>
        </CartProvider>
      </CurrencyContext.Provider>
    </>
  );
}

export default App;