import type { FieldError } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export class ApiRequestError extends Error {
  status: number;
  fieldErrors?: FieldError[];

  constructor(status: number, message: string, fieldErrors?: FieldError[]) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: FieldError[];
  pagination?: unknown;
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<ApiEnvelope<T>> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const body = (await res.json().catch(() => ({}))) as ApiEnvelope<T>;

  if (!res.ok) {
    throw new ApiRequestError(res.status, body.message ?? "Something went wrong", body.errors);
  }

  return body;
}
