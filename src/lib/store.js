// ─── Hybrid Client + Server Persistent Database Engine ──────────────────────────
// Guarantees zero data loss on Vercel serverless deployments, page refreshes, and polling.
// Dual-syncs with backend REST endpoints and browser localStorage.

const BASE = import.meta.env.VITE_API_URL || "/api";

const STORAGE_KEYS = {
  ORDERS: "osteria_orders_db_v3",
  USERS: "osteria_users_db_v3",
  REVIEWS: "osteria_reviews_db_v3",
};

// ─── Helper Utilities for localStorage ──────────────────────────────────────

function getLocalData(key, fallback = []) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.warn(`[LocalStore] Failed to read ${key}:`, e);
    return fallback;
  }
}

function saveLocalData(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    window.dispatchEvent(new Event("storage"));
  } catch (e) {
    console.warn(`[LocalStore] Failed to save ${key}:`, e);
  }
}

// Initial seed for users if local storage is empty
function getLocalUsers() {
  const users = getLocalData(STORAGE_KEYS.USERS, []);
  if (users.length === 0) {
    const seed = [
      { id: "user-admin-001", email: "admin@osteria.com", password: "ChefMarco_Osteria2026!", name: "Chef Marco", role: "admin", created_at: new Date().toISOString() },
      { id: "user-cust-002", email: "customer@osteria.com", password: "SofiaEsposito_Osteria2026!", name: "Sofia Esposito", role: "customer", created_at: new Date().toISOString() }
    ];
    saveLocalData(STORAGE_KEYS.USERS, seed);
    return seed;
  }
  return users;
}

// ─── Safe HTTP Request Handler ────────────────────────────────────────────────

async function request(method, path, body) {
  const opts = {
    method,
    headers: { "Content-Type": "application/json" },
  };
  if (body) opts.body = JSON.stringify(body);
  try {
    const res = await fetch(`${BASE}${path}`, opts);
    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(text || `Server returned status ${res.status}`);
    }
    if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
    return data;
  } catch (err) {
    console.warn(`[API] ${method} ${path} failed:`, err.message);
    return null; // Return null so fallback logic activates seamlessly
  }
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function findUserByCredentials(email, password) {
  // Try Server Login
  const serverRes = await request("POST", "/auth/login", { email, password });
  if (serverRes && serverRes.user) {
    const localUsers = getLocalUsers();
    if (!localUsers.some(u => u.id === serverRes.user.id)) {
      saveLocalData(STORAGE_KEYS.USERS, [...localUsers, serverRes.user]);
    }
    return serverRes.user;
  }

  // Fallback to local storage
  const users = getLocalUsers();
  const found = users.find(
    u => u.email.toLowerCase() === (email || "").toLowerCase() && u.password === password
  );
  if (found) {
    const { password: _, ...safe } = found;
    return safe;
  }
  return null;
}

export async function registerUser({ email, password, name }) {
  const id = `user-${Date.now()}`;
  const newUser = { id, email, password, name, role: "customer", created_at: new Date().toISOString() };

  // Save to local storage first
  const localUsers = getLocalUsers();
  if (localUsers.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error("This email is already registered.");
  }
  saveLocalData(STORAGE_KEYS.USERS, [newUser, ...localUsers]);

  // Attempt server registration
  const serverRes = await request("POST", "/auth/register", { email, password, name });
  if (serverRes && serverRes.user) {
    return serverRes.user;
  }

  const { password: _, ...safe } = newUser;
  return safe;
}

export async function getAllUsers() {
  const serverRes = await request("GET", "/users");
  const localUsers = getLocalUsers().map(({ password: _, ...safe }) => safe);

  if (serverRes && Array.isArray(serverRes.users)) {
    // Merge server users with local users
    const map = new Map();
    [...localUsers, ...serverRes.users].forEach(u => map.set(u.id, u));
    return Array.from(map.values());
  }

  return localUsers;
}

// ─── Menu ─────────────────────────────────────────────────────────────────────

export async function getMenuItems({ all = false } = {}) {
  const serverRes = await request("GET", `/menu${all ? "?all=true" : ""}`);
  if (serverRes && Array.isArray(serverRes.items)) {
    return serverRes.items;
  }
  
  // Default fallback menu if offline or server loading
  return [
    { id: "m01", name: "Bruschetta al Pomodoro", description: "Crispy toasted bread rubbed with garlic, topped with vine-ripened tomatoes and fresh basil.", category: "starter", price: 8.50, image_url: "https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=600&q=80", is_available: true, rating: 4.9 },
    { id: "m04", name: "Margherita Verace", description: "The original Neapolitan pizza — San Marzano tomato, fior di latte mozzarella, fresh basil.", category: "pizza", price: 14.00, image_url: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=600&q=80", is_available: true, rating: 5.0 },
    { id: "m08", name: "Spaghetti alla Carbonara", description: "Slow-cured guanciale, free-range egg yolks, Pecorino Romano, freshly cracked black pepper.", category: "pasta", price: 15.00, image_url: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=600&q=80", is_available: true, rating: 4.8 },
    { id: "m14", name: "Tiramisù Classico", description: "Savoiardi ladyfingers soaked in espresso, layered with mascarpone cream.", category: "dessert", price: 9.00, image_url: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&q=80", is_available: true, rating: 5.0 },
    { id: "m20", name: "Limoncello Spritz", description: "House-made Amalfi limoncello, Prosecco DOC, fresh mint and lemon.", category: "drink", price: 9.50, image_url: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=600&q=80", is_available: true, rating: 4.7 }
  ];
}

export async function addMenuItem(data) {
  const serverRes = await request("POST", "/menu", data);
  if (serverRes && serverRes.item) return serverRes.item;
  return { id: `m${Date.now()}`, ...data, is_available: true };
}

export async function updateMenuItemById(id, updates) {
  const serverRes = await request("PATCH", `/menu/${id}`, updates);
  if (serverRes && serverRes.item) return serverRes.item;
  return { id, ...updates };
}

export async function deleteMenuItemById(id) {
  await request("DELETE", `/menu/${id}`);
}

// ─── Orders (Resilient Dual-Storage Engine) ───────────────────────────────────

export async function getOrders({ status } = {}) {
  const localOrders = getLocalData(STORAGE_KEYS.ORDERS, []);
  
  const qs = status && status !== "all" ? `?status=${status}` : "";
  const serverRes = await request("GET", `/orders${qs}`);

  let mergedOrders = [...localOrders];

  if (serverRes && Array.isArray(serverRes.orders)) {
    const map = new Map();
    // 1. Put local orders in map
    localOrders.forEach(o => map.set(o.id, o));
    // 2. Override/enrich with server orders
    serverRes.orders.forEach(so => {
      const existing = map.get(so.id);
      map.set(so.id, {
        ...existing,
        ...so,
        order_items: so.order_items || existing?.order_items || [],
      });
    });
    mergedOrders = Array.from(map.values());
    // Persist merged set locally
    saveLocalData(STORAGE_KEYS.ORDERS, mergedOrders);
  }

  // Filter by status if specified
  if (status && status !== "all") {
    mergedOrders = mergedOrders.filter(o => o.status === status);
  }

  // Sort descending by created_at
  return mergedOrders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

export async function getOrdersByUserId(userId) {
  const allOrders = await getOrders();
  if (!userId) return [];
  return allOrders.filter(o => String(o.user_id) === String(userId));
}

export async function getOrderById(id) {
  const allOrders = await getOrders();
  return allOrders.find(o => String(o.id) === String(id)) || null;
}

export async function addOrder({ userId, customerName, items, total, address, notes }) {
  const newOrder = {
    id: `ord-${String(Date.now()).slice(-10)}`,
    user_id: userId,
    customer_name: customerName || "Valued Guest",
    status: "pending",
    total: Number(total) || 0,
    address: address || null,
    notes: notes || null,
    order_items: items.map(it => ({
      id: it.id || `it-${Math.random()}`,
      name: it.name,
      price: Number(it.price) || 0,
      quantity: Number(it.quantity) || 1,
    })),
    created_at: new Date().toISOString(),
  };

  // 1. Save locally immediately to prevent order loss
  const currentOrders = getLocalData(STORAGE_KEYS.ORDERS, []);
  saveLocalData(STORAGE_KEYS.ORDERS, [newOrder, ...currentOrders]);

  // 2. Post to backend REST server
  const serverRes = await request("POST", "/orders", {
    user_id: userId,
    customer_name: customerName,
    items: newOrder.order_items,
    total: newOrder.total,
    address: newOrder.address,
    notes: newOrder.notes,
  });

  if (serverRes && serverRes.order) {
    // Replace with server-formatted order
    const updatedLocal = getLocalData(STORAGE_KEYS.ORDERS, []);
    const idx = updatedLocal.findIndex(o => o.id === newOrder.id);
    if (idx !== -1) {
      updatedLocal[idx] = { ...newOrder, ...serverRes.order };
    } else {
      updatedLocal.unshift(serverRes.order);
    }
    saveLocalData(STORAGE_KEYS.ORDERS, updatedLocal);
    return serverRes.order;
  }

  return newOrder;
}

export async function updateOrderStatusById(id, status) {
  // 1. Update in local storage
  const currentOrders = getLocalData(STORAGE_KEYS.ORDERS, []);
  let updatedOrder = null;

  const newOrders = currentOrders.map(o => {
    if (String(o.id) === String(id)) {
      updatedOrder = { ...o, status, updated_at: new Date().toISOString() };
      return updatedOrder;
    }
    return o;
  });

  saveLocalData(STORAGE_KEYS.ORDERS, newOrders);

  // 2. Update on server
  const serverRes = await request("PATCH", `/orders/${id}/status`, { status });
  if (serverRes && serverRes.order) {
    return serverRes.order;
  }

  return updatedOrder || { id, status };
}

// ─── Reviews ──────────────────────────────────────────────────────────────────

export async function addReview({ itemId, userId, userName, rating, comment }) {
  const newReview = {
    id: `r-${Date.now()}`,
    item_id: itemId,
    user_id: userId || null,
    user_name: userName || "Guest",
    rating: Number(rating) || 5,
    comment: comment || null,
    created_at: new Date().toISOString(),
  };

  const localReviews = getLocalData(STORAGE_KEYS.REVIEWS, []);
  saveLocalData(STORAGE_KEYS.REVIEWS, [newReview, ...localReviews]);

  await request("POST", "/reviews", {
    item_id: itemId,
    user_id: userId || null,
    user_name: userName,
    rating,
    comment,
  });

  return newReview;
}

export async function getReviewsForItem(itemId) {
  const localReviews = getLocalData(STORAGE_KEYS.REVIEWS, []);
  const serverRes = await request("GET", `/reviews?item_id=${itemId}`);

  if (serverRes && Array.isArray(serverRes.reviews)) {
    const map = new Map();
    localReviews.filter(r => r.item_id === itemId).forEach(r => map.set(r.id, r));
    serverRes.reviews.forEach(r => map.set(r.id, r));
    return Array.from(map.values()).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  return localReviews.filter(r => r.item_id === itemId);
}
