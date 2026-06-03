// ─── Analytics Routes ─────────────────────────────────────────────────────────
const express = require("express");
const router  = express.Router();
const db      = require("../db");

/**
 * GET /api/analytics
 */
router.get("/", (req, res) => {
  const now        = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const weekStart  = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6).toISOString();

  const allOrders  = db.getOrders();
  const weekOrders = allOrders.filter(o => o.created_at >= weekStart);

  const todayOrders  = weekOrders.filter(o => o.created_at >= todayStart);
  const todayRevenue = todayOrders
    .filter(o => o.status !== "cancelled")
    .reduce((s, o) => s + Number(o.total), 0);

  const pendingCount = weekOrders.filter(o => o.status === "pending").length;
  const activeCount  = weekOrders.filter(o => ["preparing", "ready"].includes(o.status)).length;

  const statusCounts = { pending: 0, preparing: 0, ready: 0, delivered: 0, cancelled: 0 };
  allOrders.forEach(o => { if (statusCounts[o.status] !== undefined) statusCounts[o.status]++; });

  // Top items (all time)
  const itemMap = {};
  allOrders.forEach(o => {
    (o.order_items ?? []).forEach(it => {
      if (!itemMap[it.name]) itemMap[it.name] = { name: it.name, qty: 0, revenue: 0 };
      itemMap[it.name].qty     += it.quantity;
      itemMap[it.name].revenue += Number(it.price) * it.quantity;
    });
  });
  const topItems = Object.values(itemMap).sort((a, b) => b.qty - a.qty).slice(0, 5);

  // Daily chart (last 7 days)
  const dailyMap = {};
  for (let i = 6; i >= 0; i--) {
    const d   = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const key = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    dailyMap[key] = { label: key, orders: 0, revenue: 0 };
  }
  weekOrders.filter(o => o.status !== "cancelled").forEach(o => {
    const key = new Date(o.created_at).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    if (dailyMap[key]) {
      dailyMap[key].orders++;
      dailyMap[key].revenue += Number(o.total);
    }
  });
  const dailyChart = Object.values(dailyMap).map(d => ({
    ...d,
    revenue: parseFloat(d.revenue.toFixed(2)),
  }));

  // Total customers
  const totalCustomers = db.getAllUsers().filter(u => u.role === "customer").length;

  res.json({
    kpis: {
      todayOrders:     todayOrders.length,
      todayRevenue:    parseFloat(todayRevenue.toFixed(2)),
      pendingCount,
      activeCount,
      totalCustomers,
      totalOrders:     allOrders.length,
    },
    statusCounts,
    topItems,
    dailyChart,
  });
});

module.exports = router;
