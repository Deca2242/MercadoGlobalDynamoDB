/**
 * Documentación OpenAPI para endpoints de Pedidos/Órdenes
 * Ruta base: /api/orders
 */

export const orderPaths = {
  "/orders": {
    post: {
      summary: "Crear pedido",
      description: "Crea un nuevo pedido con sus items. El total se calcula automáticamente si no se proporciona.",
      tags: ["Pedidos"],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/CreateOrderInput",
            },
          },
        },
      },
      responses: {
        "201": {
          description: "Pedido creado exitosamente",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/OrderDetail",
              },
            },
          },
        },
        "400": {
          description: "Datos de entrada inválidos",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
            },
          },
        },
        "404": {
          description: "Usuario no encontrado",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/NotFoundError",
              },
            },
          },
        },
        "409": {
          description: "El pedido ya existe",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ConflictError",
              },
            },
          },
        },
      },
    },
  },

  "/orders/{orderId}": {
    get: {
      summary: "Obtener encabezado del pedido",
      description: "Retorna los datos básicos del pedido (sin items).",
      tags: ["Pedidos"],
      parameters: [
        {
          name: "orderId",
          in: "path",
          required: true,
          description: "ID del pedido",
          schema: {
            type: "string",
          },
        },
      ],
      responses: {
        "200": {
          description: "Encabezado del pedido",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Order",
              },
            },
          },
        },
        "404": {
          description: "Pedido no encontrado",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/NotFoundError",
              },
            },
          },
        },
      },
    },
  },

  "/orders/{orderId}/items": {
    get: {
      summary: "Listar items del pedido",
      description: "Retorna todos los items asociados a un pedido.",
      tags: ["Pedidos", "Items"],
      parameters: [
        {
          name: "orderId",
          in: "path",
          required: true,
          description: "ID del pedido",
          schema: {
            type: "string",
          },
        },
      ],
      responses: {
        "200": {
          description: "Lista de items del pedido",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: {
                  $ref: "#/components/schemas/OrderItem",
                },
              },
            },
          },
        },
        "404": {
          description: "Pedido no encontrado",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/NotFoundError",
              },
            },
          },
        },
      },
    },
  },

  "/orders/{orderId}/detail": {
    get: {
      summary: "Obtener detalle completo del pedido",
      description: "Retorna el pedido completo incluyendo sus items.",
      tags: ["Pedidos"],
      parameters: [
        {
          name: "orderId",
          in: "path",
          required: true,
          description: "ID del pedido",
          schema: {
            type: "string",
          },
        },
      ],
      responses: {
        "200": {
          description: "Detalle completo del pedido",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/OrderDetail",
              },
            },
          },
        },
        "404": {
          description: "Pedido no encontrado",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/NotFoundError",
              },
            },
          },
        },
      },
    },
  },

  "/orders/{orderId}/status": {
    patch: {
      summary: "Actualizar estado del pedido",
      description: "Actualiza el estado de un pedido existente.",
      tags: ["Pedidos"],
      parameters: [
        {
          name: "orderId",
          in: "path",
          required: true,
          description: "ID del pedido",
          schema: {
            type: "string",
          },
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/UpdateOrderStatusRequest",
            },
          },
        },
      },
      responses: {
        "200": {
          description: "Estado actualizado exitosamente",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  orderId: {
                    type: "string",
                  },
                  newStatus: {
                    type: "string",
                  },
                },
              },
            },
          },
        },
        "400": {
          description: "Estado inválido",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
            },
          },
        },
        "404": {
          description: "Pedido no encontrado",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/NotFoundError",
              },
            },
          },
        },
      },
    },
  },
} as const;
