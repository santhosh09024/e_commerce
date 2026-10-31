# Project Directory Structure - ShopEase E-Commerce

## 1. High-Level Architecture Tree

```text
d:\SANTHOSH\E-Commerce\
├── .devcontainer/
│   └── devcontainer.json             # 1-Click GitHub Codespaces configuration
├── backend/
│   ├── database/
│   │   └── seed.js                   # Comprehensive database seed script
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js                 # MongoDB connection & smart fallback
│   │   │   ├── email.js              # Nodemailer email dispatch service
│   │   │   └── razorpay.js           # Razorpay SDK & test mock engine
│   │   ├── controllers/              # 15 domain controllers
│   │   ├── middleware/               # Auth, admin guard, error & upload
│   │   ├── models/                   # 15 Mongoose schemas
│   │   ├── routes/                   # REST route definitions
│   │   ├── services/                 # Email & notification dispatchers
│   │   ├── utils/                    # Token generator & Indian validators
│   │   ├── app.js                    # Express application configuration
│   │   └── server.js                 # Entry server listener
│   ├── uploads/                      # Local uploaded product & profile images
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/                # Sidebar, Header, StatCards
│   │   │   ├── cart/                 # CartDrawer, OrderSummary
│   │   │   ├── common/               # Navbar, Footer, MobileNav, AnnouncementBar
│   │   │   └── product/              # ProductCard, ImageGallery, Filters
│   │   ├── context/                  # AuthContext, CartContext, WishlistContext, ThemeContext
│   │   ├── layouts/                  # MainLayout, AdminLayout
│   │   ├── pages/
│   │   │   ├── admin/                # 10 administration pages
│   │   │   └── customer/             # 12 customer storefront pages
│   │   ├── routes/                   # AppRoutes, ProtectedRoute, AdminRoute
│   │   ├── services/                 # Axios instance with interceptors
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
├── package.json                      # Root workspace scripts
└── README.md
```

---

## 2. Complete Detailed File-by-File Tree

```text
d:\SANTHOSH\E-Commerce\
├── .devcontainer/
│   └── devcontainer.json
├── .gitignore
├── package.json
├── package-lock.json
├── README.md
├── PROJECT_STRUCTURE.md
│
├── backend/
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   ├── package-lock.json
│   │
│   ├── database/
│   │   └── seed.js
│   │
│   ├── uploads/
│   │
│   └── src/
│       ├── app.js
│       ├── server.js
│       │
│       ├── config/
│       │   ├── db.js
│       │   ├── email.js
│       │   └── razorpay.js
│       │
│       ├── controllers/
│       │   ├── adminController.js
│       │   ├── authController.js
│       │   ├── bannerController.js
│       │   ├── brandController.js
│       │   ├── cartController.js
│       │   ├── categoryController.js
│       │   ├── contactController.js
│       │   ├── couponController.js
│       │   ├── faqController.js
│       │   ├── inventoryController.js
│       │   ├── notificationController.js
│       │   ├── orderController.js
│       │   ├── paymentController.js
│       │   ├── productController.js
│       │   ├── reviewController.js
│       │   └── wishlistController.js
│       │
│       ├── middleware/
│       │   ├── authMiddleware.js
│       │   ├── errorMiddleware.js
│       │   ├── rateLimitMiddleware.js
│       │   └── uploadMiddleware.js
│       │
│       ├── models/
│       │   ├── Banner.js
│       │   ├── Brand.js
│       │   ├── Cart.js
│       │   ├── Category.js
│       │   ├── ContactRequest.js
│       │   ├── Coupon.js
│       │   ├── FAQ.js
│       │   ├── InventoryHistory.js
│       │   ├── Notification.js
│       │   ├── Order.js
│       │   ├── Product.js
│       │   ├── ReturnRequest.js
│       │   ├── Review.js
│       │   ├── Settings.js
│       │   ├── User.js
│       │   └── Wishlist.js
│       │
│       ├── routes/
│       │   ├── adminRoutes.js
│       │   ├── authRoutes.js
│       │   ├── bannerRoutes.js
│       │   ├── brandRoutes.js
│       │   ├── cartRoutes.js
│       │   ├── categoryRoutes.js
│       │   ├── contactRoutes.js
│       │   ├── couponRoutes.js
│       │   ├── faqRoutes.js
│       │   ├── inventoryRoutes.js
│       │   ├── notificationRoutes.js
│       │   ├── orderRoutes.js
│       │   ├── paymentRoutes.js
│       │   ├── productRoutes.js
│       │   ├── reviewRoutes.js
│       │   ├── uploadRoutes.js
│       │   └── wishlistRoutes.js
│       │
│       ├── services/
│       │   ├── emailService.js
│       │   └── notificationService.js
│       │
│       └── utils/
│           ├── generateToken.js
│           └── validators.js
│
└── frontend/
    ├── index.html
    ├── package.json
    ├── package-lock.json
    ├── postcss.config.js
    ├── tailwind.config.js
    ├── vite.config.js
    │
    └── src/
        ├── App.jsx
        ├── index.css
        ├── main.jsx
        │
        ├── components/
        │   ├── admin/
        │   │   ├── AdminHeader.jsx
        │   │   └── AdminSidebar.jsx
        │   ├── cart/
        │   │   └── CartDrawer.jsx
        │   ├── common/
        │   │   ├── AnnouncementBar.jsx
        │   │   ├── Footer.jsx
        │   │   ├── MobileNav.jsx
        │   │   └── Navbar.jsx
        │   └── product/
        │       ├── ImageGallery.jsx
        │       ├── ProductCard.jsx
        │       └── ProductFilters.jsx
        │
        ├── context/
        │   ├── AuthContext.jsx
        │   ├── CartContext.jsx
        │   ├── ThemeContext.jsx
        │   └── WishlistContext.jsx
        │
        ├── layouts/
        │   ├── AdminLayout.jsx
        │   └── MainLayout.jsx
        │
        ├── pages/
        │   ├── admin/
        │   │   ├── AdminAnalyticsPage.jsx
        │   │   ├── AdminBannersPage.jsx
        │   │   ├── AdminBrandsPage.jsx
        │   │   ├── AdminCategoriesPage.jsx
        │   │   ├── AdminCouponsPage.jsx
        │   │   ├── AdminCustomersPage.jsx
        │   │   ├── AdminDashboardPage.jsx
        │   │   ├── AdminInventoryPage.jsx
        │   │   ├── AdminOrdersPage.jsx
        │   │   ├── AdminProductsPage.jsx
        │   │   ├── AdminReturnsPage.jsx
        │   │   ├── AdminReviewsPage.jsx
        │   │   └── AdminSettingsPage.jsx
        │   │
        │   └── customer/
        │       ├── CartPage.jsx
        │       ├── CheckoutPage.jsx
        │       ├── ContactPage.jsx
        │       ├── FAQPage.jsx
        │       ├── ForgotPasswordPage.jsx
        │       ├── HomePage.jsx
        │       ├── LegalPages.jsx
        │       ├── LoginPage.jsx
        │       ├── MyAccountPage.jsx
        │       ├── OrderTrackingPage.jsx
        │       ├── ProductDetailPage.jsx
        │       ├── RegisterPage.jsx
        │       ├── ResetPasswordPage.jsx
        │       ├── ShopPage.jsx
        │       └── WishlistPage.jsx
        │
        ├── routes/
        │   ├── AdminRoute.jsx
        │   ├── AppRoutes.jsx
        │   └── ProtectedRoute.jsx
        │
        └── services/
            └── api.js
```

