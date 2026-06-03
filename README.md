# 🍝 Osteria Bella (Bite-Friendly Order)

**Enterprise Application Development (EAD) & Human-Computer Interaction (HCI) Web Platform**

[![Vite](https://img.shields.io/badge/Vite-5.4.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-4.19-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![SQLite](https://img.shields.io/badge/SQLite-3.x-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)

## 📋 Project Description

Osteria Bella is a premium, full-stack **food ordering and kitchen management system** designed with a warm, authentic Italian bistro aesthetic. The application adheres to strict HCI (Human-Computer Interaction) standards and provides:

- **Customer Experience**: Seamless, intuitive menu browsing, cart management, and order placement
- **Admin Dashboard**: Real-time kitchen order management with live status tracking
- **Business Intelligence**: Analytics widgets displaying revenue, orders, and category-wise sales
- **Menu Management**: Complete CRUD operations for menu items with availability control
- **Review System**: Customers can rate items and leave feedback

The system follows a **three-tier architecture** (Frontend → Backend → Database) with clean separation of concerns, proper error handling, and responsive design.

---

## ✨ Key Features

- ✅ **User Authentication** - Sign In / Sign Up with validation
- ✅ **Menu Management** - Browse, search, filter, and sort menu items by category and price
- ✅ **Shopping Cart** - Add/remove items, adjust quantities, calculate totals
- ✅ **Order Placement** - Secure checkout with address and notes validation
- ✅ **Order Tracking** - View order history and real-time status updates (pending → preparing → ready → delivered)
- ✅ **Review System** - Rate items and leave feedback comments
- ✅ **Admin Dashboard** - Manage menu items (CRUD), track orders, view analytics
- ✅ **Business Analytics** - KPIs, revenue tracking, top-selling items, daily charts
- ✅ **Receipt Generation** - Generate and view order receipts
- ✅ **Responsive Design** - Works on mobile, tablet, and desktop
- ✅ **Real-time Notifications** - Toast alerts for order updates and user actions
- ✅ **Role-Based Access** - Admin dashboard only accessible to admin users

---

## 🛠️ Technologies Used

### Frontend Stack
| Technology | Purpose | Version |
|-----------|---------|---------|
| **React** | UI library with functional components | 18.3 |
| **Vite** | Build tool and dev server | 5.4 |
| **React Router** | Client-side routing | 6.30 |
| **Tailwind CSS** | Utility-first CSS framework | 3.4 |
| **Shadcn/UI** | Component library (Radix UI primitives) | Latest |
| **Lucide React** | Icon library | 0.462 |
| **Zod** | Schema validation | 3.25 |
| **Sonner** | Toast notifications | 1.7 |
| **React Hook Form** | Form state management | 7.61 |
| **Context API** | State management (AuthContext, CartContext) | Built-in |

### Backend Stack
| Technology | Purpose | Version |
|-----------|---------|---------|
| **Node.js** | JavaScript runtime | 22.x |
| **Express** | Web framework | 4.19 |
| **Better-SQLite3** | Synchronous SQLite driver | 12.10 |
| **CORS** | Cross-Origin Resource Sharing | 2.8 |
| **JWT** | JSON Web Tokens (auth) | 9.0 |

### Database
- **SQLite** - Embedded relational database with persistent file storage

---

## 📦 Installation & Setup

### Prerequisites
- **Node.js** 18+ and **npm** installed on your system
- **Git** (optional, for cloning the repository)

### Step 1: Clone or Extract Project

```bash
# If cloning from GitHub
git clone https://github.com/musmanshamsi/osteriarestaurant.git
cd osteriarestaurant

# Or if already extracted
cd osteriarestaurant
```

### Step 2: Install Root Dependencies

```bash
npm install
```

This installs dependencies for the frontend.

### Step 3: Install Backend Dependencies

```bash
cd server
npm install
cd ..
```

This installs Express, SQLite, and other backend dependencies.

---

## 🚀 Running the Project

### Option 1: Run Both Frontend & Backend Together (Recommended)

```bash
npm run dev:full
```

This command:
- Starts the Vite frontend dev server on **http://localhost:5173**
- Starts the Express backend on **http://localhost:3001**
- Automatically initializes the SQLite database with seed data on first run

**Open your browser and navigate to: `http://localhost:5173`**

### Option 2: Run Frontend Only

```bash
npm run dev
```

The frontend will be available on **http://localhost:5173** (but API calls won't work without the backend running).

### Option 3: Run Backend Only

```bash
npm run server
```

The backend API will be available on **http://localhost:3001**. Test with:

```bash
curl http://localhost:3001/api/health
```

Expected response: `{"status":"ok","mode":"sqlite","timestamp":"..."}`

### Option 4: Run Separately in Different Terminals

**Terminal 1 - Frontend:**
```bash
npm run dev
```

**Terminal 2 - Backend:**
```bash
npm run server
```

---

## 🗄️ Database Setup

### Automatic Initialization

The database is **automatically initialized** on first backend startup:

```bash
npm run server
```

You will see:
```
✅ SQLite database ready: .../server/osteria.db
✓ Seeded default users
✓ Seeded default menu items
✓ Seeded default reviews

🍕 Osteria Bella API (SQLite) running on http://localhost:3001
```

### Database File Location

- **Windows**: `osteriarestaurant/server/osteria.db`
- **Mac/Linux**: `osteriarestaurant/server/osteria.db`

### Database Tables

The SQLite database contains 5 tables:

1. **users** - User accounts with roles (admin/customer)
2. **menu_items** - Restaurant menu items with pricing and availability
3. **orders** - Customer orders with status tracking
4. **order_items** - Line items within each order
5. **reviews** - Customer reviews and ratings

### Seed Data

Default test accounts are created on first startup:

| Email | Password | Role |
|-------|----------|------|
| `admin@osteria.com` | `ChefMarco_Osteria2026!` | Admin |
| `customer@osteria.com` | `SofiaEsposito_Osteria2026!` | Customer |

### Manual Database Reset

To reset the database and reseed it, delete the database file and restart the server:

```bash
# Windows
del server/osteria.db

# Mac/Linux
rm server/osteria.db
```

Then restart:
```bash
npm run server
```

---

## 🔐 Environment Variables

### Backend (.env)

Create a `.env` file in the `server/` directory (copy from `.env.example`):

```bash
# .env file location: server/.env

# Server port
PORT=3001

# Database (SQLite uses local file, no external setup needed)
# Database file: ./server/osteria.db (auto-created)

# Optional: Supabase credentials (if using external auth)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_key_here
SUPABASE_JWT_SECRET=your_jwt_secret_here
```

**Note:** For this project, SQLite is used for local development. No external database configuration needed.

### Frontend

No `.env` file needed for frontend. API calls are hardcoded to `http://localhost:3001/api`.

---

## 🧪 Testing & Quality Assurance

### Run Linter (ESLint)

```bash
npm run lint
```

Validates code formatting and catches syntax errors.

### Run Tests (Vitest)

```bash
npm run test
```

Runs unit and integration tests.

### Watch Mode (Development Testing)

```bash
npm run test:watch
```

Runs tests in watch mode during development.

---

## 📁 Project Structure

```
osteriarestaurant/
├── src/                          # Frontend source code
│   ├── pages/                    # Page components
│   │   ├── Index.jsx            # Menu browsing page
│   │   ├── Auth.jsx             # Sign In / Sign Up
│   │   ├── Cart.jsx             # Shopping cart
│   │   ├── Checkout.jsx         # Order checkout
│   │   ├── Orders.jsx           # Order history
│   │   ├── Admin.jsx            # Admin dashboard
│   │   └── NotFound.jsx         # 404 page
│   ├── components/               # Reusable UI components
│   │   ├── Header.jsx           # Navigation header
│   │   ├── Layout.jsx           # Page layout wrapper
│   │   ├── ItemDetailsModal.jsx # Item details popup
│   │   ├── ReviewModal.jsx      # Review submission
│   │   ├── MenuItemEditor.jsx   # Admin menu editor
│   │   └── ui/                  # Shadcn UI components
│   ├── context/                  # State management
│   │   ├── AuthContext.jsx      # User authentication state
│   │   └── CartContext.jsx      # Shopping cart state
│   ├── lib/                      # Utilities and API
│   │   ├── api.js               # API wrapper functions
│   │   ├── store.js             # HTTP client for backend
│   │   └── utils.js             # Helper functions
│   ├── hooks/                    # Custom React hooks
│   ├── assets/                   # Images and static files
│   ├── App.jsx                   # Root component
│   └── main.jsx                  # Entry point
├── server/                        # Backend source code
│   ├── db.js                     # SQLite database layer
│   ├── index.js                  # Express server setup
│   ├── package.json              # Backend dependencies
│   ├── routes/                   # API endpoint definitions
│   │   ├── auth.js              # Authentication endpoints
│   │   ├── menu.js              # Menu CRUD endpoints
│   │   ├── orders.js            # Order management
│   │   ├── reviews.js           # Review endpoints
│   │   ├── users.js             # User endpoints
│   │   ├── analytics.js         # Dashboard analytics
│   │   └── receipts.js          # Receipt generation
│   └── middleware/               # Express middleware
│       └── auth.js              # Auth validation
├── public/                        # Static assets
├── supabase/                      # Supabase migrations (if used)
├── package.json                   # Frontend dependencies
├── vite.config.js                # Vite configuration
├── tailwind.config.js            # Tailwind CSS config
├── README.md                      # This file
├── .gitignore                     # Git ignore rules
└── .env.example                   # Environment variables template
```

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Menu
- `GET /api/menu` - Fetch menu items
- `POST /api/menu` - Create menu item (admin)
- `PATCH /api/menu/:id` - Update menu item (admin)
- `DELETE /api/menu/:id` - Delete menu item (admin)

### Orders
- `GET /api/orders` - Fetch all orders (admin)
- `GET /api/orders/:id` - Get specific order
- `POST /api/orders` - Place new order
- `PATCH /api/orders/:id/status` - Update order status (admin)

### Reviews
- `GET /api/reviews?item_id=X` - Fetch reviews for item
- `POST /api/reviews` - Submit review

### Analytics
- `GET /api/analytics` - Dashboard KPIs and charts

### Health Check
- `GET /api/health` - Server status

---

## 👥 Default Test Accounts

Use these credentials to test different user roles:

### Admin Account
- **Email:** `admin@osteria.com`
- **Password:** `ChefMarco_Osteria2026!`
- **Access:** Full admin dashboard, menu management, order control

### Customer Account
- **Email:** `customer@osteria.com`
- **Password:** `SofiaEsposito_Osteria2026!`
- **Access:** Browse menu, place orders, view order history, leave reviews

---

## 🎨 Design Highlights

### Color Palette
- **Warm Linen** - Soft cream tones for reduced eye fatigue
- **Deep Terracotta** - Rich tomato-red for primary actions
- **Amalfi Gold** - Warm amber for status indicators
- **Basil Green** - Fresh green for availability indicators

### Micro-Interactions
- Rotating logo on hover
- Smooth button scaling on click
- Pop-in animations for notifications
- Glassmorphic card designs with backdrop blur

### Responsive Design
- Mobile-first approach
- Works perfectly on phones (320px+), tablets, and desktops
- Touch-friendly buttons and spacing

---

## 🚨 Troubleshooting

### Issue: "Failed to load menu"
**Solution:** Ensure the backend is running:
```bash
npm run server
```

### Issue: Backend port 3001 already in use
**Solution:** Kill the process using port 3001 or change the port in `server/index.js`:
```javascript
const PORT = process.env.PORT || 3001;  // Change 3001 to another port
```

### Issue: Database file not found
**Solution:** The database auto-creates on first backend startup. If it doesn't:
```bash
npm run server
```

### Issue: "Invalid email or password" during login
**Solution:** Use the default credentials provided above, or sign up a new account.

### Issue: Frontend can't connect to backend
**Solution:** Check that:
1. Backend is running on `http://localhost:3001`
2. CORS is enabled (it is by default)
3. Firewall isn't blocking port 3001

---

## 📝 Development Workflow

### Starting Fresh
```bash
# Install all dependencies
npm install
cd server && npm install && cd ..

# Run the full application
npm run dev:full
```

### Code Quality Checks
```bash
# Check for linting errors
npm run lint

# Run tests
npm run test

# Run tests in watch mode
npm run test:watch
```

### Building for Production
```bash
npm run build
```

Creates optimized production build in `dist/` folder.

---

## 🐛 Known Limitations

1. Database persistence is file-based (SQLite). For production, migrate to PostgreSQL or MongoDB.
2. Authentication uses session tokens (localStorage). For production, implement JWT with refresh tokens.
3. Real-time updates use polling (10-second intervals). For production, implement WebSocket for true real-time updates.
4. Image uploads use external URLs. For production, implement local file upload storage.

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is provided as-is for educational purposes.

---

## � Support

For issues, questions, or feature requests, please open an issue on the GitHub repository.

---

*Osteria Bella is maintained for educational purposes and can be enhanced with contributions via GitHub issues.*
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
