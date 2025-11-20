import api from "@/interceptors/axiosInterceptor";
import type { ErrorResponse } from "@/shared/types/interface";
import type { ProductFormData } from "../schema/productFormSchema";

export interface UpsertProductRequest extends ProductFormData {
  id?: string | number;
}

export interface CreateProductResponse {
  success: boolean;
  data: {
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
    createdAt: string;
    updatedAt: string;
  };
}

export class ProductEditorApi {
  private static instance: ProductEditorApi;

  private constructor() {}

  public static getInstance(): ProductEditorApi {
    if (!ProductEditorApi.instance) {
      ProductEditorApi.instance = new ProductEditorApi();
    }
    return ProductEditorApi.instance;
  }

  async createProduct(productData: ProductFormData): Promise<CreateProductResponse> {
    try {
      const response = await api.post<CreateProductResponse>("/products", productData);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw error.response.data as ErrorResponse;
      }
      throw {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred while creating product",
        },
      } as ErrorResponse;
    }
  }

  async upsertProduct(productData: UpsertProductRequest): Promise<CreateProductResponse> {
    try {
      const response = await api.post<CreateProductResponse>("/products", productData);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw error.response.data as ErrorResponse;
      }
      throw {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred while saving product",
        },
      } as ErrorResponse;
    }
  }
}

export const productEditorApi = ProductEditorApi.getInstance();