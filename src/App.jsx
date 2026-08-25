import { lazy, Suspense, useEffect, useRef } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import CursorGlow from './components/CursorGlow.jsx';
import CosmicDust from './components/CosmicDust.jsx';
import AuthModal from './components/AuthModal.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import QuickViewModal from './components/QuickViewModal.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import RequireRole from './components/RequireRole.jsx';
import Home from './pages/Home.jsx';
import Footer from './sections/Footer.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { ModalProvider } from './context/ModalContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { WishlistProvider } from './context/WishlistContext.jsx';
import { QuickViewProvider } from './context/QuickViewContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { ProductsProvider } from './context/ProductsContext.jsx';
import { ThemeProvider, useTheme } from './context/ThemeContext.jsx';
import { ScrollTrigger, ScrollSmoother, prefersReducedMotion } from './lib/gsapConfig.js';

const Shop = lazy(() => import('./pages/Shop.jsx'));
const ProductDetail = lazy(() => import('./pages/ProductDetail.jsx'));
const Cart = lazy(() => import('./pages/Cart.jsx'));
const Wishlist = lazy(() => import('./pages/Wishlist.jsx'));
const Checkout = lazy(() => import('./pages/Checkout.jsx'));
const OrderConfirmation = lazy(() => import('./pages/OrderConfirmation.jsx'));
const Account = lazy(() => import('./pages/Account.jsx'));
const OrderTracking = lazy(() => import('./pages/OrderTracking.jsx'));
const ResetPassword = lazy(() => import('./pages/ResetPassword.jsx'));
const SellerOnboarding = lazy(() => import('./pages/seller/SellerOnboarding.jsx'));
const SellerDashboard = lazy(() => import('./pages/seller/SellerDashboard.jsx'));
const SellerProducts = lazy(() => import('./pages/seller/SellerProducts.jsx'));
const SellerProductForm = lazy(() => import('./pages/seller/SellerProductForm.jsx'));
const SellerOrders = lazy(() => import('./pages/seller/SellerOrders.jsx'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard.jsx'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers.jsx'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts.jsx'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders.jsx'));
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories.jsx'));
const WhyGenzWears = lazy(() => import('./pages/WhyGenzWears.jsx'));
const Enterprise = lazy(() => import('./pages/Enterprise.jsx'));
const Pricing = lazy(() => import('./pages/Pricing.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));

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

// CosmicDust paints a fully opaque black WebGL scene — it never lets any
// CSS background show through, so it can only ever make sense as a dark-
// theme effect. Not rendering it at all in light mode (rather than trying
// to reskin it) also skips the WebGL/CDN Three.js load entirely there.
// Wrapped in its own silent ErrorBoundary: this now mounts/unmounts live on
// every theme switch (not just page load), and it's a purely decorative
// background effect — a WebGL teardown hiccup here should never be able to
// blank the rest of the app the way an uncaught error otherwise would.
function CosmicDustGate() {
  const { resolved } = useTheme();

  // Switching themes mounts/unmounts this and Hero's Scene3D, which can
  // shift layout — let pinned/scrubbed ScrollTriggers elsewhere on the page
  // recompute against it, same as the route-change refresh in ScrollToTop.
  useEffect(() => {
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [resolved]);

  if (resolved !== 'dark') return null;
  return (
    <ErrorBoundary fallback={null}>
      <CosmicDust />
    </ErrorBoundary>
  );
}

function RouteFallback() {
  return (
    <div className="route-fallback" aria-hidden="true">
      <span className="route-fallback__spinner" />
    </div>
  );
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

  // The static #app-loader in index.html covers the gap between first
  // paint and React mounting (which this effect only fires after) — fade
  // it out and drop it from the DOM now that the real app has taken over.
  useEffect(() => {
    const loader = document.getElementById('app-loader');
    if (!loader) return undefined;
    loader.classList.add('app-loader--done');
    const timeout = setTimeout(() => loader.remove(), 550);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <ThemeProvider>
    <ProductsProvider>
    <ToastProvider>
      <AuthProvider>
        <ModalProvider>
          <CartProvider>
            <WishlistProvider>
              <QuickViewProvider>
                <CosmicDustGate />
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
                            <Route path="/order-confirmation/:orderNumber" element={<OrderConfirmation />} />
                            <Route path="/account" element={<Account />} />
                            <Route path="/account/orders/:orderNumber" element={<OrderTracking />} />
                            <Route path="/reset-password" element={<ResetPassword />} />
                            <Route path="/sell" element={<SellerOnboarding />} />
                            <Route
                              path="/seller"
                              element={
                                <RequireRole roles={['seller', 'admin']} redirectTo="/sell">
                                  <SellerDashboard />
                                </RequireRole>
                              }
                            />
                            <Route
                              path="/seller/products"
                              element={
                                <RequireRole roles={['seller', 'admin']} redirectTo="/sell">
                                  <SellerProducts />
                                </RequireRole>
                              }
                            />
                            <Route
                              path="/seller/products/new"
                              element={
                                <RequireRole roles={['seller', 'admin']} redirectTo="/sell">
                                  <SellerProductForm />
                                </RequireRole>
                              }
                            />
                            <Route
                              path="/seller/products/:id/edit"
                              element={
                                <RequireRole roles={['seller', 'admin']} redirectTo="/sell">
                                  <SellerProductForm />
                                </RequireRole>
                              }
                            />
                            <Route
                              path="/seller/orders"
                              element={
                                <RequireRole roles={['seller', 'admin']} redirectTo="/sell">
                                  <SellerOrders />
                                </RequireRole>
                              }
                            />
                            <Route
                              path="/admin"
                              element={
                                <RequireRole roles={['admin']}>
                                  <AdminDashboard />
                                </RequireRole>
                              }
                            />
                            <Route
                              path="/admin/users"
                              element={
                                <RequireRole roles={['admin']}>
                                  <AdminUsers />
                                </RequireRole>
                              }
                            />
                            <Route
                              path="/admin/products"
                              element={
                                <RequireRole roles={['admin']}>
                                  <AdminProducts />
                                </RequireRole>
                              }
                            />
                            <Route
                              path="/admin/orders"
                              element={
                                <RequireRole roles={['admin']}>
                                  <AdminOrders />
                                </RequireRole>
                              }
                            />
                            <Route
                              path="/admin/categories"
                              element={
                                <RequireRole roles={['admin']}>
                                  <AdminCategories />
                                </RequireRole>
                              }
                            />
                            <Route path="/why-genzwears" element={<WhyGenzWears />} />
                            <Route path="/enterprise" element={<Enterprise />} />
                            <Route path="/pricing" element={<Pricing />} />
                            <Route path="*" element={<NotFound />} />
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
    </ProductsProvider>
    </ThemeProvider>
  );
}
