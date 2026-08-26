import { ZodType } from "zod";
import { ApiError } from "./ApiError";

export function parseWithSchema<T>(schema: ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);

  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      field: issue.path.join(".") || "value",
      message: issue.message,
    }));
    throw new ApiError(400, "Validation failed", errors);
  }

  return result.data;
}
