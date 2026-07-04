import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError.js";
import { verifyToken } from "../utils/jwt.js";
import { prisma } from "../utils/prisma.js";

export type AuthRequest = Request & {
  user?: {
    id: string;
    name: string;
    email: string;
    emailVerifiedAt: Date | null;
    languagePreferences: string[];
  };
};

export async function requireAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      throw new ApiError(401, "Authentication required");
    }

    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, name: true, email: true, emailVerifiedAt: true, languagePreferences: true }
    });

    if (!user) {
      throw new ApiError(401, "Invalid authentication token");
    }

    if (!user.emailVerifiedAt) {
      throw new ApiError(403, "Verify your email before continuing");
    }

    req.user = user;
    next();
  } catch (error) {
    next(error instanceof ApiError ? error : new ApiError(401, "Invalid authentication token"));
  }
}
