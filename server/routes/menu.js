// ─── Menu Routes ──────────────────────────────────────────────────────────────
const express = require("express");
const router  = express.Router();
const db      = require("../db");

/**
 * GET /api/menu
 * Query: ?all=true  →  include unavailable items (admin)
 */
router.get("/", (req, res) => {
  const all   = req.query.all === "true";
  const items = db.getMenu(all);
  res.json({ items });
});

/**
 * POST /api/menu
 * Body: { name, description, price, category, image_url, is_available? }
 */
router.post("/", (req, res) => {
  const { name, description, price, category, image_url, is_available } = req.body;
  if (!name || !price || !category) {
    return res.status(400).json({ error: "name, price, and category are required" });
  }
  const item = db.addMenuItem({ name, description, price, category, image_url, is_available });
  res.status(201).json({ item, message: "Menu item created" });
});

/**
 * PATCH /api/menu/:id
 * Body: any subset of { name, description, price, category, image_url, is_available }
 */
router.patch("/:id", (req, res) => {
  const item = db.updateMenuItem(req.params.id, req.body);
  if (!item) return res.status(404).json({ error: "Menu item not found" });
  res.json({ item, message: "Menu item updated" });
});

/**
 * DELETE /api/menu/:id
 */
router.delete("/:id", (req, res) => {
  db.deleteMenuItem(req.params.id);
  res.json({ message: "Menu item deleted" });
});

module.exports = router;
