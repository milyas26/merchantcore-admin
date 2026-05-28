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
  cost: number | null;
  weight: number | null;
  isActive: boolean;
  isFeatured: boolean;
  trackInventory: boolean;
  isVariant: boolean;
  barcode: string | null;
  inventory?: {
    quantity: number;
    reserved: number;
    lowStockThreshold: number | null;
  };
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
  images?: Array<{
    id: string;
    url: string;
    alt: string | null;
    position: number;
  }>;
  variants?: Array<{
    id: string;
    title: string;
    sku: string;
    price: number;
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

export interface ProductResponse {
  success: boolean;
  data: Product;
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
  sortBy?: "name" | "price" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
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
            const paramKey = key === "search" ? "q" : key;
            params.append(paramKey, value.toString());
          }
        });
      }

      const response = await api.get<GetProductsResponse>(
        `/products?${params.toString()}`
      );
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

  /**
   * Mengambil detail produk berdasarkan slug
   *
   * @param slug Slug unik produk
   * @returns Response dengan data produk
   * @throws ErrorResponse jika API mengembalikan error
   */
  async getProductBySlug(slug: string): Promise<ProductResponse> {
    try {
      const response = await api.get<ProductResponse>(`/products/${slug}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw error.response.data as ErrorResponse;
      }
      throw {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred while fetching product",
        },
      } as ErrorResponse;
    }
  }
}

export const productApi = ProductApi.getInstance();