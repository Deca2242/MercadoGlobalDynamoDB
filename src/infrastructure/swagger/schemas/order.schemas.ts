/**
 * Schemas OpenAPI para Order y OrderItem
 * Basados en los validadores Zod del dominio
 */

export const OrderStatusEnum = {
  type: "string",
  enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
  description: "Estado del pedido",
  example: "pending",
} as const;

export const OrderSchema = {
  type: "object",
  properties: {
    orderId: {
      type: "string",
      description: "ID único del pedido",
      example: "ord-789",
    },
    userId: {
      type: "string",
      description: "ID del usuario que realizó el pedido",
      example: "550e8400-e29b-41d4-a716-446655440000",
    },
    status: {
      $ref: "#/components/schemas/OrderStatus",
    },
    total: {
      type: "number",
      format: "float",
      description: "Total del pedido (calculado automáticamente)",
      example: 1250.5,
    },
    date: {
      type: "string",
      format: "date-time",
      description: "Fecha del pedido (ISO 8601)",
      example: "2024-01-15T10:30:00Z",
    },
    shippingAddress: {
      type: "string",
      description: "Dirección de envío (ID de la dirección o texto)",
      example: "addr-123",
    },
  },
  required: ["orderId", "userId", "status", "shippingAddress"],
} as const;

export const OrderItemSchema = {
  type: "object",
  properties: {
    orderId: {
      type: "string",
      description: "ID del pedido al que pertenece (opcional al crear)",
      example: "ord-789",
    },
    productSlug: {
      type: "string",
      description: "Identificador único del producto",
      example: "laptop-dell-xps-13",
    },
    productName: {
      type: "string",
      description: "Nombre del producto",
      example: "Laptop Dell XPS 13",
    },
    qty: {
      type: "integer",
      minimum: 1,
      description: "Cantidad",
      example: 2,
    },
    unitPrice: {
      type: "number",
      format: "float",
      minimum: 0.01,
      description: "Precio unitario",
      example: 1250.5,
    },
    subtotal: {
      type: "number",
      format: "float",
      description: "Subtotal (qty * unitPrice, calculado automáticamente)",
      example: 2501.0,
    },
  },
  required: ["productSlug", "productName", "qty", "unitPrice"],
} as const;

// Schemas para requests
export const CreateOrderRequestSchema = {
  type: "object",
  properties: {
    orderId: {
      type: "string",
      description: "ID único del pedido (proporcionado por cliente)",
      example: "ord-789",
    },
    userId: {
      type: "string",
      description: "ID del usuario",
      example: "550e8400-e29b-41d4-a716-446655440000",
    },
    status: {
      $ref: "#/components/schemas/OrderStatus",
    },
    shippingAddress: {
      type: "string",
      description: "Dirección de envío",
      example: "addr-123",
    },
    total: {
      type: "number",
      description: "Total opcional (si no se proporciona, se calcula)",
      example: 1250.5,
    },
    date: {
      type: "string",
      format: "date-time",
      description: "Fecha opcional (ISO 8601)",
      example: "2024-01-15T10:30:00Z",
    },
  },
  required: ["orderId", "userId", "status", "shippingAddress"],
} as const;

export const CreateOrderItemRequestSchema = {
  type: "object",
  properties: {
    productSlug: {
      type: "string",
      description: "Identificador único del producto",
      example: "laptop-dell-xps-13",
    },
    productName: {
      type: "string",
      description: "Nombre del producto",
      example: "Laptop Dell XPS 13",
    },
    qty: {
      type: "integer",
      minimum: 1,
      description: "Cantidad",
      example: 2,
    },
    unitPrice: {
      type: "number",
      format: "float",
      minimum: 0.01,
      description: "Precio unitario",
      example: 1250.5,
    },
  },
  required: ["productSlug", "productName", "qty", "unitPrice"],
} as const;

export const CreateOrderInputSchema = {
  type: "object",
  properties: {
    order: {
      $ref: "#/components/schemas/CreateOrderRequest",
    },
    items: {
      type: "array",
      items: {
        $ref: "#/components/schemas/CreateOrderItemRequest",
      },
      minItems: 1,
      description: "Al menos un item es requerido",
    },
  },
  required: ["order", "items"],
} as const;

export const UpdateOrderStatusRequestSchema = {
  type: "object",
  properties: {
    newStatus: {
      $ref: "#/components/schemas/OrderStatus",
    },
  },
  required: ["newStatus"],
} as const;

export const OrderDetailSchema = {
  type: "object",
  properties: {
    order: {
      $ref: "#/components/schemas/Order",
    },
    items: {
      type: "array",
      items: {
        $ref: "#/components/schemas/OrderItem",
      },
    },
  },
  required: ["order", "items"],
} as const;
