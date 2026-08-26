import jwt from "jsonwebtoken";
import { env } from "../config";
import { AuthUser } from "../express";

const EXPIRES_IN = "8h";
export const AUTH_COOKIE_NAME = "token";

export function signAuthToken(user: AuthUser): string {
  return jwt.sign({ sub: user.id, username: user.username }, env.JWT_SECRET, {
    expiresIn: EXPIRES_IN,
  });
}

export function verifyAuthToken(token: string): AuthUser {
  const payload = jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload;
  return { id: payload.sub as string, username: payload.username as string };
}
