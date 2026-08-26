import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { AUTH_COOKIE_NAME, verifyAuthToken } from "../utils/jwt";

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies?.[AUTH_COOKIE_NAME];

  if (!token) {
    throw new ApiError(401, "Not authenticated");
  }

  try {
    req.user = verifyAuthToken(token);
    next();
  } catch {
    throw new ApiError(401, "Invalid or expired session");
  }
}
