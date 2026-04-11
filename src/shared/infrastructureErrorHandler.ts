/**
 * Infrastructure error mapper
 * 
 * Converts AWS SDK errors into domain-level AppError instances
 * to prevent infrastructure-specific errors from leaking to the application layer.
 */

import { AppError, BadRequestError } from "./AppError";

// Common AWS error codes that might occur
const AWS_ERROR_CODES: Record<string, { status: number; message: string }> = {
  ResourceNotFoundException: {
    status: 404,
    message: "Resource not found",
  },
  ConditionalCheckFailedException: {
    status: 409,
    message: "Resource conflict",
  },
  ProvisionedThroughputExceededException: {
    status: 429,
    message: "Too many requests. Please try again later.",
  },
  ValidationException: {
    status: 400,
    message: "Invalid request data",
  },
  UnauthorizedException: {
    status: 401,
    message: "Unauthorized access",
  },
  InternalServerError: {
    status: 500,
    message: "Internal server error",
  },
  RequestLimitExceeded: {
    status: 503,
    message: "Service temporarily unavailable",
  },
};

/**
 * Maps an AWS SDK error to an AppError instance
 * 
 * @param error - The caught error (potentially an AWS SDK error)
 * @returns AppError with appropriate status code and message
 */
export function mapAwsError(error: unknown): AppError {
  // If it's already an AppError, return as-is
  if (error instanceof AppError) {
    return error;
  }

  // Check if it's an AWS SDK error
  if (
    error &&
    typeof error === "object" &&
    "name" in error &&
    "message" in error
  ) {
    const awsError = error as { name: string; message: string };
    const errorMapping = AWS_ERROR_CODES[awsError.name];

    if (errorMapping) {
      return new AppError(
        errorMapping.message,
        errorMapping.status,
      );
    }

    // For unknown AWS errors, log and return generic 500
    console.error("Unknown AWS error:", awsError.name, awsError.message);
    return new AppError("An unexpected error occurred", 500);
  }

  // If it's not an AWS error, rethrow as-is (might be a standard Error)
  if (error instanceof Error) {
    return new AppError(error.message, 500);
  }

  // Fallback for unknown types
  return new AppError("An unexpected error occurred", 500);
}

