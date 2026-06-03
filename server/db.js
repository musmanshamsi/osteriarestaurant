// ─── SQLite Database Layer ────────────────────────────────────────────────────
// Replaces the old in-memory store with a persistent SQLite file.
// Database file: server/osteria.db

const path    = require("path");
const Database = require("better-sqlite3");

const DB_PATH = path.join(__dirname, "osteria.db");
const db      = new Database(DB_PATH);

// Enable WAL mode for better performance
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// ─── Schema ───────────────────────────────────────────────────────────────────

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id          TEXT PRIMARY KEY,
    email       TEXT UNIQUE NOT NULL,
    password    TEXT NOT NULL,
    name        TEXT NOT NULL,
    role        TEXT NOT NULL DEFAULT 'customer',
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS menu_items (
    id           TEXT PRIMARY KEY,
    name         TEXT NOT NULL,
    description  TEXT,
    category     TEXT NOT NULL,
    price        REAL NOT NULL,
    image_url    TEXT,
    is_available INTEGER NOT NULL DEFAULT 1,
    created_at   TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS orders (
    id            TEXT PRIMARY KEY,
    user_id       TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    status        TEXT NOT NULL DEFAULT 'pending',
    total         REAL NOT NULL,
    address       TEXT,
    notes         TEXT,
    created_at    TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at    TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id   TEXT NOT NULL,
    item_id    TEXT NOT NULL,
    name       TEXT NOT NULL,
    price      REAL NOT NULL,
    quantity   INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (order_id) REFERENCES orders(id)
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id         TEXT PRIMARY KEY,
    item_id    TEXT NOT NULL,
    user_id    TEXT,
    user_name  TEXT NOT NULL,
    rating     INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
    comment    TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (item_id) REFERENCES menu_items(id)
  );
`);

// ─── Seed Default Data (only if tables are empty) ────────────────────────────

const seedUsers = () => {
  const count = db.prepare("SELECT COUNT(*) as cnt FROM users").get();
  if (count.cnt > 0) return;
  const insert = db.prepare(
    "INSERT INTO users (id, email, password, name, role) VALUES (?, ?, ?, ?, ?)"
  );
  insert.run("user-admin-001", "admin@osteria.com",    "ChefMarco_Osteria2026!",    "Chef Marco",    "admin");
  insert.run("user-cust-002",  "customer@osteria.com", "SofiaEsposito_Osteria2026!", "Sofia Esposito", "customer");
  console.log("  ✓ Seeded default users");
};

const seedMenu = () => {
  const count = db.prepare("SELECT COUNT(*) as cnt FROM menu_items").get();
  if (count.cnt > 0) return;
  const insert = db.prepare(
    "INSERT INTO menu_items (id, name, description, category, price, image_url, is_available) VALUES (?, ?, ?, ?, ?, ?, 1)"
  );
  insert.run("m01", "Bruschetta al Pomodoro",  "Crispy toasted bread rubbed with garlic, topped with vine-ripened tomatoes and fresh basil.", "starter", 8.50,  "https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=600&q=80");
  insert.run("m04", "Margherita Verace",        "The original Neapolitan pizza — San Marzano tomato, fior di latte mozzarella, fresh basil.", "pizza",   14.00, "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=600&q=80");
  insert.run("m08", "Spaghetti alla Carbonara", "Slow-cured guanciale, free-range egg yolks, Pecorino Romano, freshly cracked black pepper.", "pasta",   15.00, "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=600&q=80");
  insert.run("m14", "Tiramisù Classico",        "Savoiardi ladyfingers soaked in espresso, layered with mascarpone cream.",                   "dessert", 9.00,  "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&q=80");
  insert.run("m20", "Limoncello Spritz",        "House-made Amalfi limoncello, Prosecco DOC, fresh mint and lemon.",                          "drink",   9.50,  "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=600&q=80");
  insert.run("m21", "Penne all'Arrabbiata",      "Penne pasta in a spicy tomato sauce with garlic, chilli, and fresh parsley.",                "pasta",   13.00, "https://images.unsplash.com/photo-1608219992759-8d74ed8d76eb?w=600&q=80");
  insert.run("m22", "Caprese Salad",             "Buffalo mozzarella, heirloom tomatoes, fresh basil, drizzled with extra-virgin olive oil.",  "starter", 11.50, "https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5?w=600&q=80");
  insert.run("m23", "Panna Cotta",               "Silky vanilla panna cotta with a wild berry coulis.",                                        "dessert", 8.00,  "https://images.unsplash.com/photo-1488477181040-b3f4a94e40ab?w=600&q=80");
  insert.run("m24", "Acqua Minerale",            "Still or sparkling mineral water.",                                                          "drink",   3.50,  "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=600&q=80");
  insert.run("m25", "Pizza Diavola",             "Spicy Italian salami, San Marzano tomato, fior di latte, fresh chilli.",                     "pizza",   16.00, "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80");
  console.log("  ✓ Seeded default menu items");
};

const seedReviews = () => {
  const count = db.prepare("SELECT COUNT(*) as cnt FROM reviews").get();
  if (count.cnt > 0) return;
  const insert = db.prepare(
    "INSERT INTO reviews (id, item_id, user_id, user_name, rating, comment) VALUES (?, ?, ?, ?, ?, ?)"
  );
  insert.run("r-001", "m04", "user-cust-002", "Sofia Esposito", 5, "Authentic Neapolitan taste! Absolutely loved it.");
  insert.run("r-002", "m08", "user-cust-002", "Sofia Esposito", 4, "Very good carbonara, but could use more pepper!");
  insert.run("r-003", "m01", null,            "Marco P.",        5, "Perfect starter. The tomatoes are so fresh.");
  insert.run("r-004", "m14", null,            "Elena G.",        5, "Best tiramisu outside of Rome!");
  console.log("  ✓ Seeded default reviews");
};

// Run seeds
seedUsers();
seedMenu();
seedReviews();

console.log(`\n✅ SQLite database ready: ${DB_PATH}\n`);

// ─── User Helpers ─────────────────────────────────────────────────────────────

const getUserByEmail = db.prepare("SELECT * FROM users WHERE LOWER(email) = LOWER(?)");
const getUserById    = db.prepare("SELECT id, email, name, role, created_at FROM users WHERE id = ?");
const getAllUsers     = db.prepare("SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC");
const insertUser     = db.prepare(
  "INSERT INTO users (id, email, password, name, role) VALUES (?, ?, ?, ?, 'customer')"
);

// ─── Menu Helpers ─────────────────────────────────────────────────────────────

const getAllMenu       = db.prepare("SELECT * FROM menu_items ORDER BY category, name");
const getAvailMenu    = db.prepare("SELECT * FROM menu_items WHERE is_available = 1 ORDER BY category, name");
const getMenuItemById  = db.prepare("SELECT * FROM menu_items WHERE id = ?");
const insertMenuItem   = db.prepare(
  "INSERT INTO menu_items (id, name, description, category, price, image_url, is_available) VALUES (?, ?, ?, ?, ?, ?, ?)"
);
const updateMenuItemStmt = (fields) => {
  const sets = Object.keys(fields).filter(k => k !== "id").map(k => `${k} = ?`).join(", ");
  return db.prepare(`UPDATE menu_items SET ${sets} WHERE id = ?`);
};
const deleteMenuItemStmt = db.prepare("DELETE FROM menu_items WHERE id = ?");

// ─── Order Helpers ────────────────────────────────────────────────────────────

const getAllOrders         = db.prepare("SELECT * FROM orders ORDER BY created_at DESC");
const getOrdersByStatus    = db.prepare("SELECT * FROM orders WHERE status = ? ORDER BY created_at DESC");
const getOrdersByUser      = db.prepare("SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC");
const getOrderByIdStmt     = db.prepare("SELECT * FROM orders WHERE id = ?");
const getOrderItems        = db.prepare("SELECT * FROM order_items WHERE order_id = ?");
const insertOrder          = db.prepare(
  "INSERT INTO orders (id, user_id, customer_name, status, total, address, notes) VALUES (?, ?, ?, 'pending', ?, ?, ?)"
);
const insertOrderItem      = db.prepare(
  "INSERT INTO order_items (order_id, item_id, name, price, quantity) VALUES (?, ?, ?, ?, ?)"
);
const updateOrderStatusStmt = db.prepare(
  "UPDATE orders SET status = ?, updated_at = datetime('now') WHERE id = ?"
);

// ─── Review Helpers ───────────────────────────────────────────────────────────

const getReviewsByItem = db.prepare("SELECT * FROM reviews WHERE item_id = ? ORDER BY created_at DESC");
const insertReview     = db.prepare(
  "INSERT INTO reviews (id, item_id, user_id, user_name, rating, comment) VALUES (?, ?, ?, ?, ?, ?)"
);
const getAvgRatingForItem = db.prepare(
  "SELECT AVG(rating) as avg_rating, COUNT(*) as review_count FROM reviews WHERE item_id = ?"
);

// ─── Exported API ─────────────────────────────────────────────────────────────

module.exports = {

  // USERS
  findUserByCredentials(email, password) {
    const user = getUserByEmail.get(email);
    if (!user || user.password !== password) return null;
    const { password: _, ...safe } = user; // strip password
    return safe;
  },
  registerUser(id, email, password, name) {
    const existing = getUserByEmail.get(email);
    if (existing) throw new Error("This email is already registered.");
    insertUser.run(id, email, password, name);
    return getUserById.get(id);
  },
  getUserById(id) {
    return getUserById.get(id) || { id, name: "Guest", email: "guest@demo.com", role: "customer" };
  },
  getAllUsers() {
    return getAllUsers.all();
  },

  // MENU
  getMenu(all = false) {
    const items = all ? getAllMenu.all() : getAvailMenu.all();
    return items.map(item => {
      const stats = getAvgRatingForItem.get(item.id);
      return {
        ...item,
        is_available: Boolean(item.is_available),
        rating: stats.avg_rating ? parseFloat(Number(stats.avg_rating).toFixed(1)) : 4.8,
        reviewCount: stats.review_count || 0,
      };
    });
  },
  addMenuItem(item) {
    const id = `m${Date.now()}`;
    insertMenuItem.run(
      id,
      item.name,
      item.description || null,
      item.category || "other",
      Number(item.price) || 0,
      item.image_url || null,
      item.is_available !== false ? 1 : 0
    );
    return getMenuItemById.get(id);
  },
  updateMenuItem(id, updates) {
    const existing = getMenuItemById.get(id);
    if (!existing) return null;
    const allowed = ["name", "description", "category", "price", "image_url", "is_available"];
    const fields = {};
    allowed.forEach(k => { if (updates[k] !== undefined) fields[k] = updates[k]; });
    if (fields.is_available !== undefined) fields.is_available = fields.is_available ? 1 : 0;
    if (Object.keys(fields).length === 0) return existing;
    const stmt = updateMenuItemStmt(fields);
    const vals = Object.values(fields);
    stmt.run(...vals, id);
    return getMenuItemById.get(id);
  },
  deleteMenuItem(id) {
    deleteMenuItemStmt.run(id);
  },

  // ORDERS
  getOrders(status) {
    const rows = (status && status !== "all")
      ? getOrdersByStatus.all(status)
      : getAllOrders.all();
    return rows.map(o => ({
      ...o,
      order_items: getOrderItems.all(o.id),
    }));
  },
  getOrdersByUserId(userId) {
    return getOrdersByUser.all(userId).map(o => ({
      ...o,
      order_items: getOrderItems.all(o.id),
    }));
  },
  getOrderById(id) {
    const o = getOrderByIdStmt.get(id);
    if (!o) return null;
    return { ...o, order_items: getOrderItems.all(o.id) };
  },
  addOrder({ id, userId, customerName, items, total, address, notes }) {
    const addOrderTx = db.transaction(() => {
      insertOrder.run(id, userId, customerName, total, address || null, notes || null);
      for (const it of items) {
        insertOrderItem.run(id, it.id || it.item_id || "unknown", it.name, Number(it.price), it.quantity);
      }
    });
    addOrderTx();
    return this.getOrderById(id);
  },
  updateOrderStatus(id, status) {
    updateOrderStatusStmt.run(status, id);
    return this.getOrderById(id);
  },

  // REVIEWS
  getReviewsForItem(itemId) {
    return getReviewsByItem.all(itemId);
  },
  addReview({ id, itemId, userId, userName, rating, comment }) {
    insertReview.run(id, itemId, userId || null, userName, rating, comment || null);
    return getReviewsByItem.all(itemId).find(r => r.id === id);
  },
};
