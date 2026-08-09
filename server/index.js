const express  = require("express");
const cors     = require("cors");

// ─── Import Routes ────────────────────────────────────────────────────────────
const authRouter      = require("./routes/auth");
const menuRouter      = require("./routes/menu");
const ordersRouter    = require("./routes/orders");
const receiptsRouter  = require("./routes/receipts");
const analyticsRouter = require("./routes/analytics");
const reviewsRouter   = require("./routes/reviews");
const usersRouter     = require("./routes/users");

const app  = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Request Logger ────────────────────────────────────────────────────────────
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ─── Path Normalizer for Vercel Serverless Functions ─────────────────────────
app.use((req, _res, next) => {
  if (!req.url.startsWith("/api")) {
    req.url = "/api" + (req.url.startsWith("/") ? req.url : "/" + req.url);
  }
  next();
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/auth",      authRouter);
app.use("/api/menu",      menuRouter);
app.use("/api/orders",    ordersRouter);
app.use("/api/receipts",  receiptsRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/reviews",   reviewsRouter);
app.use("/api/users",     usersRouter);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", mode: "sqlite", timestamp: new Date().toISOString() });
});

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ─── Error Handler ────────────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error("[Server Error]", err);
  res.status(500).json({ error: "Internal server error", detail: err.message });
});

// ─── Start ────────────────────────────────────────────────────────────────────
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`\n🍕 Osteria Bella API (SQLite) running on http://localhost:${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/api/health\n`);
  });
}

module.exports = app;
