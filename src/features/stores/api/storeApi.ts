import api from "@/interceptors/axiosInterceptor";
import type {
  StoreResponse,
  StoresResponse,
  CreateStoreRequest,
  UpdateStoreRequest,
  SwitchStoreResponse,
} from "../types/interface";
import type { ErrorResponse } from "@/shared/types/interface";

export class StoreRepository {
  private static instance: StoreRepository;

  private constructor() {}

  public static getInstance(): StoreRepository {
    if (!StoreRepository.instance) {
      StoreRepository.instance = new StoreRepository();
    }
    return StoreRepository.instance;
  }

  async getStores(): Promise<StoresResponse> {
    try {
      const response = await api.get<StoresResponse>("/stores");
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw error.response.data as ErrorResponse;
      }
      throw {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred while fetching stores",
        },
      } as ErrorResponse;
    }
  }

  async getStore(storeId: string): Promise<StoreResponse> {
    try {
      const response = await api.get<StoreResponse>(`/stores/${storeId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw error.response.data as ErrorResponse;
      }
      throw {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred while fetching store",
        },
      } as ErrorResponse;
    }
  }

  async createStore(storeData: CreateStoreRequest): Promise<StoreResponse> {
    try {
      const response = await api.post<StoreResponse>("/stores", storeData);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw error.response.data as ErrorResponse;
      }
      throw {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred while creating store",
        },
      } as ErrorResponse;
    }
  }

  async updateStore(
    storeId: string,
    storeData: UpdateStoreRequest
  ): Promise<StoreResponse> {
    try {
      const response = await api.patch<StoreResponse>(
        `/stores/${storeId}`,
        storeData
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
          message: "An unexpected error occurred while updating store",
        },
      } as ErrorResponse;
    }
  }

  async deleteStore(storeId: string): Promise<void> {
    try {
      await api.delete(`/stores/${storeId}`);
    } catch (error: any) {
      if (error.response?.data) {
        throw error.response.data as ErrorResponse;
      }
      throw {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred while deleting store",
        },
      } as ErrorResponse;
    }
  }

  async switchStore(storeId: string): Promise<SwitchStoreResponse> {
    try {
      const response = await api.post<SwitchStoreResponse>("/stores/switch", {
        storeId,
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw error.response.data as ErrorResponse;
      }
      throw {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred while switching store",
        },
      } as ErrorResponse;
    }
  }
}

export const storeRepository = StoreRepository.getInstance();
