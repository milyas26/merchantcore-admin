import { StoreRepository, storeRepository } from "../api/storeApi";
import type {
  Store,
  CreateStoreRequest,
  UpdateStoreRequest,
  StoreResponse,
  StoresResponse,
} from "../types/interface";
import type { ErrorResponse } from "@/shared/types/interface";

export class StoreService {
  private storeRepository: StoreRepository;

  constructor(storeRepo: StoreRepository = storeRepository) {
    this.storeRepository = storeRepo;
  }

  async getStores(): Promise<Store[]> {
    try {
      const response: StoresResponse = await this.storeRepository.getStores();

      if (!response.success || !response.data) {
        throw new Error("Failed to fetch stores: Invalid response format");
      }

      return response.data.stores;
    } catch (error) {
      if (this.isErrorResponse(error)) {
        throw this.mapErrorResponse(error);
      }
      throw new Error("Failed to fetch stores: An unexpected error occurred");
    }
  }

  async getStore(storeId: string): Promise<Store> {
    try {
      const response: StoreResponse = await this.storeRepository.getStore(storeId);

      if (!response.success || !response.data) {
        throw new Error("Failed to fetch store: Invalid response format");
      }

      return response.data.store;
    } catch (error) {
      if (this.isErrorResponse(error)) {
        throw this.mapErrorResponse(error);
      }
      throw new Error("Failed to fetch store: An unexpected error occurred");
    }
  }

  async createStore(storeData: CreateStoreRequest): Promise<Store> {
    try {
      const response: StoreResponse = await this.storeRepository.createStore(storeData);

      if (!response.success || !response.data) {
        throw new Error("Failed to create store: Invalid response format");
      }

      return response.data.store;
    } catch (error) {
      if (this.isErrorResponse(error)) {
        throw this.mapErrorResponse(error);
      }
      throw new Error("Failed to create store: An unexpected error occurred");
    }
  }

  async updateStore(storeId: string, storeData: UpdateStoreRequest): Promise<Store> {
    try {
      const response: StoreResponse = await this.storeRepository.updateStore(storeId, storeData);

      if (!response.success || !response.data) {
        throw new Error("Failed to update store: Invalid response format");
      }

      return response.data.store;
    } catch (error) {
      if (this.isErrorResponse(error)) {
        throw this.mapErrorResponse(error);
      }
      throw new Error("Failed to update store: An unexpected error occurred");
    }
  }

  async deleteStore(storeId: string): Promise<void> {
    try {
      await this.storeRepository.deleteStore(storeId);
    } catch (error) {
      if (this.isErrorResponse(error)) {
        throw this.mapErrorResponse(error);
      }
      throw new Error("Failed to delete store: An unexpected error occurred");
    }
  }

  // Helper methods
  private isErrorResponse(error: any): error is ErrorResponse {
    return (
      error &&
      typeof error === "object" &&
      "success" in error &&
      "error" in error
    );
  }

  private mapErrorResponse(errorResponse: ErrorResponse): Error {
    const { code, message } = errorResponse.error;

    switch (code) {
      case "VALIDATION_ERROR":
        return new Error("Please check your input and try again");
      case "STORE_NOT_FOUND":
        return new Error("Store not found");
      case "UNAUTHORIZED":
        return new Error("You are not authorized to perform this action");
      default:
        return new Error(message || "An error occurred. Please try again.");
    }
  }
}

export const storeService = new StoreService();