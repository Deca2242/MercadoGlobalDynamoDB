/**
 * Configuración central de OpenAPI/Swagger
 * Ensambla el spec completo desde schemas y paths modulares
 */

import { userPaths } from "./paths/user.paths";
import { orderPaths } from "./paths/order.paths";
import {
  UserSchema,
  AddressSchema,
  PaymentMethodSchema,
  CreateProfileRequestSchema,
  AddAddressRequestSchema,
  AddPaymentRequestSchema,
  UserDashboardSchema,
} from "./schemas/user.schemas";
import {
  OrderSchema,
  OrderItemSchema,
  OrderStatusEnum,
  CreateOrderRequestSchema,
  CreateOrderItemRequestSchema,
  CreateOrderInputSchema,
  UpdateOrderStatusRequestSchema,
  OrderDetailSchema,
} from "./schemas/order.schemas";
import {
  ErrorSchema,
  NotFoundErrorSchema,
  ConflictErrorSchema,
} from "./schemas/error.schemas";

/**
 * Spec OpenAPI 3.0 completo
 */
export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "MercadoGlobal API",
    description: `API RESTful para la gestión de usuarios y pedidos de MercadoGlobal.

Esta API implementa arquitectura hexagonal y utiliza DynamoDB como base de datos NoSQL.

## Recursos principales:
- **Usuarios**: Gestión de perfiles, direcciones y métodos de pago
- **Pedidos**: Creación y seguimiento de órdenes de compra

## Estados de pedido:
- \`pending\` - Pendiente
- \`processing\` - En proceso
- \`shipped\` - Enviado
- \`delivered\` - Entregado
- \`cancelled\` - Cancelado`,
    version: "1.0.0",
    contact: {
      name: "Equipo de Desarrollo",
    },
    license: {
      name: "MIT",
    },
  },
  servers: [
    {
      url: "http://localhost:3000/api",
      description: "Servidor de desarrollo local",
    },
  ],
  tags: [
    {
      name: "Usuarios",
      description: "Operaciones relacionadas con la gestión de usuarios y sus datos",
    },
    {
      name: "Direcciones",
      description: "Gestión de direcciones de envío de usuarios",
    },
    {
      name: "Métodos de Pago",
      description: "Gestión de métodos de pago de usuarios",
    },
    {
      name: "Pedidos",
      description: "Operaciones de creación y consulta de pedidos",
    },
    {
      name: "Items",
      description: "Gestión de items dentro de un pedido",
    },
  ],
  paths: {
    ...userPaths,
    ...orderPaths,
  },
  components: {
    schemas: {
      // User schemas
      User: UserSchema,
      Address: AddressSchema,
      PaymentMethod: PaymentMethodSchema,
      CreateProfileRequest: CreateProfileRequestSchema,
      AddAddressRequest: AddAddressRequestSchema,
      AddPaymentRequest: AddPaymentRequestSchema,
      UserDashboard: UserDashboardSchema,

      // Order schemas
      Order: OrderSchema,
      OrderItem: OrderItemSchema,
      OrderStatus: OrderStatusEnum,
      CreateOrderRequest: CreateOrderRequestSchema,
      CreateOrderItemRequest: CreateOrderItemRequestSchema,
      CreateOrderInput: CreateOrderInputSchema,
      UpdateOrderStatusRequest: UpdateOrderStatusRequestSchema,
      OrderDetail: OrderDetailSchema,

      // Error schemas
      Error: ErrorSchema,
      NotFoundError: NotFoundErrorSchema,
      ConflictError: ConflictErrorSchema,
    },
  },
} as const;

// Exportar también como objeto mutable para Swagger UI
export type OpenApiSpecType = typeof openApiSpec;
