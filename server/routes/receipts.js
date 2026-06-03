// ─── Receipts Routes ──────────────────────────────────────────────────────────
const express = require("express");
const router  = express.Router();
const db      = require("../db");

/**
 * GET /api/receipts/:orderId
 */
router.get("/:orderId", (req, res) => {
  const order = db.getOrderById(req.params.orderId);
  if (!order) return res.status(404).json({ error: "Order not found" });

  const user     = db.getUserById(order.user_id);
  const subtotal = order.order_items.reduce((s, i) => s + Number(i.price) * i.quantity, 0);
  const tax      = subtotal * 0.08;

  const receipt = {
    receiptNumber:     `RCP-${order.id.slice(-8).toUpperCase()}`,
    orderId:           order.id,
    restaurantName:    "Osteria Bella",
    restaurantAddress: "123 Via Roma, Foodie Quarter",
    restaurantPhone:   "+1 (555) 123-4567",
    restaurantEmail:   "hello@osteriabella.com",
    customer: {
      name:            user.name,
      email:           user.email,
      deliveryAddress: order.address || "Dine-in",
    },
    items: order.order_items.map(i => ({
      name:      i.name,
      quantity:  i.quantity,
      unitPrice: Number(i.price),
      lineTotal: Number(i.price) * i.quantity,
    })),
    subtotal:   parseFloat(subtotal.toFixed(2)),
    tax:        parseFloat(tax.toFixed(2)),
    total:      parseFloat(Number(order.total).toFixed(2)),
    status:     order.status,
    notes:      order.notes || null,
    placedAt:   order.created_at,
    printedAt:  new Date().toISOString(),
  };

  res.json({ receipt });
});

module.exports = router;
