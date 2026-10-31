import axios from 'axios';
import {
  mockCategories,
  mockBrands,
  mockBanners,
  mockProducts,
  mockAdminStats,
  mockUser,
} from './mockData';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT Token to outgoing requests if logged in
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Helper for standalone mock fallback (enables seamless preview on GitHub Pages)
const getMockResponse = (url = '', method = 'get') => {
  const cleanUrl = url.toLowerCase();

  if (cleanUrl.includes('/banners')) {
    return { success: true, data: mockBanners };
  }
  if (cleanUrl.includes('/categories')) {
    return { success: true, data: mockCategories };
  }
  if (cleanUrl.includes('/brands')) {
    return { success: true, data: mockBrands };
  }
  if (cleanUrl.includes('/products/slug/')) {
    const slug = cleanUrl.split('/products/slug/')[1]?.split('?')[0];
    const found = mockProducts.find((p) => p.slug === slug) || mockProducts[0];
    return { success: true, data: found };
  }
  if (cleanUrl.includes('/products/')) {
    const id = cleanUrl.split('/products/')[1]?.split('?')[0];
    const found = mockProducts.find((p) => p._id === id || p.slug === id) || mockProducts[0];
    return { success: true, data: found };
  }
  if (cleanUrl.includes('/products')) {
    let filtered = [...mockProducts];
    if (cleanUrl.includes('istrending=true')) filtered = filtered.filter((p) => p.isTrending);
    if (cleanUrl.includes('isbestseller=true')) filtered = filtered.filter((p) => p.isBestSeller);
    if (cleanUrl.includes('isflashsale=true')) filtered = filtered.filter((p) => p.isFlashSale);
    return {
      success: true,
      data: filtered,
      count: filtered.length,
      total: mockProducts.length,
      page: 1,
      totalPages: 1,
    };
  }
  if (cleanUrl.includes('/admin/analytics') || cleanUrl.includes('/admin/stats')) {
    return { success: true, data: mockAdminStats };
  }
  if (cleanUrl.includes('/auth/login') || cleanUrl.includes('/auth/register')) {
    return { success: true, data: mockUser };
  }
  if (cleanUrl.includes('/auth/me')) {
    const savedUser = localStorage.getItem('user');
    return { success: true, data: savedUser ? JSON.parse(savedUser) : mockUser };
  }
  if (cleanUrl.includes('/cart')) {
    return { success: true, data: { items: [] }, summary: { subtotal: 0, tax: 0, shippingFee: 0, grandTotal: 0 } };
  }
  if (cleanUrl.includes('/settings')) {
    return { success: true, data: { isCodEnabled: true, freeShippingThreshold: 999 } };
  }
  if (cleanUrl.includes('/faqs')) {
    return {
      success: true,
      data: [
        { _id: 'faq-1', question: 'How long does shipping take?', answer: 'Standard delivery takes 2-4 business days across major cities.' },
        { _id: 'faq-2', question: 'What is your return policy?', answer: 'We offer a 7-day hassle-free replacement or refund guarantee.' },
      ],
    };
  }

  return { success: true, data: [] };
};

// Response interceptor to handle unauthenticated 401s & mock fallback when offline
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      return Promise.reject(error);
    }

    // If running standalone (GitHub Pages or backend offline), use mock data gracefully
    const isOffline = !error.response || error.code === 'ERR_NETWORK' || error.response?.status === 404;
    if (isOffline) {
      const mockResult = getMockResponse(error.config?.url, error.config?.method);
      console.warn(`[Demo Fallback] Serving mock data for ${error.config?.url}`);
      return Promise.resolve({
        data: mockResult,
        status: 200,
        statusText: 'OK (Mock Fallback)',
        config: error.config,
        headers: {},
      });
    }

    return Promise.reject(error);
  }
);

export default api;
