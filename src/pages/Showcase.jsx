import React from 'react';
import HeroSection from '../components/showcase/HeroSection';
import FilterSidebar from '../components/showcase/FilterSidebar';
import ProductGrid from '../components/showcase/ProductGrid';
import ProductDetailModal from '../components/modals/ProductDetailModal';
import ARSimulatorModal from '../components/modals/ARSimulatorModal';
import AuthModal from '../components/modals/AuthModal';
import CartDrawer from '../components/drawers/CartDrawer';
import WishlistDrawer from '../components/drawers/WishlistDrawer';
import CompareDrawer from '../components/drawers/CompareDrawer';
import UserProfileDrawer from '../components/drawers/UserProfileDrawer';
import ToastContainer from '../components/common/ToastContainer';

export default function Showcase() {
  return (
    <div className="space-y-12 pb-16">
      {/* Flagship 3D Interactive Hero Stage */}
      <HeroSection />

      {/* Main 3D Catalog & Filter Workspace */}
      <section id="catalog" className="w-full">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Hardware & Specification Filter Sidebar */}
          <FilterSidebar className="shrink-0" />

          {/* 3D Products Showcase (Card Grid / Spatial 3D Carousel / Split Cinema) */}
          <ProductGrid />
        </div>
      </section>

      {/* Full 3D Interactive Studio & Teardown Inspection Modal */}
      <ProductDetailModal />

      {/* Physical Scale & AR Camera Simulator Modal */}
      <ARSimulatorModal />

      {/* Member Authentication Modal */}
      <AuthModal />

      {/* Glassmorphic Slide-Out Cart Drawer */}
      <CartDrawer />

      {/* Saved Hardware Wishlist Drawer */}
      <WishlistDrawer />

      {/* 4-Device Technical Comparison Matrix */}
      <CompareDrawer />

      {/* User VIP Profile & Orders Drawer */}
      <UserProfileDrawer />

      {/* Real-Time Status Toast Notifications */}
      <ToastContainer />
    </div>
  );
}
