// ─── Auth Routes ──────────────────────────────────────────────────────────────
const express = require("express");
const router  = express.Router();
const db      = require("../db");

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
router.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  const user = db.findUserByCredentials(email, password);
  if (!user) {
    return res.status(401).json({ error: "Invalid email or password" });
  }
  res.json({ user });
});

/**
 * POST /api/auth/register
 * Body: { email, password, name }
 */
router.post("/register", (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: "Email, password, and name are required" });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }
  try {
    const id   = `user-${Date.now()}`;
    const user = db.registerUser(id, email, password, name);
    res.status(201).json({ user });
  } catch (err) {
    res.status(409).json({ error: err.message });
  }
});

module.exports = router;
