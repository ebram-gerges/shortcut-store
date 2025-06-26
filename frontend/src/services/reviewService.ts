import api from './api';
import { 
  ProductReview, 
  WebsiteReview, 
  ProductPhoto, 
  CreateProductReviewRequest, 
  CreateWebsiteReviewRequest, 
  CreateProductPhotoRequest 
} from '../types/review';

const BASE_URL = '/api';

export const reviewService = {
  // Product Reviews
  getProductReviews: async (productId?: number): Promise<ProductReview[]> => {
    try {
      const params = productId ? `?product_id=${productId}` : '';
      const response = await api.get(`${BASE_URL}/product-reviews/${params}`);
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (Array.isArray(response.data.results)) {
        return response.data.results;
      } else {
        return [];
      }
    } catch (error) {
      console.error('Error fetching product reviews:', error);
      return [];
    }
  },

  createProductReview: async (data: CreateProductReviewRequest): Promise<ProductReview> => {
    const response = await api.post(`${BASE_URL}/product-reviews/`, data);
    return response.data;
  },

  updateProductReview: async (id: number, data: Partial<CreateProductReviewRequest>): Promise<ProductReview> => {
    const response = await api.patch(`${BASE_URL}/product-reviews/${id}/`, data);
    return response.data;
  },

  deleteProductReview: async (id: number): Promise<void> => {
    await api.delete(`${BASE_URL}/product-reviews/${id}/`);
  },

  getMyProductReviews: async (): Promise<ProductReview[]> => {
    try {
      const response = await api.get(`${BASE_URL}/product-reviews/my_reviews/`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching my product reviews:', error);
      return [];
    }
  },

  // Website Reviews
  getWebsiteReviews: async (): Promise<WebsiteReview[]> => {
    try {
      const response = await api.get(`${BASE_URL}/website-reviews/`);
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (Array.isArray(response.data.results)) {
        return response.data.results;
      } else {
        return [];
      }
    } catch (error) {
      console.error('Error fetching website reviews:', error);
      return [];
    }
  },

  createWebsiteReview: async (data: CreateWebsiteReviewRequest): Promise<WebsiteReview> => {
    const response = await api.post(`${BASE_URL}/website-reviews/`, data);
    return response.data;
  },

  updateWebsiteReview: async (id: number, data: Partial<CreateWebsiteReviewRequest>): Promise<WebsiteReview> => {
    const response = await api.patch(`${BASE_URL}/website-reviews/${id}/`, data);
    return response.data;
  },

  deleteWebsiteReview: async (id: number): Promise<void> => {
    await api.delete(`${BASE_URL}/website-reviews/${id}/`);
  },

  getMyWebsiteReviews: async (): Promise<WebsiteReview[]> => {
    try {
      const response = await api.get(`${BASE_URL}/website-reviews/my_reviews/`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching my website reviews:', error);
      return [];
    }
  },

  // Product Photos
  getProductPhotos: async (productId?: number): Promise<ProductPhoto[]> => {
    try {
      const params = productId ? `?product_id=${productId}` : '';
      const response = await api.get(`${BASE_URL}/product-photos/${params}`);
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (Array.isArray(response.data.results)) {
        return response.data.results;
      } else {
        return [];
      }
    } catch (error) {
      console.error('Error fetching product photos:', error);
      return [];
    }
  },

  createProductPhoto: async (data: CreateProductPhotoRequest): Promise<ProductPhoto> => {
    const formData = new FormData();
    formData.append('product', data.product.toString());
    formData.append('photo', data.photo);
    if (data.caption) {
      formData.append('caption', data.caption);
    }
    if (data.review) {
      formData.append('review', data.review.toString());
    }

    const response = await api.post(`${BASE_URL}/product-photos/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateProductPhoto: async (id: number, data: Partial<CreateProductPhotoRequest>): Promise<ProductPhoto> => {
    const formData = new FormData();
    if (data.product) {
      formData.append('product', data.product.toString());
    }
    if (data.photo) {
      formData.append('photo', data.photo);
    }
    if (data.caption) {
      formData.append('caption', data.caption);
    }
    if (data.review) {
      formData.append('review', data.review.toString());
    }

    const response = await api.patch(`${BASE_URL}/product-photos/${id}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteProductPhoto: async (id: number): Promise<void> => {
    await api.delete(`${BASE_URL}/product-photos/${id}/`);
  },

  getMyProductPhotos: async (): Promise<ProductPhoto[]> => {
    try {
      const response = await api.get(`${BASE_URL}/product-photos/my_photos/`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching my product photos:', error);
      return [];
    }
  },
}; 