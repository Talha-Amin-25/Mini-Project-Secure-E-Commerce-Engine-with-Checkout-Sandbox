# 🛒 Mini Project - Secure E-Commerce Engine with Checkout Sandbox

A production-grade, secure Multi-Vendor E-Commerce Webstore featuring a decoupled React (Vite) frontend, Node.js/Express API backend, SQLite persistence, JWT authentication, and live Stripe Checkout & Webhook integration.

---

## 🌟 Key Features & Architecture

### 🏪 Multi-Vendor Marketplace
- **Buyer & Seller Roles**: Users can sign up as regular shoppers or register a **Shop Owner** account.
- **Seller Dashboard**: Dedicated seller portal to list inventory, upload product images, set stock, and track shop items.
- **Vendor Badges**: Product cards dynamically highlight shop ownership (e.g. *"Sold by: CyberTech"*).

### 🔒 Security & Authentication
- **Bcrypt Hashing**: User passwords hashed with 10 salt rounds.
- **Stateless JWT**: Bearer tokens protecting private API routes and user sessions.
- **Input Validation & SQL Injection Prevention**: Parameterized queries across SQLite.

### 🛒 Shopping Cart & Checkout Engine
- **Persistent Right Sidebar**: Contextual cart panel appearing dynamically on catalog browsing.
- **Dedicated Checkout Page**: `/checkout` order review page before gateway redirect.
- **Stripe Checkout Sandbox**: Real-time stock verification, Stripe Checkout session creation, and secure raw Webhook signature verification (`express.raw()`).

### 🎨 Futuristic UI / UX
- **Theme Toggler**: Cyberpunk Dark/Light mode switcher.
- **Avatar Gallery**: Profile customization with robot avatar pickers.

---

## 🛠️ Tech Stack

- **Frontend**: React 18 (Vite), Axios, Lucide Icons, Glassmorphic CSS System
- **Backend**: Node.js, Express.js, SQLite (`sqlite3`), CORS, dotenv
- **Security & Payments**: JWT, bcrypt, Stripe Checkout API & Webhook Listener

---

## ⚙️ Environment Setup (`.env`)

Create a `.env` file in the `backend/` directory based on `.env.example`:

```env
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_here
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret
```

---

## 🚀 Quick Start Guide

### 1. Backend API Server
```bash
cd backend
npm install
node server.js
```

### 2. Stripe Webhook Listener (Optional for live webhooks)
```bash
npx @stripe/cli listen --forward-to localhost:5000/api/webhook/stripe
```

### 3. Frontend Client
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 👤 Developer
**Talha Amin**  
*Full-Stack Developer*
