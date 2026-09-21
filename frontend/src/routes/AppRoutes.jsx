import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import MainLayout from '../layouts/MainLayout';
import AdminLayout from '../layouts/AdminLayout';

// Protection Wrappers
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';

// Customer Pages
import HomePage from '../pages/customer/HomePage';
import ShopPage from '../pages/customer/ShopPage';
import ProductDetailPage from '../pages/customer/ProductDetailPage';
import CartPage from '../pages/customer/CartPage';
import WishlistPage from '../pages/customer/WishlistPage';
import CheckoutPage from '../pages/customer/CheckoutPage';
import OrderTrackingPage from '../pages/customer/OrderTrackingPage';
import MyAccountPage from '../pages/customer/MyAccountPage';
import LoginPage from '../pages/customer/LoginPage';
import RegisterPage from '../pages/customer/RegisterPage';
import ForgotPasswordPage from '../pages/customer/ForgotPasswordPage';
import ResetPasswordPage from '../pages/customer/ResetPasswordPage';
import ContactPage from '../pages/customer/ContactPage';
import FAQPage from '../pages/customer/FAQPage';
import {
  PrivacyPolicyPage,
  TermsPage,
  ReturnPolicyPage,
  ShippingPolicyPage,
} from '../pages/customer/LegalPages';

// Admin Pages
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminProductsPage from '../pages/admin/AdminProductsPage';
import AdminOrdersPage from '../pages/admin/AdminOrdersPage';
import AdminCustomersPage from '../pages/admin/AdminCustomersPage';
import AdminCategoriesPage from '../pages/admin/AdminCategoriesPage';
import AdminBrandsPage from '../pages/admin/AdminBrandsPage';
import AdminCouponsPage from '../pages/admin/AdminCouponsPage';
import AdminInventoryPage from '../pages/admin/AdminInventoryPage';
import AdminBannersPage from '../pages/admin/AdminBannersPage';
import AdminReturnsPage from '../pages/admin/AdminReturnsPage';
import AdminReviewsPage from '../pages/admin/AdminReviewsPage';
import AdminAnalyticsPage from '../pages/admin/AdminAnalyticsPage';
import AdminSettingsPage from '../pages/admin/AdminSettingsPage';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Customer Storefront Routes (Main Layout) */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/category/:category" element={<ShopPage />} />
        <Route path="/brand/:brand" element={<ShopPage />} />
        <Route path="/product/:slug" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/track" element={<OrderTrackingPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/faq" element={<FAQPage />} />

        {/* Legal & Policy Pages */}
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/return-policy" element={<ReturnPolicyPage />} />
        <Route path="/shipping-policy" element={<ShippingPolicyPage />} />

        {/* Auth Pages */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

        {/* Authenticated Customer Routes */}
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/account/*"
          element={
            <ProtectedRoute>
              <MyAccountPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Admin Panel Routes (Protected by AdminRoute) */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="customers" element={<AdminCustomersPage />} />
        <Route path="categories" element={<AdminCategoriesPage />} />
        <Route path="brands" element={<AdminBrandsPage />} />
        <Route path="coupons" element={<AdminCouponsPage />} />
        <Route path="inventory" element={<AdminInventoryPage />} />
        <Route path="banners" element={<AdminBannersPage />} />
        <Route path="returns" element={<AdminReturnsPage />} />
        <Route path="reviews" element={<AdminReviewsPage />} />
        <Route path="analytics" element={<AdminAnalyticsPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
      </Route>

      {/* Fallback 404 Route */}
      <Route
        path="*"
        element={
          <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
            <h1 className="text-6xl font-black text-indigo-600 font-['Outfit']">404</h1>
            <p className="text-lg font-bold text-slate-800 dark:text-slate-100 mt-2">Page Not Found</p>
            <p className="text-xs text-slate-500 mt-1">The requested URL does not exist on this server.</p>
            <a href="/" className="mt-6 bg-indigo-600 text-white font-bold text-xs px-6 py-3 rounded-full">
              Return to Homepage
            </a>
          </div>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
