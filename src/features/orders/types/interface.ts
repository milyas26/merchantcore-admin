export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

export type PaymentStatus =
  | "PENDING"
  | "PAID"
  | "PARTIALLY_PAID"
  | "REFUNDED"
  | "PARTIALLY_REFUNDED"
  | "FAILED";

export type FulfillmentStatus =
  | "UNFULFILLED"
  | "PARTIALLY_FULFILLED"
  | "FULFILLED";

export interface OrderCustomer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface OrderAddress {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  address1: string;
  address2?: string | null;
  city: string;
  province: string;
  country: string;
  postalCode: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  variantId?: string | null;
  quantity: number;
  price: string;
  total: string;
  product: { id: string; slug: string; name: string };
  variant?: { id: string; title: string; sku: string } | null;
}

export interface OrderListItem {
  id: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  currency: string;
  subtotal: string;
  tax: string;
  shipping: string;
  discount: string;
  total: string;
  notes?: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  customer: OrderCustomer;
}

export interface OrderDetail extends OrderListItem {
  billingAddress: OrderAddress;
  shippingAddress: OrderAddress;
  items: OrderItem[];
}

export interface GetOrdersResponse {
  success: boolean;
  data: OrderListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface GetOrderResponse {
  success: boolean;
  data: OrderDetail;
}

export interface GetOrdersQuery {
  page?: number;
  limit?: number;
  q?: string;
  sortBy?: "createdAt" | "updatedAt" | "total";
  sortOrder?: "asc" | "desc";
}
