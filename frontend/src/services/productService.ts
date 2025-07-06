import api from './api';

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  is_active: boolean;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  slug: string;
  name: string;
  description: string;
  price: string;
  image?: string;
  category?: Category;
  created_at: string;
  updated_at: string;
  variants?: ProductVariant[];
  in_stock?: boolean;
  rating?: number;
  colors?: string[];
  sizes?: string[];
  available_colors?: string[];
  available_sizes?: string[];
  indoor_image?: string;
  outdoor_image?: string;
  sale_percent?: number;
  discounted_price?: number;
  color_variants?: ProductColorVariant[];
}

export interface ProductVariant {
  id: number;
  color: string;
  size: string;
  stock: number;
  price_adjustment: string;
  images: string[];
}

export interface ProductColorVariant {
  id: number;
  color: string;
  color_hex: string;
  is_active: boolean;
  images: ProductColorVariantImage[];
}

export interface ProductColorVariantImage {
  id: number;
  image: string;
  alt_text: string;
  created_at: string;
}

export interface CollectionGalleryImage {
  id: number;
  image: string;
  order: number;
  created_at: string;
}

export interface CollectionImage {
  id: number;
  title: string;
  image?: string;
  order: number;
  is_active: boolean;
  created_at: string;
  images: CollectionGalleryImage[];
}

export interface CategoryImage {
  id: number;
  category: Category;
  image: string;
  title?: string;
  description?: string;
  order: number;
  is_active: boolean;
  created_at: string;
}

export const getProducts = async (params = {}): Promise<Product[]> => {
  try {
    const response = await api.get('/api/products/', { params });
    // If response.data is an array, return it directly; otherwise, fallback to .results
    return Array.isArray(response.data) ? response.data : response.data.results;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const getProductBySlug = async (slug: string): Promise<Product> => {
  try {
    const response = await api.get(`/api/products/${slug}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching product with slug ${slug}:`, error);
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

export const getCollectionImages = async (): Promise<CollectionImage[]> => {
  try {
    const response = await api.get('/api/collection-images/');
    return response.data;
  } catch (error) {
    console.error('Error fetching collection images:', error);
    return [];
  }
};

export const getCategories = async (): Promise<Category[]> => {
  try {
    const response = await api.get('/api/products/categories/');
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

export const getCategoryImages = async (): Promise<CategoryImage[]> => {
  try {
    const response = await api.get('/api/category-images/');
    return response.data;
  } catch (error) {
    console.error('Error fetching category images:', error);
    return [];
  }
};
