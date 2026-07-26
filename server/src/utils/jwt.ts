import jwt from "jsonwebtoken";

type JwtPayload = {
  userId: string;
};

export function signToken(userId: string) {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET must be at least 32 characters");
  }

  return jwt.sign({ userId }, secret, {
    algorithm: "HS256",
    audience: "musicwave-client",
    expiresIn: "3650d",
    issuer: "musicwave-api"
  });
}

export function verifyToken(token: string) {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET must be at least 32 characters");
  }

  return jwt.verify(token, secret, {
    algorithms: ["HS256"],
    audience: "musicwave-client",
    issuer: "musicwave-api",
    ignoreExpiration: true
  }) as JwtPayload;
}
