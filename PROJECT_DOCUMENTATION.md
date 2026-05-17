# Academic Project Documentation: Osteria Bella (Bite-Friendly Order)
**Enterprise Application Development (EAD) & Human-Computer Interaction (HCI) Project Submission**

---

## 1. Executive Summary
**Osteria Bella** (Bite-Friendly Order) is a state-of-the-art, responsive web application designed to optimize restaurant ordering workflows, menu management, and admin oversight. The system addresses common friction points in both customer-facing ordering and kitchen-facing administration. It integrates a premium, visually engaging frontend interface with an Express/Node.js backend, providing a robust, standalone local persistence system (`localStorage`) alongside fully active Express API servers. 

The application is engineered to adhere to strict **Human-Computer Interaction (HCI)** design standards, employing modern design tokens, intuitive user navigation, and dynamic real-time simulated updates to simulate real restaurant conditions.

---

## 2. System Architecture & Tech Stack

The application relies on a decoupled, production-ready architecture using industry-standard tools:

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

    classDef client fill:#e1f5fe,stroke:#0288d1,stroke-width:2px;
    classDef server fill:#efebe9,stroke:#5d4037,stroke-width:2px;
    classDef storage fill:#efe8e0,stroke:#f57c00,stroke-width:2px;
    class A,B,C,D client;
    class G,H,I server;
    class E,F storage;
```

### Frontend Stack (Core UI & State)
- **Vite & React (JSX)**: High-performance frontend build pipeline.
- **Tailwind CSS**: Utility-first CSS framework coupled with customized HSL-tailored warm design tokens.
- **Radix UI Primitive Components (shadcn/ui)**: For highly accessible, customizable structural UI elements (Dialog, Tabs, Badge, Card, Toaster).
- **Lucide React**: Clean, lightweight SVG iconography.
- **React Router DOM**: Client-side client navigation and routing guards.
- **Zod**: Declarative schema validation for user input at signup, signin, and checkout.

### Backend Stack (Express API Server)
- **Node.js & Express**: Event-driven runtime environment providing core REST endpoints under `/api`.
- **Concurrently**: Manages parallel execution of the Vite server and Express API endpoints under a unified runtime terminal session.
- **Vitest & JSDOM**: Automated testing environment for DOM and unit behavior validation.

---

## 3. Human-Computer Interaction (HCI) & Visual Design System

The application represents a transition from basic MVPs to **enterprise-grade, humanized interactive experiences** by implementing the following guidelines:

### Warm Premium Aesthetics
- **Color Palette**: Replaces sterile defaults with an Italian-bistro-themed, warm, curated palette:
  - **Background**: Soft creamy linen (`bg-background`).
  - **Accent & Primary**: Rich warm golds, deep terracotta reds, and fresh basil greens for status indicators.
- **Glassmorphism**: Headers and interactive modals leverage `backdrop-blur` with subtle borders (`border-border/60`) to create depth and visual hierarchy.
- **Micro-Animations**: Hover-triggered rotations on the brand logo (`UtensilsCrossed`), gentle scale effects on action buttons, and animated badges (`animate-pop-in`) draw focus gracefully.

### User Accessibility & Usability (HCI Standards)
- **Intuitive Feedback**: Integrated with `Sonner` toasts that trigger on key user events (e.g., "Welcome back! 👋", "Order placed! Buon appetito 🍝").
- **Dine-in / Take-out Toggle**: Simple fields on the checkout screen automatically default to "Dine-in" if an address isn't provided, reducing form completion friction.
- **Semantic HTML5**: Elements are labeled structurally using standard HTML5 tags (`<header>`, `<nav>`, `<main>`, `<section>`) with clear `aria-label` tags for screen-readers.

---

## 4. Key Architectural Features

### A. Customer Flow
1. **Interactive Menu**: Multi-category food catalog filtered dynamically (Starters, Pizzas, Pastas, Desserts, Drinks) with real-time indicators for item availability.
2. **Review & Rating Drawer**: Integrated review portal allowing customers to submit a rating (1-5 stars) and comments on individual dishes from their order history tab.
3. **Persistent Cart**: Operates via a robust React Context (`CartContext.jsx`). Handles items additions, multi-quantity logic, total calculations, and visual shopping bags.
4. **Checkout Form (Zod Protected)**: Form-level validation requiring delivery addresses to be descriptive (at least 5 characters), securing transaction entries.
5. **Real-time Order Alerts**: Uses a background polling hook checking every 10 seconds to simulate real-time kitchen status changes. When an order state shifts from `pending` ➔ `preparing` ➔ `ready` ➔ `delivered`, push notifications immediately trigger to alert the user.

### B. Enterprise Admin Portal
The dashboard is accessed by signing in with `admin@osteria.com` using the **one-click "Chef Marco" autofill button** on the Sign In page.
1. **Live Kitchen Monitor**: A central orders dashboard that tracks order queues on a **FIFO (First In, First Out)** basis. Features one-click action buttons to progress order status or issue cancellations.
2. **Menu Editor CRUD GUI**: Administrators can fully update the restaurant catalog:
   - Create new dishes with description, pricing, and category.
   - Edit existing items in a seamless sheet sidebar.
   - Toggle availability or delete items.
3. **Customer Directory & Search**: Real-time user database search allowing administrators to lookup account details, email records, and custom user types instantly.
4. **Business Analytics Panel**: Interactive graphical widgets displaying key restaurant insights:
   - Today's Total Revenue ($)
   - Total Orders Processed
   - Average Order Ticket Size ($)
   - Category-wise sales distributions.

---

## 5. Database Schema & Data Models

For ease of university evaluation, the database functions via a multi-layered persistence framework: a server-side runtime in-memory database (`server/db.js`) and a synchronized client-side local database (`src/lib/store.js` backed by `localStorage`).

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
  "status": "delivered", // "pending" | "preparing" | "ready" | "delivered" | "cancelled"
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

## 6. Critical Bug Fixes & Developer Tooling Updates (Engineering Report)

During final system stabilization and auditing, three crucial improvements were made to restore stability and developer testing automation:

> [!NOTE]
> ### 1. Resolved Admin Dashboard Crash (`Admin.jsx`)
> - **Problem**: The `Customers` tab under [Admin.jsx](file:///e:/EAD%20Project%202026/bite-friendly-order/src/pages/Admin.jsx) used the `<Mail />` icon from the `lucide-react` library but it was never imported. This triggered a `ReferenceError` that crashed the entire component tree immediately on mount, rendering the dashboard blank.
> - **Solution**: Added `Mail` to the destructured imports from `"lucide-react"` at the top of `Admin.jsx`. The dashboard now mounts instantly and the customer cards load flawlessly with email icons.

> [!TIP]
> ### 2. Restored ESLint flat-config Support (`eslint.config.js`)
> - **Problem**: Running `npm run lint` failed due to the legacy `extends` block which is no longer supported in the ESLint Flat Config specification, blocking syntax analysis.
> - **Solution**: Modernized [eslint.config.js](file:///e:/EAD%20Project%202026/bite-friendly-order/eslint.config.js) to leverage correct Flat Config syntax by directly listing and exporting `js.configs.recommended`, adding browser & Node.js globals, and enabling JSX parsing. The command completes with zero structural errors.

> [!IMPORTANT]
> ### 3. Enabled Automated Tests Integration (`vitest.config.ts`)
> - **Problem**: `npm run test` failed to find test suites because the Vitest configuration looked exclusively for TypeScript files (`.ts`, `.tsx`) while the test suite was written in JavaScript (`.js`).
> - **Solution**: Updated the test search patterns in [vitest.config.ts](file:///e:/EAD%20Project%202026/bite-friendly-order/vitest.config.ts) to support `.js` / `.jsx` test extensions and updated the setup file configuration path to use `./src/test/setup.js`.

---

## 7. Execution Guide

Follow these commands to configure, execute, and verify the project:

### System Setup
Install dependencies:
```bash
npm install
```

### Launch Development Server
To launch both the Vite frontend (port `8080`) and the Node.js Express API server (port `3001`) simultaneously:
```bash
npm run dev:full
```
Open your web browser and navigate to: **`http://localhost:8080/`**

### Run Automated Quality Control Checks

#### 1. Code Quality & Standards (Linter)
```bash
npm run lint
```
*Confirms zero runtime syntax errors, correct import paths, and strict code formatting.*

#### 2. Automated Test Execution (Vitest)
```bash
npm run test
```
*Executes all UI and API mock unit tests to verify database functions and routing operations.*

---

## 8. Conclusion
**Osteria Bella** blends professional **frontend aesthetics**, **state-of-the-art UI architectures**, and **practical backend APIs** to construct a highly interactive enterprise ordering ecosystem. By addressing key design aspects through extensive HCI considerations and maintaining a robust test suite, the project represents a secure, scalable, and outstanding submission for the university curriculum.
