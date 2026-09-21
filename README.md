# ShopEase - Modern Full-Stack Commercial E-Commerce Platform

> Production-ready, full-stack commercial e-commerce application built with React, Vite, Tailwind CSS, Node.js, Express, MongoDB (Mongoose), Razorpay Payment Gateway, and Nodemailer.

---

## Table of Contents
1. [Key Features](#key-features)
2. [Technology Stack](#technology-stack)
3. [System Architecture](#system-architecture)
4. [Folder Structure](#folder-structure)
5. [Prerequisites & Installation](#prerequisites--installation)
6. [Environment Configuration](#environment-configuration)
7. [Database Setup & Seeding](#database-setup--seeding)
8. [Running Locally](#running-locally)
9. [Pre-configured Demo Credentials](#pre-configured-demo-credentials)
10. [Payment Gateway Configuration (Razorpay & COD)](#payment-gateway-configuration)
11. [REST API Documentation](#rest-api-documentation)
12. [Production Deployment Instructions](#production-deployment-instructions)

---

## 1. Key Features

### Customer Experience & Storefront
- **Modern Responsive Design**: Mobile-first architecture, dark and light theme toggle, glassmorphism headers, and smooth micro-animations.
- **Dynamic Product Catalog**: Multi-category browsing with nested subcategories, brand filtration, and SEO-friendly slugged URLs (`/product/:slug`, `/category/:slug`, `/brand/:slug`).
- **Interactive Product Page**: Multi-angle image thumbnail gallery with real-time hover zoom lens, size and color variant selectors, live stock indicators, and customer reviews.
- **Search & Filters**: Real-time debounced autocomplete search suggestions, price range slider, star rating filters, in-stock toggles, and multi-tier sorting.
- **Persistent Cart & Wishlist**: Guest carts stored locally and automatically merged into the user's MongoDB cart upon sign-in.
- **Multi-Step Checkout**:
  1. Address selection & inline creation with Indian 6-digit PIN code and 10-digit phone validation.
  2. Express Shipping selection.
  3. Payment selection (Razorpay Online or Cash on Delivery).
  4. Order Confirmation with confetti celebration and instant tracking link.
- **Live Order Tracking**: Visual step-by-step shipment timeline (`Order placed` → `Confirmed` → `Processing` → `Packed` → `Shipped` → `Out for delivery` → `Delivered`) with courier and AWB tracking numbers.
- **Returns & Refunds**: Hassle-free customer return requests with reason selection and explanation directly from the user dashboard.

### Admin Dashboard & Operations
- **KPI Metrics & Analytics**: Total gross revenue, order volume, customer counts, low-stock warnings, and average order value (AOV).
- **Interactive Sales Charts**: Monthly financial performance bar chart, top-selling products leaderboard, and state-wise order volume.
- **Product Management**: Full CRUD modal for creating and updating products, managing variant matrices (sizes/colors/SKUs), setting promotional discounts, and publishing/unpublishing.
- **Order Management**: Search orders by customer or reference, update shipping stages, assign courier partners, and attach tracking numbers.
- **Return & Refund Disputes**: One-click approval/rejection with automated inventory stock restoration upon return approval.
- **Customer Control**: Search customers, toggle account suspensions/blocks, and inspect purchase histories.
- **Inventory Audit History**: Complete log of every stock movement (deductions from orders, manual restocks, return restorations).
- **Coupon & Promo Engine**: Configure percentage or flat currency coupons with minimum order values, maximum discount caps, usage limits, and expiration dates.
- **Banner Management**: Add, update, and toggle active marketing slides on the homepage hero slider.
- **Store Configuration**: Toggle Cash on Delivery (COD), set maximum allowable COD values, configure restricted pincodes, and adjust GST percentages.

---

## 2. Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React Icons, React Router v6, Axios, Canvas Confetti.
- **Backend**: Node.js, Express.js REST API, Mongoose ORM.
- **Authentication**: JWT (JSON Web Tokens) with 30-day expiry, bcryptjs password hashing (salt rounds = 10).
- **Security**: Helmet HTTP headers, CORS origin verification, express-rate-limit protection on authentication routes.
- **Payments**: Razorpay Node SDK with HMAC SHA-256 signature verification + built-in local Sandbox Mock simulator for offline testing.
- **Database**: MongoDB (supports local MongoDB service, MongoDB Atlas URI, and automated in-memory MongoDB fallback).

---

## 3. Folder Structure

```
d:\SANTHOSH\E-Commerce\
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

## 4. Prerequisites & Installation

### Prerequisites
- **Node.js**: v18 or higher (v24 recommended)
- **npm**: v9 or higher

### Installation Commands
Run the root install script to install all dependencies across root, backend, and frontend:
```bash
npm run install:all
```
*Alternatively, install individually:*
```bash
cd backend && npm install
cd ../frontend && npm install
```

---

## 5. Environment Configuration

In `backend/.env` (pre-configured template provided at `backend/.env.example`):
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Database Connection (Local MongoDB or MongoDB Atlas)
MONGO_URI=mongodb://127.0.0.1:27017/ecommerce

# JWT Secret
JWT_SECRET=super_secret_jwt_key_ecom_production_2026
JWT_EXPIRE=30d

# Razorpay Credentials (Leave as default to run in built-in test sandbox)
RAZORPAY_KEY_ID=rzp_test_sample_key_id
RAZORPAY_KEY_SECRET=rzp_test_sample_secret_key

# Email Settings (Optional)
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USER=
EMAIL_PASSWORD=
EMAIL_FROM=noreply@shopease.com
```

---

## 6. Database Setup & Seeding

The application comes with an automated seed script that populates realistic commercial products, variants, brands, categories, coupons, banners, and demo users.

Execute the seed script:
```bash
cd backend
npm run seed
```

> **Smart Database Fallback**: If you do not have a local MongoDB daemon running, the system will automatically initialize an in-memory MongoDB fallback database so the server and seed script run without manual setup!

---

## 7. Running Locally

Run both the backend API and frontend client concurrently with one command from the project root:
```bash
npm run dev
```

- **Frontend Client**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000/api`
- **API Health Check**: `http://localhost:5000/api/health`

---

## 8. Pre-configured Demo Credentials

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Admin** | `admin@ecommerce.com` | `admin123` | Full access to `/admin` dashboard, orders, inventory, catalog, and analytics |
| **Customer** | `customer@ecommerce.com` | `customer123` | Storefront browsing, checkout, wishlist, and order tracking |

*Quick Fill: The login page at `/login` provides one-click demo buttons to automatically fill both credentials.*

---

## 9. Available Coupons

- `WELCOME10`: 10% OFF on orders over ₹999 (Max discount ₹1,000)
- `FLASHSALE20`: 20% OFF on orders over ₹2,999 (Max discount ₹2,500)
- `FREESHIP`: ₹99 Flat OFF (Free shipping) on orders over ₹499
- `FESTIVE500`: Flat ₹500 OFF on orders over ₹2,500

---

## 10. REST API Reference (Sample Endpoints)

### Authentication
- `POST /api/auth/register` - Create new customer
- `POST /api/auth/login` - Authenticate & obtain JWT
- `GET /api/auth/me` - Get current profile
- `POST /api/auth/address` - Add new shipping address

### Products & Catalog
- `GET /api/products` - Filtered & paginated product catalog
- `GET /api/products/suggestions?q=:query` - Autocomplete suggestions
- `GET /api/products/:slug` - Single product details & related items
- `POST /api/products` - Admin create product
- `PUT /api/products/:id` - Admin update product

### Orders & Tracking
- `POST /api/orders` - Place verified order & decrement inventory
- `GET /api/orders` - User order history
- `GET /api/orders/track/:orderNumber` - Public shipment timeline tracking
- `PUT /api/orders/:id/cancel` - Customer cancellation & inventory restore

### Payment & Checkout
- `POST /api/payment/create` - Initiate Razorpay order
- `POST /api/payment/verify` - HMAC SHA-256 signature verification
- `POST /api/coupons/validate` - Server-side coupon evaluation

### Admin Management
- `GET /api/admin/dashboard` - High-level metrics & stats
- `GET /api/admin/analytics` - Revenue and geographic charts
- `PUT /api/admin/orders/:id/status` - Update shipping stage & tracking number
- `GET /api/inventory/logs` - Inventory audit trail

---

## 11. Production Deployment Instructions

1. **Build Frontend**:
   ```bash
   cd frontend
   npm run build
   ```
   This generates an optimized static bundle in `frontend/dist/`.
2. **Deploy Backend**:
   - Host on Render, Railway, AWS EC2, or DigitalOcean.
   - Set environment variables (`MONGO_URI`, `JWT_SECRET`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`).
   - Use a production MongoDB Atlas cluster string for `MONGO_URI`.
3. **Deploy Frontend**:
   - Deploy `frontend/dist` to Vercel, Netlify, or Cloudflare Pages.
   - Set `VITE_API_URL` to point to your live backend domain (e.g. `https://api.yourdomain.com/api`).
