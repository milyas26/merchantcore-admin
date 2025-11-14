import api from "@/interceptors/axiosInterceptor";
import type { ErrorResponse } from "@/shared/types/interface";

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  categoryId: string;
  sku: string | null;
  basePrice: number;
  compareAtPrice: number | null;
  cost: number | null;
  weight: number | null;
  isActive: boolean;
  isFeatured: boolean;
  trackInventory: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  position: number;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  media?: Array<{
    id: string;
    url: string;
    alt: string | null;
    position: number;
    type: string;
  }>;
  variants?: Array<{
    id: string;
    title: string;
    sku: string;
    price: number;
    compareAtPrice: number | null;
    cost: number | null;
    weight: number | null;
    barcode: string | null;
    image: string | null;
    position: number;
    isActive: boolean;
    inventory?: {
      quantity: number;
      reserved: number;
      lowStockThreshold: number | null;
    };
  }>;
}

export interface GetProductsResponse {
  success: boolean;
  data: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface GetProductsQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  published?: boolean;
  featured?: boolean;
  sortBy?: 'name' | 'price' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export class ProductApi {
  private static instance: ProductApi;

  private constructor() {}

  public static getInstance(): ProductApi {
    if (!ProductApi.instance) {
      ProductApi.instance = new ProductApi();
    }
    return ProductApi.instance;
  }

  async getProducts(query?: GetProductsQuery): Promise<GetProductsResponse> {
    try {
      const params = new URLSearchParams();
      
      if (query) {
        Object.entries(query).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, value.toString());
          }
        });
      }

      const response = await api.get<GetProductsResponse>(`/products?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw error.response.data as ErrorResponse;
      }
      throw {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred while fetching products",
        },
      } as ErrorResponse;
    }
  }
}

export const productApi = ProductApi.getInstance();