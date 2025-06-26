import React, { createContext, useContext, useState, ReactNode } from 'react';
import api from '../services/api';

interface WishlistItem {
  id: number;
  name: string;
  price: number;
  color: string;
  size: string;
}

interface WishlistContextType {
  items: WishlistItem[];
  addItem: (item: WishlistItem) => void;
  removeItem: (id: number) => void;
  isInWishlist: (id: number) => boolean;
  getTotalItems: () => number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

interface WishlistProviderProps {
  children: ReactNode;
}

export const WishlistProvider: React.FC<WishlistProviderProps> = ({ children }) => {
  const [items, setItems] = useState<WishlistItem[]>([]);

  const addItem = (newItem: WishlistItem) => {
    setItems(prevItems => {
      const exists = prevItems.find(item => item.id === newItem.id);
      if (!exists) {
        return [...prevItems, newItem];
      }
      return prevItems;
    });
  };

  const removeItem = (id: number) => {
    setItems(prevItems => {
      return prevItems.filter(item => item.id !== id);
    });
  };

  const isInWishlist = (id: number) => {
    return items.some(item => item.id === id);
  };

  const getTotalItems = () => {
    return items.length;
  };

  // Sync wishlist with backend after login
  const syncWishlistWithBackend = async () => {
    try {
      // Send local wishlist items to backend
      for (const item of items) {
        await api.post('/products/add-to-wishlist/', {
          product_id: item.id,
          action: 'add',
        });
      }
      // Fetch merged wishlist from backend
      const res = await api.get('/products/get-wishlist/');
      if (res.data && res.data.wishlist_items) {
        setItems(
          res.data.wishlist_items.map((i: {
            id: number;
            name: string;
            price: number;
            color: string;
            size: string;
          }): WishlistItem => ({
            id: i.id,
            name: i.name,
            price: i.price,
            color: i.color,
            size: i.size,
          }))
        );
      }
    } catch {
      // Ignore errors for now
    }
  };

  const value: WishlistContextType & { syncWishlistWithBackend: () => Promise<void> } = {
    items,
    addItem,
    removeItem,
    isInWishlist,
    getTotalItems,
    syncWishlistWithBackend,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};