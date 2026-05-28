import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ordersApi, type OrdersApi as OrdersApiType } from "../api/ordersApi";
import type { GetOrdersQuery, OrderStatus, PaymentStatus } from "../types/interface";
import { toast } from "sonner";

const ORDERS_KEY = "orders";

export function useOrdersQuery(query?: GetOrdersQuery) {
  return useQuery({
    queryKey: [ORDERS_KEY, query],
    queryFn: () => ordersApi.getOrders(query),
    staleTime: 30_000,
  });
}

export function useOrderQuery(id: string) {
  return useQuery({
    queryKey: [ORDERS_KEY, id],
    queryFn: () => ordersApi.getOrderById(id),
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      ordersApi.updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ORDERS_KEY] });
      toast.success("Order status updated");
    },
    onError: () => {
      toast.error("Failed to update order status");
    },
  });
}

export function useUpdatePaymentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, paymentStatus }: { id: string; paymentStatus: PaymentStatus }) =>
      ordersApi.updatePaymentStatus(id, paymentStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ORDERS_KEY] });
      toast.success("Payment status updated");
    },
    onError: () => {
      toast.error("Failed to update payment status");
    },
  });
}
