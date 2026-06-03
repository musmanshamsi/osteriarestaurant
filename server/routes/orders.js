// ─── Orders Routes ────────────────────────────────────────────────────────────
const express = require("express");
const router  = express.Router();
const db      = require("../db");

/**
 * GET /api/orders
 * Query: ?status=pending|preparing|ready|delivered|cancelled|all
 * Query: ?user_id=<id>  →  filter by customer
 */
router.get("/", (req, res) => {
  const { status, user_id } = req.query;
  let orders;
  if (user_id) {
    orders = db.getOrdersByUserId(user_id);
  } else {
    orders = db.getOrders(status);
  }
  // Enrich with customer name from users table
  const enriched = orders.map(o => {
    const user = db.getUserById(o.user_id);
    return { ...o, customer_name: o.customer_name || user.name };
  });
  res.json({ orders: enriched, total: enriched.length });
});

/**
 * GET /api/orders/mine
 * Query: ?user_id=<id>
 */
router.get("/mine", (req, res) => {
  const { user_id } = req.query;
  if (!user_id) return res.json({ orders: [] });
  const orders = db.getOrdersByUserId(user_id);
  res.json({ orders });
});

/**
 * GET /api/orders/:id
 */
router.get("/:id", (req, res) => {
  const order = db.getOrderById(req.params.id);
  if (!order) return res.status(404).json({ error: "Order not found" });
  res.json({ order });
});

/**
 * POST /api/orders
 * Body: { user_id, customer_name, items: [{id,name,price,quantity}], total, address?, notes? }
 */
router.post("/", (req, res) => {
  const { user_id, customer_name, items, total, address, notes } = req.body;
  if (!user_id || !items || !total) {
    return res.status(400).json({ error: "user_id, items, and total are required" });
  }
  const id    = `ord-${String(Date.now()).slice(-10)}`;
  const order = db.addOrder({ id, userId: user_id, customerName: customer_name || "Guest", items, total, address, notes });
  res.status(201).json({ order, message: "Order placed successfully" });
});

/**
 * PATCH /api/orders/:id/status
 * Body: { status }
 */
router.patch("/:id/status", (req, res) => {
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: "status is required" });
  const order = db.updateOrderStatus(req.params.id, status);
  if (!order) return res.status(404).json({ error: "Order not found" });
  res.json({ order, message: `Order status updated to "${status}"` });
});

module.exports = router;
