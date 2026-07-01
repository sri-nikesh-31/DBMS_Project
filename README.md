# Aura E-Commerce DBMS Project

## Overview

Aura is a full-stack **E-Commerce Order & Inventory Management System** designed to simulate real-world online shopping platforms. The system supports product browsing, cart management, order processing, payments, and inventory tracking with a strong focus on **DBMS concepts and performance optimization**.

---

## Features

* Product Catalog with Categories
* Cart Management System
* Order Placement & Tracking
* Payment Handling (Simulated)
* Inventory Management
* User Profiles & Authentication (Supabase)
* Order History
* AI Chatbot for product queries (Groq API)
* Gesture-based UI interactions (MediaPipe – optional feature)

---

## Tech Stack

### Frontend

* React (Vite)
* Tailwind CSS
* Framer Motion

### Backend / Services

* Supabase (PostgreSQL + Auth)
* Vercel Serverless Functions

### AI Integration

* Groq API (LLaMA-based models)

---

## Database Schema

### Tables Used:

* `profiles`
* `categories`
* `products`
* `inventory`
* `cart`
* `cart_items`
* `orders`
* `order_items`
* `payments`
* `shipments`
* `support_tickets`

---

## Relationships

* User → Orders (1:N)
* Orders → Order Items (1:N)
* Products → Order Items (1:N)
* Products → Inventory (1:1)
* Cart → Cart Items (1:N)

---

## Normalization (3NF)

Our database is designed in **Third Normal Form (3NF)**:

* No repeating groups
* No partial dependency
* No transitive dependency

### Example: `order_items`

```sql
order_items(order_item_id, order_id, product_id, quantity, price)
```

* Primary Key: `order_item_id`
* All attributes depend only on the key
* `price` is stored to preserve historical accuracy

---

## Indexing (Performance Optimization)

We implemented indexing to improve query performance using **B+ Trees**.

### Indexes Created:

```sql
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_cart_user ON cart(user_id);
CREATE INDEX idx_cart_items_cart ON cart_items(cart_id);
CREATE INDEX idx_order_items_order ON order_items(order_id);
```

### Why Indexing?

* Reduces search time from **O(n) → O(log n)**
* Improves JOIN performance
* Essential for large datasets

---

## Concurrency Control (Very Important)

To prevent **race conditions** during ordering:

### Problem:

Two users ordering the last item simultaneously.

### Solution:

We use an **atomic update query**:

```sql
UPDATE inventory
SET stock_quantity = stock_quantity - 1
WHERE product_id = ?
AND stock_quantity > 0
RETURNING stock_quantity;
```

### Benefits:

* Prevents overselling
* Ensures data consistency
* No need for explicit locking

---

## Transactions & Serializability

* Each order operation behaves like a **transaction**
* Ensures:

  * Atomicity
  * Consistency
* Achieves **serializable behavior** for concurrent users

---

## AI Chatbot

* Integrated using Groq API
* Answers product-related queries
* Uses live product data from database

API keys are stored securely using environment variables

---

## Gesture Interaction (Optional Feature)

* Built using MediaPipe Hands
* Supports:

  * Pinch → Click
  * Point → Scroll
  * Open hand → Particle interaction

Enhances user experience with futuristic UI.

---

## Project Structure

```text
src/
 ├── components/
 ├── pages/
 ├── context/
 ├── services/
 ├── hooks/
api/
 └── chat.js
```

---
## Prerequisites

Before running the project, ensure you have:

- Node.js (v18 or later)
- npm
- Git
- Access to the required Supabase project or valid Supabase credentials
- A Groq API key (if using the AI chatbot feature)
  
## Setup Instructions

### 1. Clone Repo

```bash
git clone https://github.com/sri-nikesh-31/DBMS_Project.git
cd DBMS_Project
```

---

### 2. Install Dependencies

```bash
npm install
```

---

### 3. Add Environment Variables

Create `.env`:

```env
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key
GROQ_API_KEY=your_key
```

---

### 4. Run Project

```bash
npm run dev
```

---

## Deployment

* Hosted using **Vercel**
* Serverless backend via `/api` routes

---

## Key DBMS Concepts Used

* Normalization (3NF)
* Indexing (B+ Tree)
* Join Optimization
* Transactions
* Concurrency Control
* Serializability

---

## Conclusion

This project demonstrates how **DBMS concepts are applied in real-world systems**, ensuring:

* High performance
* Data consistency
* Scalability

---

## Authors

* Sri Nikesh
* Siva Karthik
* Subhadra
* Pradhyumna
