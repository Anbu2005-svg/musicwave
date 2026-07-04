import bcrypt from "bcryptjs";
import type { Request, Response } from "express";
import { ApiError } from "../utils/ApiError.js";
import { signToken } from "../utils/jwt.js";
import { prisma } from "../utils/prisma.js";
import { languagePreferencesSchema, loginSchema } from "../validators/auth.validators.js";
import type { AuthRequest } from "../middleware/auth.js";

const dummyPasswordHash = "$2a$12$CwTycUXWue0Thq9StjUM0uJ8mF95j4p/PjBn0EyG5TVtGfDW/L7uO";

function publicUser(user: {
  id: string;
  name: string;
  email: string;
  emailVerifiedAt?: Date | null;
  languagePreferences?: string[];
  createdAt?: Date;
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    emailVerified: Boolean(user.emailVerifiedAt),
    languagePreferences: user.languagePreferences ?? [],
    createdAt: user.createdAt
  };
}

export async function login(req: Request, res: Response) {
  const input = loginSchema.parse(req.body);
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  const validPassword = await bcrypt.compare(input.password, user?.passwordHash ?? dummyPasswordHash);

  if (!user || !validPassword) {
    throw new ApiError(401, "Invalid email or password");
  }

  if (!user.emailVerifiedAt) {
    throw new ApiError(403, "Verify your email before signing in");
  }

  res.json({ user: publicUser(user), token: signToken(user.id) });
}

export async function me(req: AuthRequest, res: Response) {
  res.json({ user: req.user });
}

export async function updatePreferences(req: AuthRequest, res: Response) {
  if (!req.user) {
    throw new ApiError(401, "Authentication required");
  }

  const input = languagePreferencesSchema.parse(req.body);
  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: { languagePreferences: input.languages },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerifiedAt: true,
      languagePreferences: true,
      createdAt: true
    }
  });

  res.json({ user: publicUser(user) });
}
