import { lazy, Suspense, useEffect, useRef } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import CursorGlow from './components/CursorGlow.jsx';
import CosmicDust from './components/CosmicDust.jsx';
import AuthModal from './components/AuthModal.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import QuickViewModal from './components/QuickViewModal.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import Home from './pages/Home.jsx';
import Footer from './sections/Footer.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { ModalProvider } from './context/ModalContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { WishlistProvider } from './context/WishlistContext.jsx';
import { QuickViewProvider } from './context/QuickViewContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { ScrollTrigger, ScrollSmoother, prefersReducedMotion } from './lib/gsapConfig.js';

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
    const smoother = ScrollSmoother.get();
    if (smoother) smoother.scrollTo(0, false);
    else window.scrollTo(0, 0);
  }, [pathname, hash]);

  useEffect(() => {
    // Lazy-loaded route content settles a frame after mount — let pinned /
    // scrubbed ScrollTriggers recompute their bounds against the new layout.
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  return null;
}

function RouteFallback() {
  return <div className="route-fallback" aria-hidden="true" />;
}

function useSmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion()) return undefined;

    const smoother = ScrollSmoother.create({
      wrapper: '#smooth-wrapper',
      content: '#smooth-content',
      smooth: 1.1,
      smoothTouch: 0,
      effects: false,
      normalizeScroll: false,
    });

    document.fonts?.ready?.then(() => ScrollTrigger.refresh()).catch(() => {});

    // Almost every route is React.lazy() — the route commits (and briefly
    // shows RouteFallback) before its real, usually much taller, content has
    // finished loading. A one-shot refresh tied to the route change alone
    // would lock in the scrollable height at that too-early moment, leaving
    // the rest of the real page unreachable by scroll until something
    // recalculates it. A ResizeObserver catches every actual height change —
    // lazy chunks resolving, images/fonts loading, anything — not just the
    // first paint of a route.
    let refreshRaf = 0;
    const content = document.getElementById('smooth-content');
    const ro = content
      ? new ResizeObserver(() => {
          cancelAnimationFrame(refreshRaf);
          refreshRaf = requestAnimationFrame(() => ScrollTrigger.refresh());
        })
      : null;
    ro?.observe(content);

    return () => {
      cancelAnimationFrame(refreshRaf);
      ro?.disconnect();
      smoother.kill();
    };
  }, []);
}

export default function App() {
  useSmoothScroll();
  const { pathname } = useLocation();

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
                {/* Fixed-position overlays (nav, drawers, modals, canvases) stay
                    outside this wrapper on purpose — ScrollSmoother drives scroll
                    by transforming #smooth-content, and a position:fixed element
                    nested inside a transformed ancestor stops tracking the
                    viewport. Everything that should physically scroll lives here. */}
                <div id="smooth-wrapper">
                  <div id="smooth-content">
                    <main>
                      {/* Keyed by route so a crash on one page can't strand every
                          later navigation behind the same fallback — a route
                          change remounts the boundary and clears its error state. */}
                      <ErrorBoundary key={pathname}>
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
                      </ErrorBoundary>
                    </main>
                    <Footer />
                  </div>
                </div>
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
