import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../utils/prisma";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { parseWithSchema } from "../utils/validate";
import { loginSchema } from "../validators/auth_schema";
import { AUTH_COOKIE_NAME, signAuthToken } from "../utils/jwt";
import { env } from "../config";

const COOKIE_MAX_AGE_MS = 8 * 60 * 60 * 1000;

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { username, password } = parseWithSchema(loginSchema, req.body);

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) {
    throw new ApiError(401, "Invalid username or password");
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    throw new ApiError(401, "Invalid username or password");
  }

  const token = signAuthToken({ id: user.id, username: user.username });

  res.cookie(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    maxAge: COOKIE_MAX_AGE_MS,
  });

  res.json({ success: true, message: "Logged in successfully", data: { username: user.username } });
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie(AUTH_COOKIE_NAME);
  res.json({ success: true, message: "Logged out successfully" });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  res.json({ success: true, data: { username: req.user?.username } });
});
