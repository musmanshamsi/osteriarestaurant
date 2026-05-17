# 🍝 Osteria Bella (Bite-Friendly Order)
> **An Enterprise Application Development (EAD) & Human-Computer Interaction (HCI) Web Platform**

[![Vite](https://img.shields.io/badge/Vite-5.4.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-3.2-76E2B9?style=for-the-badge&logo=vitest&logoColor=black)](https://vitest.dev/)
[![ESLint](https://img.shields.io/badge/ESLint-9.3-4B32C3?style=for-the-badge&logo=eslint&logoColor=white)](https://eslint.org/)

Osteria Bella is a premium, full-stack food ordering and kitchen management system designed with a warm, authentic Italian bistro aesthetic. Adhering to strict HCI standards, it provides a seamless customer ordering flow alongside a real-time kitchen administration dashboard, business analytics widgets, and a menu CRUD editor.

---

## 🇮🇹 1. HCI & Visual Design System

The platform transitions from sterile, generic templates into a humanized, warm interactive experience tailored to a rustic Italian bistro:

### 🎨 Color Palette & Aesthetics
- **Warm Linen (`bg-background`)**: Soft cream tones instead of harsh white screens, reducing eye fatigue.
- **Deep Terracotta (`text-primary`)**: Rich tomato-red accents for primary buttons, focus states, and branding.
- **Amalfi Gold (`text-gold`)**: Warm amber status indicators and star icons.
- **Basil Green**: Fresh green highlights for open/available indicators and completed tags.
- **Glassmorphic Interfaces**: Headers and interactive drawers leverage backing blurs (`backdrop-blur-sm`) with soft translucent borders (`border-border/60`) for clean spatial depth.

### ✨ Micro-Animations
- **Rotating Brand Logo**: The brand mark (`UtensilsCrossed`) smoothly rotates 15 degrees on hover.
- **Smooth Scaling**: Action buttons scale down slightly on click (`active:scale-95`) to offer high tactile responsiveness.
- **Animate Pop-in**: Cart badges and alert banners slide into view dynamically to draw focus without being obtrusive.

---

## 🛠️ 2. Decoupled System Architecture

The application relies on a modern, decoupled architecture allowing for independent scaling and high performance:

```mermaid
graph TD
    subgraph Client-Side (Vite + React)
        A[React UI Components] --> B[React Router DOM]
        A --> C[Context API - AuthContext & CartContext]
        A --> D[Local API Client - src/lib/api.js]
    end

    subgraph Data & Persistence Layer
        D --> E[(Local Storage Persistence)]
        F[(In-Memory Database - server/db.js)]
    end

    subgraph Server-Side (Node.js + Express)
        G[Express App - Port 3001] --> H[Middleware - Auth & Validation]
        G --> I[Routes - Menu, Orders, Analytics, Receipts]
        I --> F
    end

    classDef client fill:#fcf8f2,stroke:#c2410c,stroke-width:2px;
    classDef server fill:#f5ebe0,stroke:#854d0e,stroke-width:2px;
    classDef storage fill:#f3f4f6,stroke:#4b5563,stroke-width:2px;
    class A,B,C,D client;
    class G,H,I server;
    class E,F storage;
```

### Core Stack
- **Frontend**: Vite + React 18, Tailwind CSS, Radix UI Primitives (Shadcn/ui templates), Lucide React icons, and React Router DOM.
- **Backend**: Node.js, Express API server running on port `3001`, Zod schemas, and local in-memory DB persistence.
- **Simulated Real-time**: A 10-second polling mechanism that monitors database updates and fires push notifications using the `Sonner` toast engine.

---

## 🚀 3. Core Features & Workflows

### A. Customer Order Journey
1. **Interactive Menu**: Dynamic category filters (Starters, Pizzas, Pastas, Desserts, Drinks) with real-time indicators for food item availability.
2. **One-Click Cart**: Incremental/decremental quantities, real-time total calculation, and local preservation using React Context (`CartContext`).
3. **Zod-Validated Checkout**: Secure checkout form requiring valid delivery details (e.g. addresses with a 5-character minimum) and customizable preparation notes.
4. **Real-time Order Alerts**: Tracks kitchen status shifting through `pending` ➔ `preparing` ➔ `ready` ➔ `delivered` with automatic notifications.
5. **Rating & Feedback Drawer**: Integrated feedback drawer where users can rate and leave comments on menu items they've purchased.

### B. Enterprise Admin Portal
1. **Premium Credentials Autofill**: One-click login buttons for **Chef Marco (Admin)** and **Sofia Esposito (Customer)**. This completely masks the complex credentials from public UI displays while enabling high-speed testing.
2. **Kitchen FIFO Monitor**: Queue display following First In, First Out logic. Admins can update status or cancel orders in a single click.
3. **Menu CRUD GUI**: Fully managed menu list with drawers to toggle item availability, edit descriptions, adjust pricing, or upload asset links.
4. **Business Analytics Panel**: Beautiful visual indicators displaying:
   - Today's Total Revenue ($)
   - Total Orders Processed
   - Average Order Ticket Size ($)
   - Category-wise sales breakdowns.

---

## 💾 4. Database Schema & Models

### User Account Model
```json
{
  "id": "user-cust-002",
  "email": "customer@osteria.com",
  "password": "SofiaEsposito_Osteria2026!",
  "name": "Sofia Esposito",
  "role": "customer" // "admin" | "customer"
}
```

### Menu Item Model
```json
{
  "id": "m01",
  "name": "Bruschetta al Pomodoro",
  "category": "starter", // "starter" | "pizza" | "pasta" | "dessert" | "drink"
  "price": 8.50,
  "description": "Toasted bread with garlic and tomatoes.",
  "is_available": true
}
```

### Order Model
```json
{
  "id": "ord-88880001",
  "user_id": "user-cust-002",
  "customer_name": "Sofia Esposito",
  "status": "preparing", // "pending" | "preparing" | "ready" | "delivered" | "cancelled"
  "total": 37.50,
  "address": "12 Olive Lane",
  "notes": "No garlic on the bruschetta please.",
  "order_items": [
    {
      "id": "m08",
      "name": "Spaghetti alla Carbonara",
      "price": 15.00,
      "quantity": 1
    }
  ],
  "created_at": "2026-05-17T12:00:00.000Z"
}
```

---

## ⚡ 5. Execution & Developer Guide

### Setup & Installation
Install the project dependencies locally:
```bash
npm install
```

### Running the Platform
To launch the Vite client (port `8080`) and the Node.js API server (port `3001`) simultaneously:
```bash
npm run dev:full
```
Open **`http://localhost:8080/`** in your browser.

### Quality Control & Quality Assurance

#### 1. Code Quality Auditing (Linter)
```bash
npm run lint
```
*Validates syntax safety, resolves unused variables, and verifies imports.*

#### 2. Automated Testing Suite (Vitest)
```bash
npm run test
```
*Runs all UI, context, API, and mock DB unit tests with Vitest.*

---

## 📝 6. Developer Audit & Stabilization Report

During final system stabilization and preparation for production deployment, several major upgrades were integrated:
- **TypeScript-to-JavaScript Refactoring**: Standardized the entire codebase to modern `.jsx` and `.js` schemas, ensuring clean compilation and easy evaluation.
- **Admin Dashboard Stabilization**: Fixed a critical `ReferenceError` caused by a missing `<Mail />` icon import from the `lucide-react` library.
- **ESLint Modernization**: Updated `eslint.config.js` to support flat configuration schemas without deprecated properties, resolving build pipeline blocks.
- **Test Suite Resolution**: Configured `vitest.config.ts` to fully discover both `.js` and `.jsx` test suites and search patterns.
- **Frictionless Demo Login**: Removed plain-text display passwords from UI cards, replacing them with a secure, beautifully badge-styled click-to-autofill grid.

---
*Created with Passion & Italian Hospitality by the Osteria Bella Dev Team.*
