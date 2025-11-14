import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  StoreStore,
  Store,
  CreateStoreRequest,
  UpdateStoreRequest,
} from "./types/interface";
import { storeService } from "./services/storeService";

export const useStoreStore = create<StoreStore>()(
  persist(
    (set, get) => ({
      // State
      stores: [],
      currentStore: null,
      isLoading: false,
      error: null,

      // Actions
      setStores: (stores: Store[]) => set({ stores }),

      setCurrentStore: (store: Store | null) => set({ currentStore: store }),

      setLoading: (isLoading: boolean) => set({ isLoading }),

      setError: (error: string | null) => set({ error }),

      clearError: () => set({ error: null }),

      // Store actions
      fetchStores: async () => {
        set({ isLoading: true, error: null });

        try {
          const stores = await storeService.getStores();

          set({
            stores,
            isLoading: false,
            error: null,
          });

          return { success: true };
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to fetch stores";
          set({
            isLoading: false,
            error: errorMessage,
          });

          return { success: false, error: errorMessage };
        }
      },

      createStore: async (storeData: CreateStoreRequest) => {
        set({ isLoading: true, error: null });

        try {
          const newStore = await storeService.createStore(storeData);

          const currentStores = get().stores;
          set({
            stores: [...currentStores, newStore],
            isLoading: false,
            error: null,
          });

          return { success: true };
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to create store";
          set({
            isLoading: false,
            error: errorMessage,
          });

          return { success: false, error: errorMessage };
        }
      },

      updateStore: async (storeId: string, storeData: UpdateStoreRequest) => {
        set({ isLoading: true, error: null });

        try {
          const updatedStore = await storeService.updateStore(storeId, storeData);

          const currentStores = get().stores;
          const updatedStores = currentStores.map((store) =>
            store.id === storeId ? updatedStore : store
          );

          // Update current store if it's the one being updated
          const currentStore = get().currentStore;
          if (currentStore?.id === storeId) {
            set({ currentStore: updatedStore });
          }

          set({
            stores: updatedStores,
            isLoading: false,
            error: null,
          });

          return { success: true };
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to update store";
          set({
            isLoading: false,
            error: errorMessage,
          });

          return { success: false, error: errorMessage };
        }
      },

      deleteStore: async (storeId: string) => {
        set({ isLoading: true, error: null });

        try {
          await storeService.deleteStore(storeId);

          const currentStores = get().stores;
          const filteredStores = currentStores.filter(
            (store) => store.id !== storeId
          );

          // Clear current store if it's the one being deleted
          const currentStore = get().currentStore;
          if (currentStore?.id === storeId) {
            set({ currentStore: null });
          }

          set({
            stores: filteredStores,
            isLoading: false,
            error: null,
          });

          return { success: true };
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to delete store";
          set({
            isLoading: false,
            error: errorMessage,
          });

          return { success: false, error: errorMessage };
        }
      },
    }),
    {
      name: "store-storage",
      partialize: (state) => ({
        stores: state.stores,
        currentStore: state.currentStore,
      }),
    }
  )
);