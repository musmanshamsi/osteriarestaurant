const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", (req, res) => {
  const orders = db.getOrders();
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

  const todayOrders = orders.filter((o) => o.created_at >= todayStart);
  const todayRevenue = todayOrders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + Number(o.total), 0);

  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const activeCount = orders.filter((o) => ["preparing", "ready"].includes(o.status)).length;

  const statusCounts = { pending: 0, preparing: 0, ready: 0, delivered: 0, cancelled: 0 };
  orders.forEach((o) => { if (statusCounts[o.status] !== undefined) statusCounts[o.status]++; });

  const itemMap = {};
  orders.forEach((order) => {
    (order.order_items ?? []).forEach((item) => {
      if (!itemMap[item.name]) itemMap[item.name] = { name: item.name, qty: 0, revenue: 0 };
      itemMap[item.name].qty += item.quantity;
      itemMap[item.name].revenue += Number(item.price) * item.quantity;
    });
  });
  const topItems = Object.values(itemMap).sort((a, b) => b.qty - a.qty).slice(0, 5);

  const dailyChart = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const key = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    dailyChart.push({ label: key, orders: 0, revenue: 0 });
  }

  res.json({
    kpis: {
      todayOrders: todayOrders.length,
      todayRevenue: parseFloat(todayRevenue.toFixed(2)),
      pendingCount,
      activeCount,
    },
    statusCounts,
    topItems,
    dailyChart, // Simplified for demo
  });
});

module.exports = router;
