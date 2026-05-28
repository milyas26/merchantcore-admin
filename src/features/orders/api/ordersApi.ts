import api from "@/interceptors/axiosInterceptor";
import type {
  GetOrdersResponse,
  GetOrderResponse,
  GetOrdersQuery,
  OrderStatus,
  PaymentStatus,
} from "../types/interface";

export class OrdersApi {
  private static instance: OrdersApi;

  private constructor() {}

  public static getInstance(): OrdersApi {
    if (!OrdersApi.instance) {
      OrdersApi.instance = new OrdersApi();
    }
    return OrdersApi.instance;
  }

  async getOrders(query?: GetOrdersQuery): Promise<GetOrdersResponse> {
    const params = new URLSearchParams();
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          const paramKey = key === "q" ? "q" : key;
          params.append(paramKey, String(value));
        }
      });
    }
    const response = await api.get<GetOrdersResponse>(`/orders?${params.toString()}`);
    return response.data;
  }

  async getOrderById(id: string): Promise<GetOrderResponse> {
    const response = await api.get<GetOrderResponse>(`/orders/${id}`);
    return response.data;
  }

  async updateOrderStatus(id: string, status: OrderStatus): Promise<GetOrderResponse> {
    const response = await api.patch<GetOrderResponse>(`/orders/${id}/status`, { status });
    return response.data;
  }

  async updatePaymentStatus(id: string, paymentStatus: PaymentStatus): Promise<GetOrderResponse> {
    const response = await api.patch<GetOrderResponse>(`/orders/${id}/payment-status`, { paymentStatus });
    return response.data;
  }
}

export const ordersApi = OrdersApi.getInstance();
