// ─── Local Data Persistence (replaces Supabase DB with localStorage) ─────────

const STORAGE_KEY_MENU    = "osteria_menu";
const STORAGE_KEY_ORDERS  = "osteria_orders";
const STORAGE_KEY_USERS   = "osteria_users";
const STORAGE_KEY_REVIEWS = "osteria_reviews";

// ─── Default Seed Data ────────────────────────────────────────────────────────
const DEFAULT_MENU = [
  { id: "m01", name: "Bruschetta al Pomodoro",  category: "starter", price: 8.50,  description: "Crispy toasted bread rubbed with garlic, topped with vine-ripened tomatoes and fresh basil.", image_url: "https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=600&q=80", is_available: true },
  { id: "m04", name: "Margherita Verace",        category: "pizza",   price: 14.00, description: "The original Neapolitan pizza — San Marzano tomato, fior di latte mozzarella, fresh basil.", image_url: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=600&q=80", is_available: true },
  { id: "m08", name: "Spaghetti alla Carbonara", category: "pasta",   price: 15.00, description: "Slow-cured guanciale, free-range egg yolks, Pecorino Romano, freshly cracked black pepper.", image_url: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=600&q=80", is_available: true },
  { id: "m14", name: "Tiramisù Classico",        category: "dessert", price: 9.00,  description: "Savoiardi ladyfingers soaked in espresso, layered with mascarpone cream.", image_url: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&q=80", is_available: true },
  { id: "m20", name: "Limoncello Spritz",        category: "drink",   price: 9.50,  description: "House-made Amalfi limoncello, Prosecco DOC, fresh mint and lemon.", image_url: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=600&q=80", is_available: true },
];

const DEFAULT_REVIEWS = [
  { id: "r1", item_id: "m04", user_name: "Marco P.", rating: 5, comment: "Authentic Neapolitan taste!", created_at: new Date().toISOString() },
  { id: "r2", item_id: "m08", user_name: "Elena G.", rating: 4, comment: "Very good, but more pepper please.", created_at: new Date().toISOString() },
];

const DEFAULT_USERS = [
  { id: "user-admin-001", email: "admin@osteria.com",    password: "ChefMarco_Osteria2026!",    name: "Chef Marco",    role: "admin" },
  { id: "user-cust-002",  email: "customer@osteria.com", password: "SofiaEsposito_Osteria2026!", name: "Sofia Esposito", role: "customer" },
];

// ─── Helper Functions ─────────────────────────────────────────────────────────

const load = (key, fallback) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : fallback;
};

const save = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// ─── State ────────────────────────────────────────────────────────────────────

let MENU_ITEMS = load(STORAGE_KEY_MENU, DEFAULT_MENU);
let ORDERS     = load(STORAGE_KEY_ORDERS, []); 
let USERS      = load(STORAGE_KEY_USERS, DEFAULT_USERS);
let REVIEWS    = load(STORAGE_KEY_REVIEWS, DEFAULT_REVIEWS);

// Migration: if anyone still has the compromised default passwords in localStorage, update them
if (USERS.some(u => u.password === "admin123" || u.password === "customer123")) {
  USERS = USERS.map(u => {
    if (u.id === "user-admin-001" && u.password === "admin123") {
      return { ...u, password: "ChefMarco_Osteria2026!" };
    }
    if (u.id === "user-cust-002" && u.password === "customer123") {
      return { ...u, password: "SofiaEsposito_Osteria2026!" };
    }
    return u;
  });
  save(STORAGE_KEY_USERS, USERS);
}

// ─── MENU CRUD ────────────────────────────────────────────────────────────────

export async function getMenuItems({ all = false } = {}) {
  await tick();
  const base = all ? [...MENU_ITEMS] : MENU_ITEMS.filter((i) => i.is_available);
  
  // Attach real stats from REVIEWS
  return base.map(item => {
    const itemReviews = REVIEWS.filter(r => r.item_id === item.id);
    const avgRating = itemReviews.length > 0 
      ? itemReviews.reduce((s, r) => s + r.rating, 0) / itemReviews.length
      : 4.8; // High fallback for demo appeal
    return {
      ...item,
      rating: parseFloat(avgRating.toFixed(1)),
      reviewCount: itemReviews.length || Math.floor(Math.random() * 20) + 10 // Mix of real + demo padding
    };
  });
}

export async function addMenuItem(data) {
  await tick();
  const item = { id: `m${Date.now()}`, is_available: true, ...data };
  MENU_ITEMS.push(item);
  save(STORAGE_KEY_MENU, MENU_ITEMS);
  return item;
}

export async function updateMenuItemById(id, updates) {
  await tick();
  const idx = MENU_ITEMS.findIndex((i) => i.id === id);
  if (idx === -1) throw new Error("Menu item not found");
  MENU_ITEMS[idx] = { ...MENU_ITEMS[idx], ...updates };
  save(STORAGE_KEY_MENU, MENU_ITEMS);
  return MENU_ITEMS[idx];
}

export async function deleteMenuItemById(id) {
  await tick();
  MENU_ITEMS = MENU_ITEMS.filter((i) => i.id !== id);
  save(STORAGE_KEY_MENU, MENU_ITEMS);
}

// ─── ORDER CRUD ───────────────────────────────────────────────────────────────

export async function getOrders({ status } = {}) {
  await tick();
  let list = [...ORDERS].sort((a, b) => b.created_at.localeCompare(a.created_at));
  if (status && status !== "all") list = list.filter((o) => o.status === status);
  return list;
}

export async function getOrdersByUserId(userId) {
  await tick();
  return [...ORDERS]
    .filter((o) => o.user_id === userId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function getOrderById(id) {
  await tick();
  const o = ORDERS.find((o) => o.id === id);
  if (!o) throw new Error("Order not found");
  return o;
}

export async function addOrder(data) {
  await tick();
  const order = {
    id: `ord-${String(Date.now()).slice(-8)}`,
    created_at: new Date().toISOString(),
    status: "pending",
    ...data,
  };
  ORDERS.unshift(order);
  save(STORAGE_KEY_ORDERS, ORDERS);
  return order;
}

export async function updateOrderStatusById(id, status) {
  await tick();
  const idx = ORDERS.findIndex((o) => o.id === id);
  if (idx === -1) throw new Error("Order not found");
  ORDERS[idx] = { ...ORDERS[idx], status };
  save(STORAGE_KEY_ORDERS, ORDERS);
  return ORDERS[idx];
}

// ─── USER AUTH ────────────────────────────────────────────────────────────────

export async function findUserByCredentials(email, password) {
  await tick();
  return USERS.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  ) ?? null;
}

export async function registerUser({ email, password, name }) {
  await tick();
  if (USERS.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error("This email is already registered. Try signing in.");
  }
  const user = { id: `user-${Date.now()}`, email, password, name, role: "customer" };
  USERS.push(user);
  save(STORAGE_KEY_USERS, USERS);
  return user;
}

export async function getAllUsers() {
  await tick();
  return USERS;
}

// ─── REVIEWS ──────────────────────────────────────────────────────────────────
export async function addReview({ itemId, userName, rating, comment }) {
  await tick();
  const review = {
    id: `r${Date.now()}`,
    item_id: itemId,
    user_name: userName,
    rating,
    comment,
    created_at: new Date().toISOString(),
  };
  REVIEWS.push(review);
  save(STORAGE_KEY_REVIEWS, REVIEWS);
  return review;
}

export async function getReviewsForItem(itemId) {
  await tick();
  return REVIEWS.filter(r => r.item_id === itemId).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

// ─── Utility ──────────────────────────────────────────────────────────────────
function tick() {
  return new Promise((r) => setTimeout(r, 40));
}
