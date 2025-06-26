export interface ProductReview {
  id: number;
  product: number;
  user: {
    id: number;
    username: string;
    email: string;
    avatar?: string;
  };
  user_avatar?: string;
  username: string;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
}

export interface WebsiteReview {
  id: number;
  user: {
    id: number;
    username: string;
    email: string;
    avatar?: string;
  };
  user_avatar?: string;
  username: string;
  rating: number;
  experience_rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
}

export interface ProductPhoto {
  id: number;
  product: number;
  user: {
    id: number;
    username: string;
    email: string;
    avatar?: string;
  };
  user_avatar?: string;
  username: string;
  photo: string;
  caption?: string;
  created_at: string;
  is_approved: boolean;
  review?: number;
}

export interface CreateProductReviewRequest {
  product: number;
  rating: number;
  comment: string;
}

export interface CreateWebsiteReviewRequest {
  rating: number;
  experience_rating: number;
  comment: string;
}

export interface CreateProductPhotoRequest {
  product: number;
  photo: File;
  caption?: string;
  review?: number;
} 