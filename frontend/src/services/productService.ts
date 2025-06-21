import api from './api';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  image?: string;
  category?: string;
  created_at: string;
  updated_at: string;
  variants?: ProductVariant[];
}

export interface ProductVariant {
  id: number;
  color: string;
  size: string;
  stock: number;
  price_adjustment: string;
  images: string[];
}

export const getProducts = async (params = {}): Promise<Product[]> => {
  try {
    const response = await api.get('/api/products/', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const getProductById = async (id: number): Promise<Product> => {
  try {
    const response = await api.get(`/api/products/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    throw error;
  }
};

export const getProductVariants = async (productId: number): Promise<ProductVariant[]> => {
  try {
    const response = await api.get(`/api/products/${productId}/variants/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching variants for product ${productId}:`, error);
    throw error;
  }
};

export const searchProducts = async (query: string): Promise<Product[]> => {
  try {
    const response = await api.get('/api/products/search/', { params: { q: query } });
    return response.data;
  } catch (error) {
    console.error('Error searching products:', error);
    throw error;
  }
};
