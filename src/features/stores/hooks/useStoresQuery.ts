import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { storeService } from "../services/storeService"
import type { CreateStoreRequest } from "../types/interface"
import { toast } from "sonner"

// Query keys
export const STORE_KEYS = {
  all: ["stores"] as const,
  lists: () => [...STORE_KEYS.all, "list"] as const,
  list: (filters: string) => [...STORE_KEYS.lists(), { filters }] as const,
  details: () => [...STORE_KEYS.all, "detail"] as const,
  detail: (id: string) => [...STORE_KEYS.details(), id] as const,
}

// Fetch stores hook
export function useStores() {
  return useQuery({
    queryKey: STORE_KEYS.lists(),
    queryFn: async () => {
      try {
        const stores = await storeService.getStores()
        return stores
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : "Failed to fetch stores")
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Create store hook
export function useCreateStore() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: CreateStoreRequest) => {
      try {
        const store = await storeService.createStore(data)
        return store
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : "Failed to create store")
      }
    },
    onSuccess: () => {
      // Invalidate and refetch stores
      queryClient.invalidateQueries({ queryKey: STORE_KEYS.lists() })
      toast.success("Store created successfully")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create store")
    },
  })
}

// Fetch single store hook
export function useStore(id: string) {
  return useQuery({
    queryKey: STORE_KEYS.detail(id),
    queryFn: async () => {
      try {
        const store = await storeService.getStore(id)
        return store
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : "Failed to fetch store")
      }
    },
    enabled: !!id, // Only fetch if id is provided
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}