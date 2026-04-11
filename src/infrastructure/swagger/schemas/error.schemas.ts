/**
 * Schemas OpenAPI para respuestas de error
 */

export const ErrorSchema = {
  type: "object",
  properties: {
    error: {
      type: "string",
      description: "Mensaje descriptivo del error",
      example: "Datos de entrada inválidos",
    },
  },
  required: ["error"],
} as const;

export const NotFoundErrorSchema = {
  type: "object",
  properties: {
    error: {
      type: "string",
      example: "User 'abc' not found",
    },
  },
  required: ["error"],
} as const;

export const ConflictErrorSchema = {
  type: "object",
  properties: {
    error: {
      type: "string",
      example: "Resource conflict",
    },
  },
  required: ["error"],
} as const;

