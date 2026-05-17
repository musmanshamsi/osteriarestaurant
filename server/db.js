// ─── Server-Side In-Memory Store (replaces Supabase for the Express server) ───
// This keeps the server functional for demonstration purposes.

let _nextId = 5000;
const uid = () => String(++_nextId);

const now = new Date();
const ago = (mins) => new Date(now - mins * 60000).toISOString();

const USERS = [
  { id: "user-admin-001", email: "admin@osteria.com",    password: "ChefMarco_Osteria2026!",    name: "Chef Marco",    role: "admin" },
  { id: "user-cust-002",  email: "customer@osteria.com", password: "SofiaEsposito_Osteria2026!", name: "Sofia Esposito", role: "customer" },
];

let MENU_ITEMS = [
  { id: "m01", name: "Bruschetta al Pomodoro",  category: "starter", price: 8.50,  description: "Toasted bread with garlic and tomatoes.", is_available: true },
  { id: "m04", name: "Margherita Verace",        category: "pizza",   price: 14.00, description: "The original Neapolitan pizza.", is_available: true },
  { id: "m08", name: "Spaghetti alla Carbonara", category: "pasta",   price: 15.00, description: "Guanciale, egg yolks, Pecorino.", is_available: true },
];

let ORDERS = [
  {
    id: "ord-88880001",
    user_id: "user-cust-002",
    customer_name: "Sofia Esposito",
    status: "delivered",
    total: 37.50,
    address: "12 Olive Lane",
    order_items: [{ id: "m08", name: "Spaghetti alla Carbonara", price: 15.00, quantity: 1 }],
    created_at: ago(120),
  }
];

module.exports = {
  getMenu: (all) => all ? MENU_ITEMS : MENU_ITEMS.filter(i => i.is_available),
  addMenuItem: (item) => {
    const newItem = { id: `m${uid()}`, is_available: true, ...item };
    MENU_ITEMS.push(newItem);
    return newItem;
  },
  updateMenuItem: (id, updates) => {
    const idx = MENU_ITEMS.findIndex(i => i.id === id);
    if (idx === -1) return null;
    MENU_ITEMS[idx] = { ...MENU_ITEMS[idx], ...updates };
    return MENU_ITEMS[idx];
  },
  deleteMenuItem: (id) => {
    MENU_ITEMS = MENU_ITEMS.filter(i => i.id !== id);
  },
  
  getOrders: (status) => {
    let list = [...ORDERS].sort((a, b) => b.created_at.localeCompare(a.created_at));
    if (status && status !== "all") list = list.filter(o => o.status === status);
    return list;
  },
  getOrdersByUserId: (uid) => ORDERS.filter(o => o.user_id === uid),
  getOrderById: (id) => ORDERS.find(o => o.id === id),
  updateOrderStatus: (id, status) => {
    const idx = ORDERS.findIndex(o => o.id === id);
    if (idx === -1) return null;
    ORDERS[idx].status = status;
    ORDERS[idx].updated_at = new Date().toISOString();
    return ORDERS[idx];
  },
  
  getUserById: (id) => USERS.find(u => u.id === id) || { id, name: "Guest", email: "guest@demo.com" }
};
