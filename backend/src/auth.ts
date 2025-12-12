import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import 'dotenv/config' 
import { AppDataSource } from "data-source";
import { User } from "model/User";

const JWT_SECRET: string = process.env.JWT_SECRET as string;
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
}
const JWT_EXPIRES_IN = "1h";

const userRepo = AppDataSource.getRepository(User);

export type AuthTokenPayload = {
  userId: number;
  login: string;
  role: "KLIENT" | "PRACOWNIK";
};

export function generateToken(payload: AuthTokenPayload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}
export function authRequired(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(StatusCodes.UNAUTHORIZED).send({
      message: "Missing or invalid Authorization token",
    });
  }

  const parts = authHeader.split(" ");

  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(StatusCodes.UNAUTHORIZED).send({
      message: "Invalid Authorization header format",
    });
  }

  const token: string = parts[1]!;

  try {
    const decoded = jwt.verify(
      token,
      JWT_SECRET
    ) as unknown as AuthTokenPayload;

    (req as any).user = decoded;

    next();
  } catch {
    return res.status(StatusCodes.UNAUTHORIZED).send({
      message: "Invalid or expired token",
    });
  }
}

export function roleRequired(role: "KLIENT" | "PRACOWNIK") {
  return async function (req: Request, res: Response, next: NextFunction) {
    const payload = (req as any).user as AuthTokenPayload;
    if (!payload) {
      return res.status(StatusCodes.UNAUTHORIZED).send({
        message: "Authentication required",
      });
    }
    const user = await userRepo.findOne({
        where: {id:payload.userId}
    })
    if (!user) {
      return res.status(StatusCodes.UNAUTHORIZED).send({
        message: "Authentication required",
      });
    }
    if (user.role != role) {
      return res.status(StatusCodes.FORBIDDEN).send({
        message: `Insufficient permissions. You are ${user.role}, required ${role}`,
      });
    }
    next();
  };
}
