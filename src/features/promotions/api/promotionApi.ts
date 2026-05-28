import api from "@/interceptors/axiosInterceptor";

export interface PromotionProduct {
  id: string;
  promotionId: string;
  productId: string;
  product: {
    id: string;
    name: string;
    slug: string;
    basePrice: number;
    images: { url: string; alt: string | null }[];
  };
}

export interface Promotion {
  id: string;
  title: string;
  description: string | null;
  couponCode: string | null;
  type: "PERCENTAGE" | "FIXED_AMOUNT" | "FREE_SHIPPING";
  value: number | null;
  currency: string | null;
  startsAt: string | null;
  endsAt: string | null;
  isActive: boolean;
  minSubtotal: number | null;
  usageLimit: number | null;
  usageLimitPerCustomer: number | null;
  createdAt: string;
  updatedAt: string;
  promotionProducts: PromotionProduct[];
  _count?: {
    promotionProducts: number;
    redemptions: number;
  };
}

export interface GetPromotionsResponse {
  success: boolean;
  data: Promotion[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface PromotionResponse {
  success: boolean;
  data: Promotion;
}

export interface GetPromotionsQuery {
  page?: number;
  limit?: number;
  q?: string;
  type?: "PERCENTAGE" | "FIXED_AMOUNT" | "FREE_SHIPPING";
  active?: boolean;
  sortBy?: "title" | "startsAt" | "endsAt" | "createdAt";
  sortOrder?: "asc" | "desc";
}

export interface CreatePromotionRequest {
  title: string;
  description?: string;
  couponCode?: string;
  type: "PERCENTAGE" | "FIXED_AMOUNT" | "FREE_SHIPPING";
  value?: number;
  currency?: string;
  startsAt?: string | null;
  endsAt?: string | null;
  isActive?: boolean;
  minSubtotal?: number;
  usageLimit?: number;
  usageLimitPerCustomer?: number;
  productIds?: string[];
}

export interface UpdatePromotionRequest extends Partial<CreatePromotionRequest> {}

export class PromotionApi {
  private static instance: PromotionApi;
  private constructor() {}

  static getInstance(): PromotionApi {
    if (!PromotionApi.instance) PromotionApi.instance = new PromotionApi();
    return PromotionApi.instance;
  }

  async getPromotions(query?: GetPromotionsQuery): Promise<GetPromotionsResponse> {
    const params = new URLSearchParams();
    if (query) {
      Object.entries(query).forEach(([k, v]) => {
        if (v !== undefined && v !== null) params.append(k, String(v));
      });
    }
    const res = await api.get<GetPromotionsResponse>(`/promotions?${params}`);
    return res.data;
  }

  async getPromotionById(id: string): Promise<PromotionResponse> {
    const res = await api.get<PromotionResponse>(`/promotions/${id}`);
    return res.data;
  }

  async createPromotion(data: CreatePromotionRequest): Promise<PromotionResponse> {
    const res = await api.post<PromotionResponse>("/promotions", data);
    return res.data;
  }

  async updatePromotion(id: string, data: UpdatePromotionRequest): Promise<PromotionResponse> {
    const res = await api.put<PromotionResponse>(`/promotions/${id}`, data);
    return res.data;
  }

  async deletePromotion(id: string): Promise<{ success: boolean }> {
    const res = await api.delete<{ success: boolean }>(`/promotions/${id}`);
    return res.data;
  }
}

export const promotionApi = PromotionApi.getInstance();
