/**
 * Schemas OpenAPI para respuestas de error
 */

export const ErrorSchema = {
  type: "object",
  properties: {
    statusCode: {
      type: "integer",
      description: "Código HTTP de error",
      example: 400,
    },
    message: {
      type: "string",
      description: "Mensaje descriptivo del error",
      example: "Datos de entrada inválidos",
    },
    code: {
      type: "string",
      description: "Código de error interno de la aplicación",
      example: "VALIDATION_ERROR",
    },
  },
  required: ["statusCode", "message", "code"],
} as const;

export const NotFoundErrorSchema = {
  type: "object",
  properties: {
    statusCode: {
      type: "integer",
      example: 404,
    },
    message: {
      type: "string",
      example: "Usuario no encontrado",
    },
    code: {
      type: "string",
      example: "NOT_FOUND",
    },
  },
  required: ["statusCode", "message", "code"],
} as const;

export const ConflictErrorSchema = {
  type: "object",
  properties: {
    statusCode: {
      type: "integer",
      example: 409,
    },
    message: {
      type: "string",
      example: "El recurso ya existe",
    },
    code: {
      type: "string",
      example: "CONFLICT",
    },
  },
  required: ["statusCode", "message", "code"],
} as const;
