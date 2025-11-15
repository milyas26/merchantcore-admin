import { useQuery } from '@tanstack/react-query';
import { categoryService } from '../services/categoryService';
import type { GetCategoriesQuery } from '../api/categoryApi';

const CATEGORIES_QUERY_KEY = 'categories';

export const useCategoriesQuery = (query?: GetCategoriesQuery) => {
  return useQuery({
    queryKey: [CATEGORIES_QUERY_KEY, query],
    queryFn: () => categoryService.getCategories(query),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};