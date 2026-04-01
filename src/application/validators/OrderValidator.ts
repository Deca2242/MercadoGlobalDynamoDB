import { z } from "zod";

export const ORDER_STATUSES = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export const OrderStatusEnum = z.enum(ORDER_STATUSES);

export const CreateOrderSchema = z.object({
  orderId: z.string().min(1, "orderId is required"),
  userId: z.string().min(1, "userId is required"),
  status: OrderStatusEnum,
  shippingAddress: z.string().min(1, "shippingAddress is required"),
  total: z.number().optional(),
  date: z.string().optional(),
});

export const OrderItemSchema = z.object({
  orderId: z.string().optional(),
  productSlug: z.string().min(1, "productSlug is required"),
  productName: z.string().min(1, "productName is required"),
  qty: z.number().int().positive("qty must be a positive integer"),
  unitPrice: z.number().positive("unitPrice must be positive"),
  subtotal: z.number().optional(),
});

export const CreateOrderInputSchema = z.object({
  order: CreateOrderSchema,
  items: z.array(OrderItemSchema).min(1, "At least one item is required"),
});

export const UpdateStatusSchema = z.object({
  newStatus: OrderStatusEnum,
});
