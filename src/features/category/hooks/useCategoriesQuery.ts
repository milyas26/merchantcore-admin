import { useQuery } from '@tanstack/react-query';
import { categoryApi, type GetCategoriesQuery } from '../api/categoryApi';

const CATEGORIES_QUERY_KEY = 'categories';

export const useCategoriesQuery = (query?: GetCategoriesQuery) => {
  return useQuery({
    queryKey: [CATEGORIES_QUERY_KEY, query],
    queryFn: () => categoryApi.getCategories(query),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};