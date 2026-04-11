/**
 * Schemas OpenAPI para User y entidades relacionadas
 * Basados en los validadores Zod del dominio
 */

export const UserSchema = {
  type: "object",
  properties: {
    userId: {
      type: "string",
      description: "ID único del usuario",
      example: "550e8400-e29b-41d4-a716-446655440000 or luisa",
    },
    name: {
      type: "string",
      description: "Nombre completo del usuario",
      example: "Juan Pérez",
    },
    email: {
      type: "string",
      format: "email",
      description: "Correo electrónico del usuario",
      example: "juan.perez@example.com",
    },
  },
  required: ["userId", "name", "email"],
} as const;

export const AddressSchema = {
  type: "object",
  properties: {
    addressId: {
      type: "string",
      description: "ID único de la dirección",
      example: "addr-123",
    },
    userId: {
      type: "string",
      description: "ID del usuario propietario",
      example: "550e8400-e29b-41d4-a716-446655440000",
    },
    street: {
      type: "string",
      description: "Calle y número",
      example: "Av. Principal 123",
    },
    city: {
      type: "string",
      description: "Ciudad",
      example: "Ciudad de México",
    },
  },
  required: ["addressId", "userId", "street", "city"],
} as const;

export const PaymentMethodSchema = {
  type: "object",
  properties: {
    paymentId: {
      type: "string",
      format: "uuid",
      description: "ID único del método de pago",
      example: "3f7f3f9c-3859-42b8-a8f8-9ab6f99886f3",
    },
    userId: {
      type: "string",
      description: "ID del usuario propietario",
      example: "550e8400-e29b-41d4-a716-446655440000",
    },
    type: {
      type: "string",
      enum: ["credit", "debit", "paypal", "cash"],
      description: "Tipo de método de pago",
      example: "credit",
    },
    last4: {
      type: "string",
      pattern: "^\\d{4}$",
      description: "Últimos 4 dígitos de la tarjeta (solo para tarjetas)",
      example: "1234",
      nullable: true,
    },
  },
  required: ["paymentId", "userId", "type"],
} as const;

// Schemas para requests (sin IDs generados automáticamente)
export const CreateProfileRequestSchema = {
  type: "object",
  properties: {
    name: {
      type: "string",
      description: "Nombre completo del usuario",
      example: "Juan Pérez",
    },
    email: {
      type: "string",
      format: "email",
      description: "Correo electrónico del usuario",
      example: "juan.perez@example.com",
    },
  },
  required: ["name", "email"],
} as const;

export const AddAddressRequestSchema = {
  type: "object",
  properties: {
    addressId: {
      type: "string",
      description: "ID único de la dirección (proporcionado por cliente)",
      example: "addr-123",
    },
    street: {
      type: "string",
      description: "Calle y número",
      example: "Av. Principal 123",
    },
    city: {
      type: "string",
      description: "Ciudad",
      example: "Ciudad de México",
    },
  },
  required: ["addressId", "street", "city"],
} as const;

export const AddPaymentRequestSchema = {
  type: "object",
  properties: {
    type: {
      type: "string",
      enum: ["credit", "debit", "paypal", "cash"],
      description: "Tipo de método de pago",
      example: "credit",
    },
    last4: {
      type: "string",
      pattern: "^\\d{4}$",
      description: "Últimos 4 dígitos (solo para tarjetas)",
      example: "1234",
    },
  },
  required: ["type"],
} as const;

export const UserDashboardSchema = {
  type: "object",
  properties: {
    profile: {
      $ref: "#/components/schemas/User",
    },
    addresses: {
      type: "array",
      items: {
        $ref: "#/components/schemas/Address",
      },
    },
    payments: {
      type: "array",
      items: {
        $ref: "#/components/schemas/PaymentMethod",
      },
    },
    orders: {
      type: "array",
      items: {
        $ref: "#/components/schemas/Order",
      },
    },
  },
  required: ["profile", "addresses", "payments", "orders"],
} as const;

