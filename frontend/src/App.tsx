import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { useAppSelector } from './store';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { SidebarDrawer } from './components/SidebarDrawer';
import { Home } from './pages/Home';
import { ProductDetails } from './pages/ProductDetails';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderHistory } from './pages/OrderHistory';
import { AuthPages } from './pages/AuthPages';
import { UserProfile } from './pages/UserProfile';
import { SearchPage } from './pages/SearchPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider, Helmet } from 'react-helmet-async';

export const App: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const themeMode = useAppSelector((state) => state.theme.mode);

  // Sync Theme classes with HTML body
  React.useEffect(() => {
    const root = window.document.documentElement;
    if (themeMode === 'dark') {
      root.classList.add('dark');
    } else if (themeMode === 'light') {
      root.classList.remove('dark');
    } else {
      // System Theme checks
      const media = window.matchMedia('(prefers-color-scheme: dark)');
      if (media.matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [themeMode]);

  return (
    <HelmetProvider>
      <Router>
        <Helmet>
          <title>ShopMart | Online Shopping Store</title>
          <meta name="description" content="Welcome to ShopMart - Experience the premium Amazon-inspired shopping store with fast shipping and Stripe secure checkouts." />
        </Helmet>

        {/* Global Layout Frame */}
        <div className="min-h-screen bg-amazon-gray-bg flex flex-col font-sans antialiased text-gray-900 overflow-x-hidden selection:bg-orange-200">
          {/* Header */}
          <Navbar onOpenSidebar={() => setSidebarOpen(true)} />

          {/* Left slide category drawer */}
          <SidebarDrawer isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

          {/* Main Body content page */}
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/orders" element={<OrderHistory />} />
              <Route path="/profile" element={<UserProfile />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/admin" element={<AdminDashboard />} />

              {/* Credentials auth routes */}
              <Route path="/login" element={<AuthPages mode="login" />} />
              <Route path="/register" element={<AuthPages mode="register" />} />
              <Route path="/forgot-password" element={<AuthPages mode="forgot" />} />
              <Route path="/otp-verification" element={<AuthPages mode="otp" />} />
            </Routes>
          </main>

          {/* Footer */}
          <Footer />
        </div>

        {/* Action toast notifications */}
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#232f3e',
              color: '#fff',
              fontSize: '13px',
              fontFamily: 'Inter, sans-serif',
              borderRadius: '4px',
            },
          }}
        />
      </Router>
    </HelmetProvider>
  );
};

export default App;
