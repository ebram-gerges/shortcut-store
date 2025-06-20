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
          </CartProvider>
        </WishlistProvider>
      </AuthProvider>
    </CurrencyContext.Provider>
  );
}

export default App;