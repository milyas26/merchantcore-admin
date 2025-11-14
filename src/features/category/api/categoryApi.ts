import api from "@/interceptors/axiosInterceptor";
import type { ErrorResponse } from "@/shared/types/interface";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  image: string | null;
  isActive: boolean;
  position: number;
  createdAt: string;
  updatedAt: string;
  parent?: {
    id: string;
    name: string;
    slug: string;
  };
  children?: Category[];
}

export interface GetCategoriesResponse {
  success: boolean;
  data: Category[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface GetCategoriesQuery {
  page?: number;
  limit?: number;
  search?: string;
  parent?: string;
  active?: boolean;
  sortBy?: 'name' | 'position' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export class CategoryApi {
  private static instance: CategoryApi;

  private constructor() {}

  public static getInstance(): CategoryApi {
    if (!CategoryApi.instance) {
      CategoryApi.instance = new CategoryApi();
    }
    return CategoryApi.instance;
  }

  async getCategories(query?: GetCategoriesQuery): Promise<GetCategoriesResponse> {
    try {
      const params = new URLSearchParams();
      
      if (query) {
        Object.entries(query).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, value.toString());
          }
        });
      }

      const response = await api.get<GetCategoriesResponse>(`/categories?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw error.response.data as ErrorResponse;
      }
      throw {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred while fetching categories",
        },
      } as ErrorResponse;
    }
  }
}

export const categoryApi = CategoryApi.getInstance();