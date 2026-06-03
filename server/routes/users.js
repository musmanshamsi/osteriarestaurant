// ─── Users Routes (Admin) ─────────────────────────────────────────────────────
const express = require("express");
const router  = express.Router();
const db      = require("../db");

/**
 * GET /api/users
 * Returns all users (admin only — enforce on frontend)
 */
router.get("/", (req, res) => {
  const users = db.getAllUsers();
  res.json({ users });
});

/**
 * GET /api/users/:id
 */
router.get("/:id", (req, res) => {
  const user = db.getUserById(req.params.id);
  res.json({ user });
});

module.exports = router;
