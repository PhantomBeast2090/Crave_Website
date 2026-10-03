"use client";
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { CartLine } from "@/lib/domain/types";

interface AppState {
  cart: CartLine[];
  favs: string[];
  role: "STUDENT" | "VENDOR" | "ADMIN";
  addToCart: (l: CartLine) => void;
  setQty: (foodId: string, qty: number) => void;
  removeMany: (foodIds: string[]) => void;
  clearCart: () => void;
  toggleFav: (id: string) => void;
  setRole: (r: AppState["role"]) => void;
  cartCount: number;
}

const Ctx = createContext<AppState | null>(null);

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [favs, setFavs] = useState<string[]>(["f1"]);
  const [role, setRole] = useState<AppState["role"]>("STUDENT");

  const addToCart = useCallback((l: CartLine) => {
    setCart((c) => {
      const i = c.findIndex((x) => x.foodId === l.foodId);
      if (i >= 0) { const n = [...c]; n[i] = { ...n[i], qty: n[i].qty + l.qty }; return n; }
      return [...c, l];
    });
  }, []);
  const setQty = useCallback((foodId: string, qty: number) => {
    setCart((c) => qty <= 0 ? c.filter((x) => x.foodId !== foodId) : c.map((x) => x.foodId === foodId ? { ...x, qty } : x));
  }, []);
  const clearCart = useCallback(() => setCart([]), []);
  const removeMany = useCallback((ids: string[]) => setCart((c) => c.filter((x) => !ids.includes(x.foodId))), []);
  const toggleFav = useCallback((id: string) => setFavs((f) => f.includes(id) ? f.filter((x) => x !== id) : [...f, id]), []);

  const v = useMemo(() => ({
    cart, favs, role, addToCart, setQty, removeMany, clearCart, toggleFav, setRole,
    cartCount: cart.reduce((a, b) => a + b.qty, 0),
  }), [cart, favs, role, addToCart, setQty, removeMany, clearCart, toggleFav]);
  return <Ctx.Provider value={v}>{children}</Ctx.Provider>;
}

export function useApp(): AppState {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp outside provider");
  return v;
}
