import { CartItem } from "@/types";

const CART_STORAGE_KEY = "front-market-cart";

export const cartStorage = {
  getCart(): CartItem[] {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  setCart(items: CartItem[]): void {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error("Failed to save cart to localStorage:", error);
    }
  },

  addItem(item: Omit<CartItem, 'quantity'> & { quantity?: number }): void {
    const cart = this.getCart();
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    
    if (existingItem) {
      existingItem.quantity = Math.min(
        existingItem.quantity + (item.quantity || 1),
        existingItem.maxQuantity
      );
    } else {
      cart.push({
        ...item,
        quantity: item.quantity || 1,
      });
    }
    
    this.setCart(cart);
  },

  updateQuantity(id: number, quantity: number): void {
    const cart = this.getCart();
    const item = cart.find(cartItem => cartItem.id === id);
    
    if (item) {
      if (quantity <= 0) {
        this.removeItem(id);
      } else {
        item.quantity = Math.min(quantity, item.maxQuantity);
        this.setCart(cart);
      }
    }
  },

  removeItem(id: number): void {
    const cart = this.getCart();
    const filteredCart = cart.filter(item => item.id !== id);
    this.setCart(filteredCart);
  },

  clearCart(): void {
    this.setCart([]);
  },

  getItemCount(): number {
    return this.getCart().reduce((total, item) => total + item.quantity, 0);
  },

  getSubtotal(): number {
    return this.getCart().reduce((total, item) => total + (item.price * item.quantity), 0);
  }
};
