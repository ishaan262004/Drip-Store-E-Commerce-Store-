
<h1 align="center">DRIP Store</h1>

<p align="center">
  <b>Premium GenZ Fashion E-Commerce Platform</b><br/>
  A full-stack MERN application with Stripe payments, Clerk authentication, and a complete admin dashboard.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-Express_5-339933?logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Stripe-Payments-635BFF?logo=stripe&logoColor=white" />
  <img src="https://img.shields.io/badge/Clerk-Auth-6C47FF?logo=clerk&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Deployed-Vercel-000?logo=vercel&logoColor=white" />
</p>

---

## 📸 Preview

| Homepage | Product Page | Admin Dashboard |
|----------|-------------|-----------------|
| Dark-themed hero with animated banner | Detailed product view with size/color selection | Orders, Users, Analytics & Products management |

---

## ✨ Features

### 🛍️ Storefront
- **500+ Products** — Curated catalog across Men, Women & Accessories categories
- **Product Filtering** — Filter by category, search by name, sort by price/rating
- **Shopping Cart** — Redux-powered persistent cart with size & color selection
- **Secure Checkout** — Stripe Elements integration with real payment processing
- **Order Confirmation** — Email receipts via Nodemailer + thank-you page with payment ID
- **User Profiles** — Clerk-managed authentication with protected routes

### 🔐 Admin Dashboard (`/admin`)
- **Orders Management** — View all orders, update status (Processing → Shipped → Delivered)
- **User Management** — See all registered users synced from Clerk, with order counts & spend
- **Analytics** — Total revenue, order count, top-selling products, monthly revenue charts
- **Product Catalog** — Browse all 500 products with stock levels and pricing
- **Role-Based Access** — Only `isAdmin: true` users see the Admin button in the navbar

### 🏗️ Technical Highlights
- **Zero hardcoded secrets** — All keys in environment variables
- **Clerk ↔ MongoDB user sync** — `attachUser` middleware auto-creates MongoDB records for Clerk users
- **Stock management** — Inventory decremented server-side after each order
- **Vercel-ready** — Serverless backend config included, SPA routing for frontend

---

## 🛠️ Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19 | UI library — component-based architecture with hooks |
| **Vite** | 7 | Build tool — instant HMR, lightning-fast cold starts, optimized production bundles |
| **Tailwind CSS** | 4 | Utility-first CSS framework — dark theme with custom design tokens |
| **Redux Toolkit** | 2.x | Global state management — cart persistence, product & order slices |
| **React Router** | 7 | Client-side routing — nested routes for admin, protected route wrappers |
| **Clerk React** | 5.x | Drop-in authentication UI — sign-in/sign-up modals, session management |
| **Stripe.js** | 8.x | PCI-compliant payment form — `Elements` provider with `PaymentElement` |
| **Axios** | 1.x | HTTP client — interceptors auto-attach Clerk bearer tokens to every API call |
| **React Toastify** | 11 | Toast notifications — order confirmations, error alerts, dark-themed |
| **React Icons** | 5.x | Icon library — HeroIcons set for consistent UI iconography |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js + Express** | 5.x | REST API server — routes, middleware, error handling |
| **MongoDB + Mongoose** | 9.x | Document database — schemas with validation, aggregation pipelines for analytics |
| **Clerk SDK** | 4.x | Server-side auth — `ClerkExpressRequireAuth` middleware, user lookup API |
| **Stripe Node** | 20.x | Payment processing — `PaymentIntents` API for secure server-side charges |
| **Nodemailer** | 8.x | Transactional email — order confirmation emails with HTML templates |
| **Multer** | 2.x | File upload handling — product image uploads |
| **bcrypt** | 6.x | Password hashing — 12-round salt for legacy auth fallback |
| **JSON Web Tokens** | 9.x | Token-based auth — JWT generation & verification for legacy endpoints |

### Infrastructure

| Service | Purpose |
|---------|---------|
| **MongoDB Atlas** | Cloud database — free M0 tier, auto-scaling, global clusters |
| **Clerk** | Authentication-as-a-service — OAuth, email/password, session management |
| **Stripe** | Payment gateway — test mode for development, production-ready |
| **Cloudinary** | Image CDN — grayscale-filtered product images, optimized delivery |
| **Vercel** | Deployment — serverless functions for backend, static hosting for frontend |

---

## 📁 Project Structure

```
drip-store/
├── client/                          # React Frontend
│   ├── public/
│   │   ├── products.json            # 500-product catalog (static data)
│   │   └── hero-slide-*.png         # Hero banner images
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx           # Navigation + admin button (role-gated)
│   │   │   ├── HeroBanner.jsx       # Animated hero carousel
│   │   │   ├── ProductCard.jsx      # Product grid card
│   │   │   ├── PaymentForm.jsx      # Stripe payment element wrapper
│   │   │   ├── Footer.jsx           # Site footer with links
│   │   │   └── Newsletter.jsx       # Email signup section
│   │   ├── pages/
│   │   │   ├── Home.jsx             # Landing page
│   │   │   ├── ProductListing.jsx   # Filterable product grid
│   │   │   ├── ProductDetails.jsx   # Single product view
│   │   │   ├── Cart.jsx             # Shopping cart
│   │   │   ├── Checkout.jsx         # Shipping + Stripe payment
│   │   │   ├── ThankYou.jsx         # Order confirmation
│   │   │   ├── AdminDashboard.jsx   # Admin layout (sidebar + outlet)
│   │   │   ├── AdminOrders.jsx      # Manage orders
│   │   │   ├── AdminUsers.jsx       # View all users
│   │   │   ├── AdminAnalytics.jsx   # Revenue & stats
│   │   │   └── AdminProducts.jsx    # Product catalog view
│   │   ├── redux/
│   │   │   ├── store.js             # Redux store config
│   │   │   └── slices/              # Cart, product, order, user slices
│   │   ├── services/
│   │   │   └── api.js               # Axios instance + all API calls
│   │   ├── App.jsx                  # Routes + providers
│   │   └── index.css                # Tailwind + custom design tokens
│   ├── vercel.json                  # SPA rewrite rules
│   └── vite.config.js               # Vite config + dev proxy
│
├── server/                          # Express Backend
│   ├── api/
│   │   └── index.js                 # Vercel serverless entry point
│   ├── config/
│   │   └── db.js                    # MongoDB connection
│   ├── controllers/
│   │   ├── adminController.js       # Admin stats, user list (Clerk sync)
│   │   ├── authController.js        # Register, login, profile
│   │   ├── orderController.js       # Create order, stock reduction
│   │   ├── productController.js     # CRUD + reviews
│   │   └── couponController.js      # Coupon validation
│   ├── middleware/
│   │   ├── auth.js                  # protect, attachUser, isAdmin
│   │   ├── errorHandler.js          # Global error handling
│   │   └── upload.js                # Multer config
│   ├── models/
│   │   ├── User.js                  # User schema (clerkId, isAdmin)
│   │   ├── Product.js               # Product schema (500 items)
│   │   ├── Order.js                 # Order schema (items, payment, status)
│   │   └── Coupon.js                # Discount coupon schema
│   ├── routes/
│   │   ├── adminRoutes.js           # GET /api/admin/*
│   │   ├── authRoutes.js            # POST /api/auth/*
│   │   ├── orderRoutes.js           # POST/GET /api/orders
│   │   ├── productRoutes.js         # GET /api/products
│   │   ├── paymentRoutes.js         # POST /api/payments/create-payment-intent
│   │   └── couponRoutes.js          # POST /api/coupons/validate
│   ├── utils/
│   │   ├── sendEmail.js             # Nodemailer transporter + templates
│   │   └── imageUtils.js            # Image URL helpers
│   ├── server.js                    # Express app (exported for Vercel)
│   ├── vercel.json                  # Serverless routing config
│   └── set-admin.js                 # Script to set admin role
│
├── .gitignore
└── package.json                     # Monorepo scripts (dev, install:all)
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- **MongoDB Atlas** account ([free tier](https://www.mongodb.com/cloud/atlas/register))
- **Clerk** account ([clerk.com](https://clerk.com))
- **Stripe** account ([stripe.com](https://stripe.com))

### 1. Clone & Install

```bash
git clone https://github.com/ishaan262004/Drip-Store-E-Commerce-Store-.git
cd Drip-Store-E-Commerce-Store-
npm run install:all
```

### 2. Environment Variables

Create `server/.env`:
```env
PORT=5001
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

Create `client/.env`:
```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_STRIPE_PK=your_stripe_publishable_key
```

### 3. Seed the Database

```bash
cd server
node seedProducts.js
node set-admin.js
```

### 4. Run Development Server

```bash
# From root directory — starts both frontend & backend
npm run dev
```

- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:5001](http://localhost:5001)

---

## 🌐 Deployment (Vercel)

This project deploys as **two separate Vercel projects** from the same repo:

### Backend
1. Import repo → Set root directory to `server`
2. Framework preset: **Other**
3. Add all `server/.env` variables to Vercel Environment Variables
4. Deploy

### Frontend
1. Import repo → Set root directory to `client`
2. Framework preset: **Vite**
3. Add environment variables:
   - `VITE_API_URL` = your deployed backend URL
   - `VITE_CLERK_PUBLISHABLE_KEY` = your Clerk key
   - `VITE_STRIPE_PK` = your Stripe publishable key
4. Deploy

---

## 🔒 Authentication Flow

```
User clicks Sign In
        ↓
Clerk modal opens (OAuth / Email)
        ↓
Clerk session created (JWT)
        ↓
Frontend: AuthProvider registers getToken()
        ↓
Every API call: Axios interceptor attaches Bearer token
        ↓
Backend: ClerkExpressRequireAuth validates token
        ↓
attachUser middleware: Clerk ID → MongoDB user lookup/create
        ↓
req.user populated → controllers have full user context
```

---

## 💳 Payment Flow

```
Checkout page → Shipping form filled
        ↓
Frontend: POST /api/payments/create-payment-intent { amount }
        ↓
Backend: Stripe PaymentIntent created → clientSecret returned
        ↓
Frontend: Stripe Elements confirms payment with clientSecret
        ↓
Payment succeeds → POST /api/orders { products, address, paymentId }
        ↓
Backend: Order saved to MongoDB, stock decremented, email sent
        ↓
Frontend: Redirected to /thank-you with payment ID
```

---

## 📊 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | — | Register new user |
| `POST` | `/api/auth/login` | — | Login user |
| `GET` | `/api/auth/me` | ✅ | Get current user |
| `GET` | `/api/products` | — | List all products |
| `GET` | `/api/products/:id` | — | Get single product |
| `POST` | `/api/products/:id/review` | ✅ | Add product review |
| `POST` | `/api/orders` | ✅ | Create new order |
| `GET` | `/api/orders/:userId` | ✅ | Get user's orders |
| `POST` | `/api/payments/create-payment-intent` | — | Create Stripe payment |
| `POST` | `/api/coupons/validate` | — | Validate coupon code |
| `GET` | `/api/admin/users` | 🔐 Admin | List all users (syncs Clerk) |
| `GET` | `/api/admin/orders` | 🔐 Admin | List all orders |
| `GET` | `/api/admin/products` | 🔐 Admin | List all products |
| `GET` | `/api/admin/stats` | 🔐 Admin | Analytics & revenue stats |

---

## 🧑‍💻 Author

**Ishaan Baberwal**
- GitHub: [@ishaan262004](https://github.com/ishaan262004)

---

## 📄 License

This project is for educational and portfolio purposes.
