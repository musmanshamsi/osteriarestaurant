// ─── Local API (replaces fetch to Express + Supabase) ─────────────────────────
// Same exported names as the old api.js — no other file needs to change imports.

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
  const order = await addOrder({
    user_id: userId,
    customer_name: customerName,
    order_items: items,
    total,
    address,
    notes: notes || null,
  });
  return { order };
}

// ─── Receipts ─────────────────────────────────────────────────────────────────

export async function getReceipt(orderId) {
  const order = await getOrderById(orderId);
  const subtotal = order.order_items.reduce(
    (sum, i) => sum + Number(i.price) * i.quantity,
    0
  );
  const tax = subtotal * 0.08;
  const receipt = {
    receiptNumber: `RCP-${order.id.slice(-8).toUpperCase()}`,
    orderId: order.id,
    restaurantName: "Osteria Bella",
    restaurantAddress: "123 Via Roma, Foodie Quarter",
    restaurantPhone: "+1 (555) 123-4567",
    restaurantEmail: "hello@osteriabella.com",
    customer: {
      name: order.customer_name || "Valued Guest",
      email: "",
      deliveryAddress: order.address || "Dine-in",
    },
    items: order.order_items.map((i) => ({
      name: i.name,
      quantity: i.quantity,
      unitPrice: Number(i.price),
      lineTotal: Number(i.price) * i.quantity,
    })),
    subtotal: parseFloat(subtotal.toFixed(2)),
    tax: parseFloat(tax.toFixed(2)),
    total: parseFloat(Number(order.total).toFixed(2)),
    status: order.status,
    notes: order.notes || null,
    placedAt: order.created_at,
    printedAt: new Date().toISOString(),
  };
  return { receipt };
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export async function getAnalytics() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const weekStart  = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6).toISOString();

  const { orders: all } = await getOrders();
  const orders = all.filter((o) => o.created_at >= weekStart);

  const todayOrders = orders.filter((o) => o.created_at >= todayStart);
  const todayRevenue = todayOrders
    .filter((o) => o.status !== "cancelled")
    .reduce((s, o) => s + Number(o.total), 0);

  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const activeCount  = orders.filter((o) => ["preparing", "ready"].includes(o.status)).length;

  const statusCounts = { pending: 0, preparing: 0, ready: 0, delivered: 0, cancelled: 0 };
  orders.forEach((o) => { if (statusCounts[o.status] !== undefined) statusCounts[o.status]++; });

  // Top items
  const itemMap = {};
  orders.forEach((o) => {
    (o.order_items ?? []).forEach((it) => {
      if (!itemMap[it.name]) itemMap[it.name] = { name: it.name, qty: 0, revenue: 0 };
      itemMap[it.name].qty += it.quantity;
      itemMap[it.name].revenue += Number(it.price) * it.quantity;
    });
  });
  const topItems = Object.values(itemMap).sort((a, b) => b.qty - a.qty).slice(0, 5);

  // Daily chart
  const dailyMap = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const key = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    dailyMap[key] = { label: key, orders: 0, revenue: 0 };
  }
  orders.filter((o) => o.status !== "cancelled").forEach((o) => {
    const key = new Date(o.created_at).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    if (dailyMap[key]) { dailyMap[key].orders++; dailyMap[key].revenue += Number(o.total); }
  });
  const dailyChart = Object.values(dailyMap).map((d) => ({ ...d, revenue: parseFloat(d.revenue.toFixed(2)) }));

  return {
    kpis: {
      todayOrders: todayOrders.length,
      todayRevenue: parseFloat(todayRevenue.toFixed(2)),
      pendingCount,
      activeCount,
    },
    statusCounts,
    topItems,
    dailyChart,
  };
}

export async function submitReview(reviewData) {
  const review = await addReview(reviewData);
  return { review };
}
export async function getItemReviews(itemId) {
  const reviews = await getReviewsForItem(itemId);
  return { reviews };
}
export async function getUsers() {
  const users = await getAllUsers();
  return { users };
}
