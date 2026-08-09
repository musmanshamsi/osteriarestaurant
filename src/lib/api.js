// ─── Frontend API Layer ────────────────────────────────────────────────────────
// Thin wrappers around store.js HTTP calls.
// Same exported names as before — no other file needs to change.

import {
  getMenuItems,
  addMenuItem,
  updateMenuItemById,
  deleteMenuItemById,
  getOrders as storeGetOrders,
  getOrdersByUserId,
  getOrderById,
  addOrder,
  updateOrderStatusById,
  addReview,
  getReviewsForItem,
  getAllUsers,
} from "./store";

// ─── Menu ─────────────────────────────────────────────────────────────────────

export async function getMenu(all = false) {
  const items = await getMenuItems({ all });
  return { items };
}

export async function createMenuItem(item) {
  const created = await addMenuItem(item);
  return { item: created };
}

export async function updateMenuItem(id, updates) {
  const item = await updateMenuItemById(id, updates);
  return { item };
}

export async function deleteMenuItem(id) {
  await deleteMenuItemById(id);
  return { message: "Deleted" };
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export async function getOrders(status) {
  const orders = await storeGetOrders({ status });
  return { orders };
}

export async function getMyOrders(userId) {
  if (!userId) return { orders: [] };
  const orders = await getOrdersByUserId(userId);
  return { orders };
}

export async function getOrder(id) {
  const order = await getOrderById(id);
  return { order };
}

export async function updateOrderStatus(id, status) {
  const order = await updateOrderStatusById(id, status);
  return { order };
}

export async function placeOrder({ userId, customerName, items, total, address, notes }) {
  const order = await addOrder({ userId, customerName, items, total, address, notes });
  return { order };
}

// ─── Receipts ─────────────────────────────────────────────────────────────────

const BASE = import.meta.env.VITE_API_URL || "/api";

export async function getReceipt(orderId) {
  const res  = await fetch(`${BASE}/receipts/${orderId}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Receipt not found");
  return data; // { receipt }
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export async function getAnalytics() {
  const res  = await fetch(`${BASE}/analytics`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Analytics failed");
  return data; // { kpis, statusCounts, topItems, dailyChart }
}

// ─── Reviews ──────────────────────────────────────────────────────────────────

export async function submitReview(reviewData) {
  const review = await addReview(reviewData);
  return { review };
}

export async function getItemReviews(itemId) {
  const reviews = await getReviewsForItem(itemId);
  return { reviews };
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function getUsers() {
  const users = await getAllUsers();
  return { users };
}
