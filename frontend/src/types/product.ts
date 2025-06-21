export interface ProductVariant {
  id: number;
  color: string;
  size: string;
  stock: number;
  price_adjustment: string;
  images: string[];
}

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
  rating?: number;
  review_count?: number;
  in_stock?: boolean;
  on_sale?: boolean;
  sale_price?: string;
  colors?: string[];
  sizes?: string[];
}

export interface ProductFilters {
  availability?: string[];
  priceMin?: string;
  priceMax?: string;
  sizes?: string[];
  colors?: string[];
  category?: string;
  search?: string;
  sortBy?: string;
  page?: number;
  pageSize?: number;
}

export interface ProductsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Product[];
}
