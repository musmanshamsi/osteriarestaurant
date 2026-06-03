// ─── Reviews Routes ───────────────────────────────────────────────────────────
const express = require("express");
const router  = express.Router();
const db      = require("../db");

/**
 * GET /api/reviews?item_id=<id>
 */
router.get("/", (req, res) => {
  const { item_id } = req.query;
  if (!item_id) return res.status(400).json({ error: "item_id query param is required" });
  const reviews = db.getReviewsForItem(item_id);
  res.json({ reviews });
});

/**
 * POST /api/reviews
 * Body: { item_id, user_id?, user_name, rating, comment }
 */
router.post("/", (req, res) => {
  const { item_id, user_id, user_name, rating, comment } = req.body;
  if (!item_id || !user_name || !rating) {
    return res.status(400).json({ error: "item_id, user_name, and rating are required" });
  }
  const ratingNum = Number(rating);
  if (ratingNum < 1 || ratingNum > 5) {
    return res.status(400).json({ error: "Rating must be between 1 and 5" });
  }
  try {
    const review = db.addReview({
      id: `r-${Date.now()}`,
      itemId: item_id,
      userId: user_id || null,
      userName: user_name,
      rating: ratingNum,
      comment: comment || null,
    });
    res.status(201).json({ review, message: "Review submitted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
