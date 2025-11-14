import { useQuery } from '@tanstack/react-query';
import { productApi, type GetProductsQuery } from '../api/productApi';

const PRODUCTS_QUERY_KEY = 'products';

export const useProductsQuery = (query?: GetProductsQuery) => {
  return useQuery({
    queryKey: [PRODUCTS_QUERY_KEY, query],
    queryFn: () => productApi.getProducts(query),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};