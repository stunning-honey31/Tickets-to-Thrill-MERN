import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 't2t_cart';

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  function addItem(ticket, qty = 1) {
    setItems((prev) => {
      const existing = prev.find((i) => i.ticketId === ticket._id);
      if (existing) {
        return prev.map((i) => (i.ticketId === ticket._id ? { ...i, qty: Math.min(20, i.qty + qty) } : i));
      }
      return [...prev, { ticketId: ticket._id, name: ticket.name, price: ticket.price, qty }];
    });
  }

  function setQty(ticketId, qty) {
    setItems((prev) =>
      qty <= 0 ? prev.filter((i) => i.ticketId !== ticketId) : prev.map((i) => (i.ticketId === ticketId ? { ...i, qty } : i))
    );
  }

  function removeItem(ticketId) {
    setItems((prev) => prev.filter((i) => i.ticketId !== ticketId));
  }

  function clearCart() {
    setItems([]);
  }

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const count = items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <CartContext.Provider value={{ items, addItem, setQty, removeItem, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
