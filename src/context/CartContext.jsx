import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(undefined);

const STORAGE_KEY = "trattoria_cart_v1";

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const add = (item) => {
    setItems((prev) => {
      const found = prev.find((i) => i.id === item.id);
      if (found)
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const remove = (id) => setItems((p) => p.filter((i) => i.id !== id));
  const setQty = (id, qty) =>
    setItems((p) =>
      qty <= 0
        ? p.filter((i) => i.id !== id)
        : p.map((i) => (i.id === id ? { ...i, quantity: qty } : i)),
    );
  const clear = () => setItems([]);

  const totalCount = items.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = items.reduce((s, i) => s + i.quantity * i.price, 0);

  return (
    <CartContext.Provider
      value={{ items, add, remove, setQty, clear, totalCount, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
