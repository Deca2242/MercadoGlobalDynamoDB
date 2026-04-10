/**
 * Documentación OpenAPI para endpoints de Usuarios
 * Ruta base: /api/users
 */

export const userPaths = {
  "/users": {
    post: {
      summary: "Crear perfil de usuario",
      description: "Crea un nuevo usuario con perfil, direcciones, métodos de pago e historial de órdenes.",
      tags: ["Usuarios"],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/CreateProfileRequest",
            },
          },
        },
      },
      responses: {
        "201": {
          description: "Usuario creado exitosamente",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/User",
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
        "409": {
          description: "El usuario ya existe",
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

  "/users/{userId}/profile": {
    get: {
      summary: "Obtener perfil de usuario",
      description: "Retorna los datos básicos del usuario.",
      tags: ["Usuarios"],
      parameters: [
        {
          name: "userId",
          in: "path",
          required: true,
          description: "ID del usuario",
          schema: {
            type: "string",
          },
        },
      ],
      responses: {
        "200": {
          description: "Perfil del usuario",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/User",
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
      },
    },
  },

  "/users/{userId}/dashboard": {
    get: {
      summary: "Obtener dashboard completo",
      description: "Retorna el usuario con todas sus direcciones, métodos de pago y órdenes.",
      tags: ["Usuarios"],
      parameters: [
        {
          name: "userId",
          in: "path",
          required: true,
          description: "ID del usuario",
          schema: {
            type: "string",
          },
        },
      ],
      responses: {
        "200": {
          description: "Dashboard completo del usuario",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UserDashboard",
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
      },
    },
  },

  "/users/{userId}/addresses": {
    get: {
      summary: "Listar direcciones del usuario",
      description: "Retorna todas las direcciones asociadas al usuario.",
      tags: ["Direcciones"],
      parameters: [
        {
          name: "userId",
          in: "path",
          required: true,
          description: "ID del usuario",
          schema: {
            type: "string",
          },
        },
      ],
      responses: {
        "200": {
          description: "Lista de direcciones",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: {
                  $ref: "#/components/schemas/Address",
                },
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
      },
    },
    post: {
      summary: "Agregar dirección al usuario",
      description: "Añade una nueva dirección al perfil del usuario.",
      tags: ["Direcciones"],
      parameters: [
        {
          name: "userId",
          in: "path",
          required: true,
          description: "ID del usuario",
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
              $ref: "#/components/schemas/AddAddressRequest",
            },
          },
        },
      },
      responses: {
        "201": {
          description: "Dirección agregada exitosamente",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Address",
              },
            },
          },
        },
        "400": {
          description: "Datos inválidos",
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
          description: "La dirección ya existe",
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

  "/users/{userId}/addresses/{addressId}": {
    delete: {
      summary: "Eliminar dirección del usuario",
      description: "Elimina una dirección específica del perfil del usuario.",
      tags: ["Direcciones"],
      parameters: [
        {
          name: "userId",
          in: "path",
          required: true,
          description: "ID del usuario",
          schema: {
            type: "string",
          },
        },
        {
          name: "addressId",
          in: "path",
          required: true,
          description: "ID de la dirección a eliminar",
          schema: {
            type: "string",
          },
        },
      ],
      responses: {
        "204": {
          description: "Dirección eliminada exitosamente",
        },
        "404": {
          description: "Usuario o dirección no encontrados",
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

  "/users/{userId}/payments": {
    get: {
      summary: "Listar métodos de pago del usuario",
      description: "Retorna todos los métodos de pago asociados al usuario.",
      tags: ["Métodos de Pago"],
      parameters: [
        {
          name: "userId",
          in: "path",
          required: true,
          description: "ID del usuario",
          schema: {
            type: "string",
          },
        },
      ],
      responses: {
        "200": {
          description: "Lista de métodos de pago",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: {
                  $ref: "#/components/schemas/PaymentMethod",
                },
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
      },
    },
    post: {
      summary: "Agregar método de pago al usuario",
      description: "Añade un nuevo método de pago al perfil del usuario.",
      tags: ["Métodos de Pago"],
      parameters: [
        {
          name: "userId",
          in: "path",
          required: true,
          description: "ID del usuario",
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
              $ref: "#/components/schemas/AddPaymentRequest",
            },
          },
        },
      },
      responses: {
        "201": {
          description: "Método de pago agregado exitosamente",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/PaymentMethod",
              },
            },
          },
        },
        "400": {
          description: "Datos inválidos",
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
          description: "El método de pago ya existe",
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

  "/users/{userId}/payments/{paymentId}": {
    delete: {
      summary: "Eliminar método de pago del usuario",
      description: "Elimina un método de pago específico del perfil del usuario.",
      tags: ["Métodos de Pago"],
      parameters: [
        {
          name: "userId",
          in: "path",
          required: true,
          description: "ID del usuario",
          schema: {
            type: "string",
          },
        },
        {
          name: "paymentId",
          in: "path",
          required: true,
          description: "ID del método de pago a eliminar",
          schema: {
            type: "string",
          },
        },
      ],
      responses: {
        "204": {
          description: "Método de pago eliminado exitosamente",
        },
        "404": {
          description: "Usuario o método de pago no encontrados",
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

  "/users/{userId}/orders": {
    get: {
      summary: "Listar órdenes del usuario",
      description: "Retorna todas las órdenes del usuario, opcionalmente filtradas por estado.",
      tags: ["Usuarios", "Pedidos"],
      parameters: [
        {
          name: "userId",
          in: "path",
          required: true,
          description: "ID del usuario",
          schema: {
            type: "string",
          },
        },
        {
          name: "status",
          in: "query",
          required: false,
          description: "Filtrar por estado del pedido",
          schema: {
            type: "string",
            enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
          },
        },
      ],
      responses: {
        "200": {
          description: "Lista de órdenes",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: {
                  $ref: "#/components/schemas/Order",
                },
              },
            },
          },
        },
        "400": {
          description: "Estado de filtro inválido",
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
      },
    },
  },
} as const;
