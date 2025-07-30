export interface ProductVariant {
  id: number;
  color: string;
  size: string;
  stock: number;
  price_adjustment: string;
  images: string[];
}

export interface ProductColorVariantImage {
  id: number;
  image: string;
  alt_text?: string;
  is_primary?: boolean;
  order?: number;
}

export interface ProductColorVariant {
  id: number;
  color: string;
  color_hex?: string;
  is_active?: boolean;
  images?: ProductColorVariantImage[];
}

export interface ProductStockItem {
  id: number;
  color_variant?: ProductColorVariant;
  size?: string;
  quantity?: number;
  reserved_quantity?: number;
  available_quantity?: number;
  stock_status?: string;
  is_active?: boolean;
}

export interface SubCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  is_active: boolean;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  image_variants?: any;
  is_active?: boolean;
  order?: number;
  created_at: string;
  updated_at: string;
  subcategories?: SubCategory[];
}

export interface Product {
  id: number;
  slug: string;
  name: string;
  description: string;
  price: string;
  indoor_image?: string;
  outdoor_image?: string;
  category?: Category;
  subcategory?: SubCategory;
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
  color_variants?: ProductColorVariant[];
  stock_items?: ProductStockItem[];
  available_colors?: string[];
  available_sizes?: string[];
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
