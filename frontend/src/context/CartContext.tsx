import React, { createContext, useContext, useState, ReactNode } from 'react';
import { getCart, addToCart } from '../services/cartService';

interface CartItem {
  id: number;
  slug: string;
  name: string;
  price: number;
  quantity: number;
  color: string;
  size: string;
  image?: string;
  sale_percent?: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (newItem: Omit<CartItem, 'quantity'>) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(
        item => item.id === newItem.id && item.color === newItem.color && item.size === newItem.size
      );

      if (existingItem) {
        return prevItems.map(item =>
          item.id === newItem.id && item.color === newItem.color && item.size === newItem.size
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...prevItems, { ...newItem, quantity: 1 }];
    });
  };

  const removeItem = (id: number) => {
    setItems(prevItems => {
      return prevItems.filter(item => item.id !== id);
    });
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems(prevItems => {
      return prevItems.map(item =>
        item.id === id ? { ...item, quantity } : item
      );
    });
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => {
      const salePercent = item.sale_percent;
      const basePrice = item.price;
      const finalPrice = salePercent && salePercent > 0 ? basePrice * (1 - salePercent / 100) : basePrice;
      return total + (finalPrice * item.quantity);
    }, 0);
  };

  const clearCart = () => {
    setItems([]);
  };

  // Sync cart with backend after login
  const syncCartWithBackend = async () => {
    try {
      // Send local cart items to backend
      for (const item of items) {
        await addToCart(item.id, item.quantity);
      }
      // Fetch merged cart from backend
      const backendCart = await getCart();
      if (backendCart && backendCart.items) {
        setItems(
          backendCart.items.map((i: {
            product: { id: number; name: string; price: string; image?: string };
            quantity: number;
            variant?: { color?: string; size?: string };
          }): CartItem => ({
            id: i.product.id,
            slug: '', // TODO: set slug if available from backend
            name: i.product.name,
            price: Number(i.product.price),
            quantity: i.quantity,
            color: i.variant?.color || '',
            size: i.variant?.size || '',
            image: i.product.image || '',
          }))
        );
      }
    } catch {
      // Ignore errors for now
    }
  };

  const value: CartContextType & { syncCartWithBackend: () => Promise<void> } = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    getTotalItems,
    getTotalPrice,
    clearCart,
    syncCartWithBackend,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};