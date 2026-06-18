# ShopMart - Premium Amazon-Inspired E-Commerce Platform

ShopMart is a production-ready, client-side, frontend-only clone of Amazon. Built using the modern React 19 ecosystem, TypeScript, Vite, Tailwind CSS v4, Redux Toolkit (with Redux Persist), and TanStack Query. 

All core commerce operations (authenticating users, updating delivery addresses, applying coupons, Stripe sandbox card transactions, shipment progress tracking, product reviews, and administrative inventory CRUD) are fully operational and persist to local storage.

---

## 🚀 Key Feature Sets

### 1. Amazon Layout & Spacing
- **Dual-Tier Header**: Houses the active delivery location selector, catalog category dropdown search, autocomplete suggestions list, mock voice recognition search, accounts drop-down settings drawer, order histories link, and Shopping Cart quantity bubble.
- **Category Mega-Menu**: Slides open from the left to reveal department links, device lists, and developer sandboxed profile switches.
- **Footer Structure**: Exactly duplicates Amazon's directories columns, Back-to-Top scrolling, regional indicators, and copy tags.

### 2. Immersive Shopping Flows
- **Hero Carousel Banner**: Utilizes Swiper.js to render sliding promotions.
- **Product Gallery & Zoom**: Supports thumbnail updates and high-fidelity zoom-on-hover lenses.
- **Frequently Bought Together**: Displays a package checklist combining related items, calculates package discounts, and adds all checkmarks to the cart.
- **Reviews & Star Bars**: Renders ratings distributions, reviews logs, and custom reviews submission forms that update rating statistics in real time.
- **Cart & Subtotal Panel**: Features item count adjustments, coupon validation (`SHOPMART20` and `SAVE10`), free shipping progress gauges, and a "Save for Later" secondary shelf.

### 3. Secure Multi-Step Checkout
- **Stage 1 (Delivery Address)**: Allows adding and selecting multiple delivery points.
- **Stage 2 (Stripe Elements)**: Validates credit cards ending with sandbox credentials.
- **Stage 3 (Order review)**: Generates random tracking codes and shipment courier dates.

### 4. Admin Management Dashboard
- **Analytics Scorecards**: Sales totals, active orders count, product counts, and client accounts.
- **Sales Charts**: Combines line graphs mapping monthly revenue and pie charts displaying category shares.
- **Product CRUD Tables**: Adds, edits, and deletes items.
- **Orders & Coupons Admin**: Adjusts shipment delivery status dynamically and manages coupon codes.

---

## 🛠️ Technology Stack Used

- **React 19**
- **Vite 6**
- **TypeScript**
- **Tailwind CSS v4** (Utility compiling integrated inside Vite)
- **Redux Toolkit & Redux Persist** (Domain state persistence)
- **React Router v7**
- **Axios**
- **Framer Motion** (Sidebar animations, checkout accordion slides)
- **Lucide Icons**
- **Swiper.js**
- **Chart.js & React-Chartjs-2**
- **React Hot Toast** (User action notifications)
- **React Helmet Async** (SEO metadata tags)

---

## 📦 Directory Structure

```
├── shared/
│   └── types/             # Domain TypeScript interfaces
├── docs/
│   └── api_documentation.md
└── frontend/
    ├── src/
    │   ├── components/    # Navbar, Footer, SidebarDrawer
    │   ├── pages/         # Home, ProductDetails, Cart, Checkout, Profile, Admin
    │   ├── store/         # RTK configurations and slices
    │   ├── App.tsx        # React Router routes and layouts
    │   ├── index.css      # Custom styles and Tailwind theme colors
    │   └── main.tsx       # React DOM element mounting
    ├── tsconfig.json
    └── vite.config.ts
```

---

## 🏃 Launch Instructions

Ensure you have Node.js (version 20+) installed.

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:5173`.

---

## 🧪 Sandboxed Testing Guide

To make testing this e-commerce app seamless, we have added a sandbox persona switcher inside the header's **"Accounts & Lists"** dropdown menu:

1. **Customer Mode**:
   - Access to address book creation.
   - Adding review comments.
   - Checking out via Stripe or COD.
   - Tracking shipments and printing invoices in the orders tab.
2. **Admin Mode**:
   - Access to `/admin` dashboard.
   - Add new products, edit price/stock, delete catalog items.
   - Update order shipping status from "pending" to "shipped" or "delivered" (updates the customer view instantly).
   - Edit homepage carousel banners.
   - Create or delete promo coupons (try applying coupons like `SHOPMART20` at checkout!).
