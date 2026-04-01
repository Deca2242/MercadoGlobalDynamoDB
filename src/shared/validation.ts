import { z } from "zod";
import { BadRequestError } from "./AppError";

export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const messages = result.error.issues
      .map((e) => `${e.path.join(".")}: ${e.message}`)
      .join("; ");
    throw new BadRequestError(messages);
  }
  return result.data;
}
