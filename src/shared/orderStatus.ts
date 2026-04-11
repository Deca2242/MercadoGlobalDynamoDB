import { z } from "zod";

export const ORDER_STATUSES = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export const OrderStatusEnum = z.enum(ORDER_STATUSES);

export type OrderStatus = (typeof ORDER_STATUSES)[number];
