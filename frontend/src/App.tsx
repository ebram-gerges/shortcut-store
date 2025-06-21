import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Footer from './components/Footer';
import Header from './components/Header';
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
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { AuthProvider } from './context/AuthContext';

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
    // You can log error info here
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

function App() {
  const [currency, setCurrency] = React.useState<'EGP' | 'USD'>('EGP');
  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency }}>
      <AuthProvider>
        <WishlistProvider>
          <CartProvider>
            <ErrorBoundary>
              <Router>
                <div className="min-h-screen">
                  <Header toggleTheme={toggleTheme} theme={theme}/>
                  <main className="pt-26 dark:bg-black bg-white">
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/products" element={<ProductsPage />} />
                      <Route path="/products/:id" element={<ProductDetailPage />} />
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/signup" element={<SignupPage />} />
                      <Route path="/verify-email" element={<VerifyEmailPage />} />
                      <Route path="/checkout" element={<CheckoutPage />} />
                      <Route path="/order-success" element={<OrderSuccessPage />} />
                      <Route path="/profile" element={<ProfilePage />} />
                      <Route path="/orders" element={<OrdersPage />} />
                    </Routes>
                  </main>
                  <Footer/>
                </div>
                <div
            className="fixed top-0 left-0 w-full h-full pointer-events-none -z-9 dark:dark-gradient light-gradient"></div>
              </Router>
            </ErrorBoundary>
          </CartProvider>
        </WishlistProvider>
      </AuthProvider>
    </CurrencyContext.Provider>
  );
}

export default App;