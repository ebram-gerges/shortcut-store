import api from './api';

export interface CartItem {
  id: number;
  product: {
    id: number;
    name: string;
    price: string;
    image?: string;
  };
  variant?: {
    id: number;
    color: string;
    size: string;
    price_adjustment: string;
  };
  quantity: number;
  total_price: string;
}

export interface Cart {
  id: number;
  items: CartItem[];
  total_items: number;
  total_price: string;
  discount?: {
    code: string;
    amount: string;
  };
}

export const getCart = async (): Promise<Cart> => {
  try {
    const response = await api.get('/api/cart/');
    return response.data;
  } catch (error) {
    console.error('Error fetching cart:', error);
    throw error;
  }
};

export const addToCart = async (productId: number, quantity: number = 1, variantId?: number): Promise<Cart> => {
  try {
    const response = await api.post('/api/cart/add/', {
      product: productId,
      quantity,
      variant: variantId
    });
    return response.data;
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
};

export const updateCartItem = async (itemId: number, quantity: number): Promise<Cart> => {
  try {
    const response = await api.put(`/api/cart/items/${itemId}/`, { quantity });
    return response.data;
  } catch (error) {
    console.error('Error updating cart item:', error);
    throw error;
  }
};

export const removeFromCart = async (itemId: number): Promise<void> => {
  try {
    await api.delete(`/api/cart/items/${itemId}/`);
  } catch (error) {
    console.error('Error removing from cart:', error);
    throw error;
  }
};

export const applyVoucher = async (code: string): Promise<Cart> => {
  try {
    const response = await api.post('/api/cart/apply-voucher/', { code });
    return response.data;
  } catch (error) {
    console.error('Error applying voucher:', error);
    throw error;
  }
};

export const clearCart = async (): Promise<void> => {
  try {
    await api.post('/api/cart/clear/');
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error;
  }
};
