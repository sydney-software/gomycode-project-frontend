import { X } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCart } from "@/hooks/use-cart";
import CartItemComponent from "./cart-item";

export default function CartModal() {
  const { items, subtotal, isOpen, closeCart, clearCart } = useCart();
  const [, navigate] = useLocation();

  if (!isOpen) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50">
      <div className="absolute inset-0" onClick={closeCart} />
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-6 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">Shopping Cart</h2>
            <Button variant="ghost" size="sm" onClick={closeCart}>
              <X className="h-6 w-6" />
            </Button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-hidden">
            {items.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <p className="text-slate-500 mb-4">Your cart is empty</p>
                  <Button onClick={closeCart}>Continue Shopping</Button>
                </div>
              </div>
            ) : (
              <ScrollArea className="h-full px-4 py-6">
                <div className="space-y-0">
                  {items.map((item) => (
                    <CartItemComponent key={item.id} item={item} />
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-slate-200 px-4 py-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-base font-medium text-slate-900">Subtotal</span>
                <span className="text-lg font-semibold text-slate-900">
                  {formatPrice(subtotal)}
                </span>
              </div>
              <div className="space-y-2">
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={handleCheckout}
                >
                  Proceed to Checkout
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={clearCart}
                >
                  Clear Cart
                </Button>
              </div>
              <p className="text-xs text-slate-500 text-center mt-2">
                Shipping and taxes calculated at checkout
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
