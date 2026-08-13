// ─── Dual SQLite / Pure JS Database Layer ──────────────────────────────────────
// Supports local persistent SQLite and Vercel serverless pure JS fallback.

const path = require("path");
const fs   = require("fs");

let useSQLite = false;
let db = null;

const TMP_STORE_PATH = "/tmp/osteria_store.json";

// Pure JS Store (Fallback for serverless environments without native C++ bindings)
const jsStore = {
  users: [],
  menuItems: [],
  orders: [],
  orderItems: [],
  reviews: [],
};

function persistJSStore() {
  try {
    fs.writeFileSync(TMP_STORE_PATH, JSON.stringify(jsStore));
  } catch (_e) {
    // Ignore write errors if /tmp is read-only
  }
}

function seedPureJSStore() {
  try {
    if (fs.existsSync(TMP_STORE_PATH)) {
      const data = JSON.parse(fs.readFileSync(TMP_STORE_PATH, "utf8"));
      if (data && Array.isArray(data.orders)) {
        Object.assign(jsStore, data);
        return;
      }
    }
  } catch (e) {
    console.warn("⚠️ Could not load /tmp store:", e.message);
  }
  jsStore.users = [
    { id: "user-admin-001", email: "admin@osteria.com", password: "ChefMarco_Osteria2026!", name: "Chef Marco", role: "admin", created_at: new Date().toISOString() },
    { id: "user-cust-002", email: "customer@osteria.com", password: "SofiaEsposito_Osteria2026!", name: "Sofia Esposito", role: "customer", created_at: new Date().toISOString() }
  ];

  jsStore.menuItems = [
    { id: "m01", name: "Bruschetta al Pomodoro", description: "Crispy toasted bread rubbed with garlic, topped with vine-ripened tomatoes and fresh basil.", category: "starter", price: 8.50, image_url: "https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=600&q=80", is_available: true, created_at: new Date().toISOString() },
    { id: "m04", name: "Margherita Verace", description: "The original Neapolitan pizza — San Marzano tomato, fior di latte mozzarella, fresh basil.", category: "pizza", price: 14.00, image_url: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=600&q=80", is_available: true, created_at: new Date().toISOString() },
    { id: "m08", name: "Spaghetti alla Carbonara", description: "Slow-cured guanciale, free-range egg yolks, Pecorino Romano, freshly cracked black pepper.", category: "pasta", price: 15.00, image_url: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=600&q=80", is_available: true, created_at: new Date().toISOString() },
    { id: "m14", name: "Tiramisù Classico", description: "Savoiardi ladyfingers soaked in espresso, layered with mascarpone cream.", category: "dessert", price: 9.00, image_url: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&q=80", is_available: true, created_at: new Date().toISOString() },
    { id: "m20", name: "Limoncello Spritz", description: "House-made Amalfi limoncello, Prosecco DOC, fresh mint and lemon.", category: "drink", price: 9.50, image_url: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=600&q=80", is_available: true, created_at: new Date().toISOString() },
    { id: "m21", name: "Penne all'Arrabbiata", description: "Penne pasta in a spicy tomato sauce with garlic, chilli, and fresh parsley.", category: "pasta", price: 13.00, image_url: "https://images.unsplash.com/photo-1608219992759-8d74ed8d76eb?w=600&q=80", is_available: true, created_at: new Date().toISOString() },
    { id: "m22", name: "Caprese Salad", description: "Buffalo mozzarella, heirloom tomatoes, fresh basil, drizzled with extra-virgin olive oil.", category: "starter", price: 11.50, image_url: "https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5?w=600&q=80", is_available: true, created_at: new Date().toISOString() },
    { id: "m23", name: "Panna Cotta", description: "Silky vanilla panna cotta with a wild berry coulis.", category: "dessert", price: 8.00, image_url: "https://images.unsplash.com/photo-1488477181040-b3f4a94e40ab?w=600&q=80", is_available: true, created_at: new Date().toISOString() },
    { id: "m24", name: "Acqua Minerale", description: "Still or sparkling mineral water.", category: "drink", price: 3.50, image_url: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=600&q=80", is_available: true, created_at: new Date().toISOString() },
    { id: "m25", name: "Pizza Diavola", description: "Spicy Italian salami, San Marzano tomato, fior di latte, fresh chilli.", category: "pizza", price: 16.00, image_url: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80", is_available: true, created_at: new Date().toISOString() }
  ];

  jsStore.reviews = [
    { id: "r-001", item_id: "m04", user_id: "user-cust-002", user_name: "Sofia Esposito", rating: 5, comment: "Authentic Neapolitan taste! Absolutely loved it.", created_at: new Date().toISOString() },
    { id: "r-002", item_id: "m08", user_id: "user-cust-002", user_name: "Sofia Esposito", rating: 4, comment: "Very good carbonara, but could use more pepper!", created_at: new Date().toISOString() },
    { id: "r-003", item_id: "m01", user_id: null, user_name: "Marco P.", rating: 5, comment: "Perfect starter. The tomatoes are so fresh.", created_at: new Date().toISOString() },
    { id: "r-004", item_id: "m14", user_id: null, user_name: "Elena G.", rating: 5, comment: "Best tiramisu outside of Rome!", created_at: new Date().toISOString() }
  ];
}

try {
  if (process.env.VERCEL) {
    throw new Error("Using pure JS store on Vercel serverless");
  }
  const pkg = "better-sqlite3";
  const Database = require(pkg);
  const DB_PATH = path.join(__dirname, "osteria.db");
  db = new Database(DB_PATH);
  try { db.pragma("journal_mode = WAL"); } catch (_) { /* WAL mode optional */ }
  db.pragma("foreign_keys = ON");

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

  const countUsers = db.prepare("SELECT COUNT(*) as cnt FROM users").get();
  if (countUsers.cnt === 0) {
    const insertU = db.prepare("INSERT INTO users (id, email, password, name, role) VALUES (?, ?, ?, ?, ?)");
    insertU.run("user-admin-001", "admin@osteria.com", "ChefMarco_Osteria2026!", "Chef Marco", "admin");
    insertU.run("user-cust-002", "customer@osteria.com", "SofiaEsposito_Osteria2026!", "Sofia Esposito", "customer");
  }

  const countMenu = db.prepare("SELECT COUNT(*) as cnt FROM menu_items").get();
  if (countMenu.cnt === 0) {
    const insertM = db.prepare("INSERT INTO menu_items (id, name, description, category, price, image_url, is_available) VALUES (?, ?, ?, ?, ?, ?, 1)");
    insertM.run("m01", "Bruschetta al Pomodoro",  "Crispy toasted bread rubbed with garlic, topped with vine-ripened tomatoes and fresh basil.", "starter", 8.50,  "https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=600&q=80");
    insertM.run("m04", "Margherita Verace",        "The original Neapolitan pizza — San Marzano tomato, fior di latte mozzarella, fresh basil.", "pizza",   14.00, "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=600&q=80");
    insertM.run("m08", "Spaghetti alla Carbonara", "Slow-cured guanciale, free-range egg yolks, Pecorino Romano, freshly cracked black pepper.", "pasta",   15.00, "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=600&q=80");
    insertM.run("m14", "Tiramisù Classico",        "Savoiardi ladyfingers soaked in espresso, layered with mascarpone cream.",                   "dessert", 9.00,  "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&q=80");
    insertM.run("m20", "Limoncello Spritz",        "House-made Amalfi limoncello, Prosecco DOC, fresh mint and lemon.",                          "drink",   9.50,  "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=600&q=80");
    insertM.run("m21", "Penne all'Arrabbiata",      "Penne pasta in a spicy tomato sauce with garlic, chilli, and fresh parsley.",                "pasta",   13.00, "https://images.unsplash.com/photo-1608219992759-8d74ed8d76eb?w=600&q=80");
    insertM.run("m22", "Caprese Salad",             "Buffalo mozzarella, heirloom tomatoes, fresh basil, drizzled with extra-virgin olive oil.",  "starter", 11.50, "https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5?w=600&q=80");
    insertM.run("m23", "Panna Cotta",               "Silky vanilla panna cotta with a wild berry coulis.",                                        "dessert", 8.00,  "https://images.unsplash.com/photo-1488477181040-b3f4a94e40ab?w=600&q=80");
    insertM.run("m24", "Acqua Minerale",            "Still or sparkling mineral water.",                                                          "drink",   3.50,  "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=600&q=80");
    insertM.run("m25", "Pizza Diavola",             "Spicy Italian salami, San Marzano tomato, fior di latte, fresh chilli.",                     "pizza",   16.00, "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80");
  }

  const countRev = db.prepare("SELECT COUNT(*) as cnt FROM reviews").get();
  if (countRev.cnt === 0) {
    const insertR = db.prepare("INSERT INTO reviews (id, item_id, user_id, user_name, rating, comment) VALUES (?, ?, ?, ?, ?, ?)");
    insertR.run("r-001", "m04", "user-cust-002", "Sofia Esposito", 5, "Authentic Neapolitan taste! Absolutely loved it.");
    insertR.run("r-002", "m08", "user-cust-002", "Sofia Esposito", 4, "Very good carbonara, but could use more pepper!");
    insertR.run("r-003", "m01", null,            "Marco P.",        5, "Perfect starter. The tomatoes are so fresh.");
    insertR.run("r-004", "m14", null,            "Elena G.",        5, "Best tiramisu outside of Rome!");
  }

  useSQLite = true;
  console.log("✅ SQLite database ready:", DB_PATH);
} catch (err) {
  console.warn("⚠️ better-sqlite3 unavailable. Falling back to pure JS memory database:", err.message);
  useSQLite = false;
  seedPureJSStore();
}

module.exports = {
  // USERS
  findUserByCredentials(email, password) {
    if (useSQLite) {
      const user = db.prepare("SELECT * FROM users WHERE LOWER(email) = LOWER(?)").get(email);
      if (!user || user.password !== password) return null;
      const { password: _, ...safe } = user;
      return safe;
    }
    const user = jsStore.users.find(u => u.email.toLowerCase() === (email || "").toLowerCase());
    if (!user || user.password !== password) return null;
    const { password: _, ...safe } = user;
    return safe;
  },

  registerUser(id, email, password, name) {
    if (useSQLite) {
      const existing = db.prepare("SELECT * FROM users WHERE LOWER(email) = LOWER(?)").get(email);
      if (existing) throw new Error("This email is already registered.");
      db.prepare("INSERT INTO users (id, email, password, name, role) VALUES (?, ?, ?, ?, 'customer')").run(id, email, password, name);
      return db.prepare("SELECT id, email, name, role, created_at FROM users WHERE id = ?").get(id);
    }
    const existing = jsStore.users.find(u => u.email.toLowerCase() === (email || "").toLowerCase());
    if (existing) throw new Error("This email is already registered.");
    const newUser = { id, email, password, name, role: "customer", created_at: new Date().toISOString() };
    jsStore.users.push(newUser);
    const { password: _, ...safe } = newUser;
    return safe;
  },

  getUserById(id) {
    if (useSQLite) {
      return db.prepare("SELECT id, email, name, role, created_at FROM users WHERE id = ?").get(id) || { id, name: "Guest", email: "guest@demo.com", role: "customer" };
    }
    const u = jsStore.users.find(x => x.id === id);
    if (!u) return { id, name: "Guest", email: "guest@demo.com", role: "customer" };
    const { password: _, ...safe } = u;
    return safe;
  },

  getAllUsers() {
    if (useSQLite) {
      return db.prepare("SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC").all();
    }
    return jsStore.users.map(({ password, ...safe }) => safe);
  },

  // MENU
  getMenu(all = false) {
    if (useSQLite) {
      const getAllMenu = db.prepare("SELECT * FROM menu_items ORDER BY category, name");
      const getAvailMenu = db.prepare("SELECT * FROM menu_items WHERE is_available = 1 ORDER BY category, name");
      const getAvgRating = db.prepare("SELECT AVG(rating) as avg_rating, COUNT(*) as review_count FROM reviews WHERE item_id = ?");
      const items = all ? getAllMenu.all() : getAvailMenu.all();
      return items.map(item => {
        const stats = getAvgRating.get(item.id);
        return {
          ...item,
          is_available: Boolean(item.is_available),
          rating: stats.avg_rating ? parseFloat(Number(stats.avg_rating).toFixed(1)) : 4.8,
          reviewCount: stats.review_count || 0,
        };
      });
    }
    const items = all ? jsStore.menuItems : jsStore.menuItems.filter(i => i.is_available);
    return items.map(item => {
      const revs = jsStore.reviews.filter(r => r.item_id === item.id);
      const avg = revs.length ? revs.reduce((s, r) => s + r.rating, 0) / revs.length : 4.8;
      return {
        ...item,
        is_available: Boolean(item.is_available),
        rating: parseFloat(avg.toFixed(1)),
        reviewCount: revs.length,
      };
    });
  },

  addMenuItem(item) {
    const id = `m${Date.now()}`;
    if (useSQLite) {
      db.prepare("INSERT INTO menu_items (id, name, description, category, price, image_url, is_available) VALUES (?, ?, ?, ?, ?, ?, ?)").run(
        id, item.name, item.description || null, item.category || "other", Number(item.price) || 0, item.image_url || null, item.is_available !== false ? 1 : 0
      );
      return db.prepare("SELECT * FROM menu_items WHERE id = ?").get(id);
    }
    const newItem = {
      id,
      name: item.name,
      description: item.description || null,
      category: item.category || "other",
      price: Number(item.price) || 0,
      image_url: item.image_url || null,
      is_available: item.is_available !== false,
      created_at: new Date().toISOString()
    };
    jsStore.menuItems.push(newItem);
    return newItem;
  },

  updateMenuItem(id, updates) {
    if (useSQLite) {
      const existing = db.prepare("SELECT * FROM menu_items WHERE id = ?").get(id);
      if (!existing) return null;
      const allowed = ["name", "description", "category", "price", "image_url", "is_available"];
      const fields = {};
      allowed.forEach(k => { if (updates[k] !== undefined) fields[k] = updates[k]; });
      if (fields.is_available !== undefined) fields.is_available = fields.is_available ? 1 : 0;
      if (Object.keys(fields).length === 0) return existing;
      const sets = Object.keys(fields).map(k => `${k} = ?`).join(", ");
      db.prepare(`UPDATE menu_items SET ${sets} WHERE id = ?`).run(...Object.values(fields), id);
      return db.prepare("SELECT * FROM menu_items WHERE id = ?").get(id);
    }
    const item = jsStore.menuItems.find(i => i.id === id);
    if (!item) return null;
    Object.assign(item, updates);
    return item;
  },

  deleteMenuItem(id) {
    if (useSQLite) {
      db.prepare("DELETE FROM menu_items WHERE id = ?").run(id);
    } else {
      jsStore.menuItems = jsStore.menuItems.filter(i => i.id !== id);
    }
  },

  // ORDERS
  getOrders(status) {
    if (useSQLite) {
      const rows = (status && status !== "all")
        ? db.prepare("SELECT * FROM orders WHERE status = ? ORDER BY created_at DESC").all(status)
        : db.prepare("SELECT * FROM orders ORDER BY created_at DESC").all();
      return rows.map(o => ({
        ...o,
        order_items: db.prepare("SELECT * FROM order_items WHERE order_id = ?").all(o.id)
      }));
    }
    let rows = jsStore.orders;
    if (status && status !== "all") rows = rows.filter(o => o.status === status);
    return rows.map(o => ({
      ...o,
      order_items: jsStore.orderItems.filter(it => it.order_id === o.id)
    }));
  },

  getOrdersByUserId(userId) {
    if (useSQLite) {
      return db.prepare("SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC").all(userId).map(o => ({
        ...o,
        order_items: db.prepare("SELECT * FROM order_items WHERE order_id = ?").all(o.id)
      }));
    }
    return jsStore.orders.filter(o => o.user_id === userId).map(o => ({
      ...o,
      order_items: jsStore.orderItems.filter(it => it.order_id === o.id)
    }));
  },

  getOrderById(id) {
    if (useSQLite) {
      const o = db.prepare("SELECT * FROM orders WHERE id = ?").get(id);
      if (!o) return null;
      return { ...o, order_items: db.prepare("SELECT * FROM order_items WHERE order_id = ?").all(o.id) };
    }
    const o = jsStore.orders.find(x => x.id === id);
    if (!o) return null;
    return { ...o, order_items: jsStore.orderItems.filter(it => it.order_id === id) };
  },

  addOrder({ id, userId, customerName, items, total, address, notes }) {
    if (useSQLite) {
      const userExists = db.prepare("SELECT id FROM users WHERE id = ?").get(userId);
      if (!userExists) {
        db.prepare("INSERT OR IGNORE INTO users (id, email, password, name, role) VALUES (?, ?, 'password', ?, 'customer')").run(
          userId, `${userId}@customer.local`, customerName || "Guest"
        );
      }
      const addOrderTx = db.transaction(() => {
        db.prepare("INSERT INTO orders (id, user_id, customer_name, status, total, address, notes) VALUES (?, ?, ?, 'pending', ?, ?, ?)").run(id, userId, customerName || "Guest", Number(total) || 0, address || null, notes || null);
        for (const it of items) {
          db.prepare("INSERT INTO order_items (order_id, item_id, name, price, quantity) VALUES (?, ?, ?, ?, ?)").run(id, it.id || it.item_id || "unknown", it.name, Number(it.price) || 0, Number(it.quantity) || 1);
        }
      });
      addOrderTx();
      return this.getOrderById(id);
    }
    const newOrder = {
      id,
      user_id: userId,
      customer_name: customerName || "Guest",
      status: "pending",
      total: Number(total) || 0,
      address: address || null,
      notes: notes || null,
      created_at: new Date().toISOString()
    };
    jsStore.orders.unshift(newOrder);
    (items || []).forEach(it => {
      jsStore.orderItems.push({
        id: Date.now() + Math.random(),
        order_id: id,
        item_id: it.id || it.item_id || "unknown",
        name: it.name,
        price: Number(it.price) || 0,
        quantity: Number(it.quantity) || 1
      });
    });
    persistJSStore();
    return this.getOrderById(id);
  },

  updateOrderStatus(id, status) {
    if (useSQLite) {
      db.prepare("UPDATE orders SET status = ?, updated_at = datetime('now') WHERE id = ?").run(status, id);
      return this.getOrderById(id);
    }
    const o = jsStore.orders.find(x => x.id === id);
    if (!o) return null;
    o.status = status;
    o.updated_at = new Date().toISOString();
    persistJSStore();
    return this.getOrderById(id);
  },

  // REVIEWS
  getReviewsForItem(itemId) {
    if (useSQLite) {
      return db.prepare("SELECT * FROM reviews WHERE item_id = ? ORDER BY created_at DESC").all(itemId);
    }
    return jsStore.reviews.filter(r => r.item_id === itemId);
  },

  addReview({ id, itemId, userId, userName, rating, comment }) {
    if (useSQLite) {
      db.prepare("INSERT INTO reviews (id, item_id, user_id, user_name, rating, comment) VALUES (?, ?, ?, ?, ?, ?)").run(id, itemId, userId || null, userName, rating, comment || null);
      return this.getReviewsForItem(itemId).find(r => r.id === id);
    }
    const newRev = {
      id,
      item_id: itemId,
      user_id: userId || null,
      user_name: userName,
      rating: Number(rating),
      comment: comment || null,
      created_at: new Date().toISOString()
    };
    jsStore.reviews.unshift(newRev);
    return newRev;
  }
};
