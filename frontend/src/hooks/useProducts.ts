import { useState, useEffect } from 'react';
import { getProducts } from '../services/productService';
import { Product, ProductFilters, ProductsResponse } from '../types/product';

const useProducts = (initialFilters: ProductFilters = {}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ProductFilters>(initialFilters);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(false);

  const fetchProducts = async (pageNum: number = 1, filterParams: ProductFilters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      // Convert filters to API query params
      const params: Record<string, string> = {
        page: pageNum.toString(),
        page_size: '10', // Default page size
        ...Object.fromEntries(
          Object.entries(filterParams)
            .filter(([_, value]) => value !== undefined && value !== '')
            .map(([key, value]) => [
              key,
              Array.isArray(value) ? value.join(',') : String(value)
            ])
        ),
      };

      const response = await getProducts(params);
      
      if (response) {
        if (pageNum === 1) {
          setProducts(response.results);
        } else {
          setProducts(prev => [...prev, ...response.results]);
        }
        setTotalCount(response.count);
        setHasMore(!!response.next);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchProducts(1, filters);
  }, [filters]);

  // Update filters
  const updateFilters = (newFilters: Partial<ProductFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1, // Reset to first page when filters change
    }));
  };

  // Load more products (for infinite scroll)
  const loadMore = () => {
    if (hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchProducts(nextPage, filters);
    }
  };

  // Apply client-side filtering if needed
  const filteredProducts = products.filter(product => {
    // Apply any client-side filtering here if not handled by the API
    return true;
  });

  return {
    products: filteredProducts,
    loading,
    error,
    filters,
    updateFilters,
    totalCount,
    hasMore,
    loadMore,
    refresh: () => fetchProducts(1, filters),
  };
};

export default useProducts;
