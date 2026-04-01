import { z } from "zod";
import { OrderStatusEnum } from "./OrderValidator";

export const CreateProfileSchema = z.object({
  userId: z.string().min(1, "userId is required"),
  name: z.string().min(1, "name is required"),
  email: z.string().email("email must be a valid email"),
});

export const AddAddressSchema = z.object({
  addressId: z.string().min(1, "addressId is required"),
  userId: z.string().min(1, "userId is required"),
  street: z.string().min(1, "street is required"),
  city: z.string().min(1, "city is required"),
});

export const PAYMENT_TYPES = ["credit", "debit", "paypal", "cash"] as const;

export const AddPaymentSchema = z.object({
  paymentId: z.string().min(1, "paymentId is required"),
  userId: z.string().min(1, "userId is required"),
  type: z.enum(PAYMENT_TYPES, {
    message: "type must be credit, debit, paypal or cash",
  }),
  last4: z
    .string()
    .regex(/^\d{4}$/, "last4 must be exactly 4 digits")
    .optional(),
});

export const FilterOrdersSchema = z.object({
  status: OrderStatusEnum,
});
