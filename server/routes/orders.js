const express = require("express");
const router = express.Router();
const db = require("../db");

const mockAuth = (req, res, next) => {
  req.user = { id: "user-cust-002", role: "customer" }; 
  next();
};

/**
 * GET /api/orders
 */
router.get("/", mockAuth, (req, res) => {
  const { status } = req.query;
  const orders = db.getOrders(status);
  
  // Enrich with customer names
  const enriched = orders.map(o => {
    const user = db.getUserById(o.user_id);
    return { ...o, customer_name: user.name };
  });
  
  res.json({ orders: enriched, total: enriched.length });
});

/**
 * GET /api/orders/mine
 */
router.get("/mine", mockAuth, (req, res) => {
  const orders = db.getOrdersByUserId(req.user.id);
  res.json({ orders });
});

/**
 * PATCH /api/orders/:id/status
 */
router.patch("/:id/status", mockAuth, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  const order = db.updateOrderStatus(id, status);
  if (!order) return res.status(404).json({ error: "Order not found" });
  
  res.json({ order, message: `Order status updated to "${status}"` });
});

module.exports = router;
