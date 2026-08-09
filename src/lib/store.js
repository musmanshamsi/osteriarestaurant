// ─── HTTP API Client ──────────────────────────────────────────────────────────
// All data now goes through the Express + SQLite backend.
// No more localStorage for application data (only session caching).

const BASE = import.meta.env.VITE_API_URL || "/api";

async function request(method, path, body) {
  const opts = {
    method,
    headers: { "Content-Type": "application/json" },
  };
  if (body) opts.body = JSON.stringify(body);
  const res  = await fetch(`${BASE}${path}`, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Request failed: ${res.status}`);
  return data;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function findUserByCredentials(email, password) {
  const { user } = await request("POST", "/auth/login", { email, password });
  return user;
}

export async function registerUser({ email, password, name }) {
  const { user } = await request("POST", "/auth/register", { email, password, name });
  return user;
}

export async function getAllUsers() {
  const { users } = await request("GET", "/users");
  return users;
}

// ─── Menu ─────────────────────────────────────────────────────────────────────

export async function getMenuItems({ all = false } = {}) {
  const { items } = await request("GET", `/menu${all ? "?all=true" : ""}`);
  return items;
}

export async function addMenuItem(data) {
  const { item } = await request("POST", "/menu", data);
  return item;
}

export async function updateMenuItemById(id, updates) {
  const { item } = await request("PATCH", `/menu/${id}`, updates);
  return item;
}

export async function deleteMenuItemById(id) {
  await request("DELETE", `/menu/${id}`);
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export async function getOrders({ status } = {}) {
  const qs = status && status !== "all" ? `?status=${status}` : "";
  const { orders } = await request("GET", `/orders${qs}`);
  return orders;
}

export async function getOrdersByUserId(userId) {
  const { orders } = await request("GET", `/orders?user_id=${userId}`);
  return orders;
}

export async function getOrderById(id) {
  const { order } = await request("GET", `/orders/${id}`);
  return order;
}

export async function addOrder({ userId, customerName, items, total, address, notes }) {
  const { order } = await request("POST", "/orders", {
    user_id:       userId,
    customer_name: customerName,
    items,
    total,
    address,
    notes,
  });
  return order;
}

export async function updateOrderStatusById(id, status) {
  const { order } = await request("PATCH", `/orders/${id}/status`, { status });
  return order;
}

// ─── Reviews ──────────────────────────────────────────────────────────────────

export async function addReview({ itemId, userId, userName, rating, comment }) {
  const { review } = await request("POST", "/reviews", {
    item_id:   itemId,
    user_id:   userId || null,
    user_name: userName,
    rating,
    comment,
  });
  return review;
}

export async function getReviewsForItem(itemId) {
  const { reviews } = await request("GET", `/reviews?item_id=${itemId}`);
  return reviews;
}
