import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { CartItem } from "@/types";
import { cartStorage } from "@/lib/cart-storage";

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  updateQuantity: (id: number, quantity: number) => void;
  removeItem: (id: number) => void;
  clearCart: () => void;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setItems(cartStorage.getCart());
  }, []);

  const addItem = (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    cartStorage.addItem(item);
    setItems(cartStorage.getCart());
  };

  const updateQuantity = (id: number, quantity: number) => {
    cartStorage.updateQuantity(id, quantity);
    setItems(cartStorage.getCart());
  };

  const removeItem = (id: number) => {
    cartStorage.removeItem(id);
    setItems(cartStorage.getCart());
  };

  const clearCart = () => {
    cartStorage.clearCart();
    setItems([]);
  };

  const itemCount = cartStorage.getItemCount();
  const subtotal = cartStorage.getSubtotal();

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        isOpen,
        openCart,
        closeCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
