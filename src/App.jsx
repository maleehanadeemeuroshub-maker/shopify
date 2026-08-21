import { lazy, Suspense, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import CursorGlow from './components/CursorGlow.jsx';
import CosmicDust from './components/CosmicDust.jsx';
import AuthModal from './components/AuthModal.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import QuickViewModal from './components/QuickViewModal.jsx';
import Home from './pages/Home.jsx';
import Footer from './sections/Footer.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { ModalProvider } from './context/ModalContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { WishlistProvider } from './context/WishlistContext.jsx';
import { QuickViewProvider } from './context/QuickViewContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';

const Shop = lazy(() => import('./pages/Shop.jsx'));
const ProductDetail = lazy(() => import('./pages/ProductDetail.jsx'));
const Cart = lazy(() => import('./pages/Cart.jsx'));
const Wishlist = lazy(() => import('./pages/Wishlist.jsx'));
const Checkout = lazy(() => import('./pages/Checkout.jsx'));
const OrderConfirmation = lazy(() => import('./pages/OrderConfirmation.jsx'));
const Account = lazy(() => import('./pages/Account.jsx'));
const WhyGenzWears = lazy(() => import('./pages/WhyGenzWears.jsx'));
const Enterprise = lazy(() => import('./pages/Enterprise.jsx'));
const Pricing = lazy(() => import('./pages/Pricing.jsx'));

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) return; // hash targets are handled by the page that owns them
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

function RouteFallback() {
  return <div className="route-fallback" aria-hidden="true" />;
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <ModalProvider>
          <CartProvider>
            <WishlistProvider>
              <QuickViewProvider>
                <CosmicDust />
                <div className="grain" aria-hidden="true" />
                <CursorGlow />
                <ScrollToTop />
                <Navbar />
                <main>
                  <Suspense fallback={<RouteFallback />}>
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/shop" element={<Shop />} />
                      <Route path="/product/:id" element={<ProductDetail />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/wishlist" element={<Wishlist />} />
                      <Route path="/checkout" element={<Checkout />} />
                      <Route path="/order-confirmation" element={<OrderConfirmation />} />
                      <Route path="/account" element={<Account />} />
                      <Route path="/why-genzwears" element={<WhyGenzWears />} />
                      <Route path="/enterprise" element={<Enterprise />} />
                      <Route path="/pricing" element={<Pricing />} />
                    </Routes>
                  </Suspense>
                </main>
                <Footer />
                <AuthModal />
                <CartDrawer />
                <QuickViewModal />
              </QuickViewProvider>
            </WishlistProvider>
          </CartProvider>
        </ModalProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
