const express = require("express");
const router = express.Router();
const db = require("../db");

// Simple mock middleware (class project doesn't need real JWT check anymore)
const mockAuth = (req, res, next) => {
  req.user = { id: "user-admin-001", role: "admin" }; // Default to admin for demo
  next();
};

/**
 * GET /api/menu
 */
router.get("/", (req, res) => {
  const { all } = req.query;
  const items = db.getMenu(all === "true");
  res.json({ items });
});

/**
 * POST /api/menu
 */
router.post("/", mockAuth, (req, res) => {
  const { name, description, price, category, image_url } = req.body;
  if (!name) return res.status(400).json({ error: "Name is required" });
  
  const item = db.addMenuItem({ name, description, price, category, image_url });
  res.status(201).json({ item, message: "Menu item created" });
});

/**
 * PATCH /api/menu/:id
 */
router.patch("/:id", mockAuth, (req, res) => {
  const { id } = req.params;
  const item = db.updateMenuItem(id, req.body);
  if (!item) return res.status(404).json({ error: "Menu item not found" });
  res.json({ item, message: "Menu item updated" });
});

/**
 * DELETE /api/menu/:id
 */
router.delete("/:id", mockAuth, (req, res) => {
  db.deleteMenuItem(req.params.id);
  res.json({ message: "Menu item deleted" });
});

module.exports = router;
