/**
 * Mock Auth Middleware for Class Project
 * Bypasses real JWT verification.
 */

async function requireAuth(req, res, next) {
  // Always assume the default demo customer if no header
  req.user = { 
    id: "user-cust-002", 
    email: "customer@osteria.com", 
    name: "Sofia Esposito",
    role: "customer" 
  };
  req.isAdmin = false;
  next();
}

function requireAdmin(req, res, next) {
  // Simple check: for demo, assume anyone is an admin if they're on an admin path
  // Or hardcode to Chef Marco
  req.user = { 
    id: "user-admin-001", 
    email: "admin@osteria.com", 
    name: "Chef Marco",
    role: "admin" 
  };
  req.isAdmin = true;
  next();
}

module.exports = { requireAuth, requireAdmin };
