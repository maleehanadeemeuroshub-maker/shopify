import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import CursorGlow from './components/CursorGlow.jsx';
import AuthModal from './components/AuthModal.jsx';
import Home from './pages/Home.jsx';
import WhyGenzWears from './pages/WhyGenzWears.jsx';
import Enterprise from './pages/Enterprise.jsx';
import Pricing from './pages/Pricing.jsx';
import Footer from './sections/Footer.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { ModalProvider } from './context/ModalContext.jsx';

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) return; // hash targets are handled by the page that owns them
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <ModalProvider>
        <div className="grain" aria-hidden="true" />
        <CursorGlow />
        <ScrollToTop />
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/why-genzwears" element={<WhyGenzWears />} />
            <Route path="/enterprise" element={<Enterprise />} />
            <Route path="/pricing" element={<Pricing />} />
          </Routes>
        </main>
        <Footer />
        <AuthModal />
      </ModalProvider>
    </AuthProvider>
  );
}
