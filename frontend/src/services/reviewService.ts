import api from './api';

const getProductReviews = async (productId: string) => {
  const response = await api.get(`/api/reviews/product/${productId}/`);
  return response.data;
};

const getWebsiteReviews = async () => {
  const response = await api.get('/api/reviews/website/');
  return response.data;
};

const submitReview = async (reviewData: any) => {
  const response = await api.post('/api/reviews/create/', reviewData);
  return response.data;
};

export const reviewService = {
  getProductReviews,
  getWebsiteReviews,
  submitReview,
};