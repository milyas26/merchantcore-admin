import api from "@/interceptors/axiosInterceptor";
import type { ErrorResponse } from "@/shared/types/interface";

export interface InventoryItemDTO {
  id: string;
  productId: string;
  productSlug?: string;
  name: string;
  sku: string;
  categoryId?: string;
  categoryName?: string;
  quantity: number;
  reserved: number;
  lowStockThreshold?: number | null;
  status?: "low" | "normal" | "out";
  updatedAt?: string;
}

export interface GetInventoriesResponse {
  success: boolean;
  data: InventoryItemDTO[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface GetInventoriesQuery {
  page?: number;
  limit?: number; // default 10
  q?: string;
  category?: string;
  status?: "low" | "normal" | "out";
  sortBy?: "name" | "sku" | "quantity" | "reserved" | "updatedAt";
  sortOrder?: "asc" | "desc";
}

export class InventoryApi {
  private static instance: InventoryApi;

  private constructor() {}

  public static getInstance(): InventoryApi {
    if (!InventoryApi.instance) {
      InventoryApi.instance = new InventoryApi();
    }
    return InventoryApi.instance;
  }

  async getInventories(query?: GetInventoriesQuery): Promise<GetInventoriesResponse> {
    try {
      const params = new URLSearchParams();
      if (query) {
        Object.entries(query).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            params.append(key, value.toString());
          }
        });
      }
      if (!params.has("limit")) params.set("limit", String(10));
      const response = await api.get<GetInventoriesResponse>(`/inventories?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw error.response.data as ErrorResponse;
      }
      throw {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred while fetching inventories",
        },
      } as ErrorResponse;
    }
  }

  async updateInventory(id: string, data: { quantity: number; reserved: number }) {
    try {
      const response = await api.put(`/inventories/${id}`, data);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw error.response.data as ErrorResponse;
      }
      throw {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred while updating inventory",
        },
      } as ErrorResponse;
    }
  }
}

export const inventoryApi = InventoryApi.getInstance();