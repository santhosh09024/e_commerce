import React from 'react';
import { Outlet } from 'react-router-dom';
import AnnouncementBar from '../components/common/AnnouncementBar';
import Navbar from '../components/common/Navbar';
import MobileNav from '../components/common/MobileNav';
import Footer from '../components/common/Footer';
import CartDrawer from '../components/cart/CartDrawer';

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <AnnouncementBar />
      <Navbar />
      <CartDrawer />
      <main className="flex-1 pb-16 sm:pb-0">
        <Outlet />
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
};

export default MainLayout;
