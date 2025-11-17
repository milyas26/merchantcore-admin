// Store types/interfaces

export interface Store {
  id: string
  name: string
  description?: string
  address?: string
  phone?: string
  email?: string
  createdAt?: string
  updatedAt?: string
  isActive?: boolean
}

export interface CreateStoreRequest {
  name: string
  description?: string
  address?: string
  phone?: string
  email?: string
}

export interface UpdateStoreRequest {
  name?: string
  description?: string
  address?: string
  phone?: string
  email?: string
  isActive?: boolean
}

export interface StoreResponse {
  success: boolean
  data: {
    store: Store
  }
}

export interface StoresResponse {
  success: boolean
  data: {
    stores: Store[]
  }
}

export interface SwitchStoreResponse {
  success: boolean
  data: {
    currentStore: Store
    accessToken: string
  }
}

export interface StoreState {
  stores: Store[]
  currentStore: Store | null
  isLoading: boolean
  error: string | null
}

export interface StoreStore extends StoreState {
  // Actions
  setStores: (stores: Store[]) => void
  setCurrentStore: (store: Store | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  fetchStores: () => Promise<{ success: boolean; error?: string }>
  createStore: (storeData: CreateStoreRequest) => Promise<{ success: boolean; error?: string }>
  updateStore: (storeId: string, storeData: UpdateStoreRequest) => Promise<{ success: boolean; error?: string }>
  deleteStore: (storeId: string) => Promise<{ success: boolean; error?: string }>
  clearError: () => void
}