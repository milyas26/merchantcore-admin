export { ordersApi } from "./api/ordersApi";
export type {
  OrderListItem,
  OrderDetail,
  OrderStatus,
  PaymentStatus,
  FulfillmentStatus,
  GetOrdersQuery,
  GetOrdersResponse,
  GetOrderResponse,
} from "./types/interface";
export {
  useOrdersQuery,
  useOrderQuery,
  useUpdateOrderStatus,
  useUpdatePaymentStatus,
} from "./hooks/useOrdersQuery";
