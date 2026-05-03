import type { Request, Response, NextFunction } from "express";
import { auth } from "../lib/auth.js";
import { fromNodeHeaders } from "better-auth/node";
import type { AuthenticatedRequest } from "../types/index.js";
import { AppError } from "../types/index.js";

export async function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      throw new AppError(401, "Authentication required");
    }

    (req as AuthenticatedRequest).user =
      session.user as AuthenticatedRequest["user"];
    (req as AuthenticatedRequest).session =
      session.session as AuthenticatedRequest["session"];

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
      return;
    }
    next(new AppError(401, "Authentication required"));
  }
}

export async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      throw new AppError(401, "Authentication required");
    }

    if (session.user.role !== "ADMIN") {
      throw new AppError(403, "Admin access required");
    }

    (req as AuthenticatedRequest).user =
      session.user as AuthenticatedRequest["user"];
    (req as AuthenticatedRequest).session =
      session.session as AuthenticatedRequest["session"];

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
      return;
    }
    next(new AppError(401, "Authentication required"));
  }
}

export async function requireManagerOrAdmin(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      throw new AppError(401, "Authentication required");
    }

    if (!["ADMIN", "MANAGER"].includes(session.user.role)) {
      throw new AppError(403, "Manager or admin access required");
    }

    (req as AuthenticatedRequest).user =
      session.user as AuthenticatedRequest["user"];
    (req as AuthenticatedRequest).session =
      session.session as AuthenticatedRequest["session"];

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
      return;
    }
    next(new AppError(401, "Authentication required"));
  }
}

export async function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (session) {
      (req as AuthenticatedRequest).user =
        session.user as AuthenticatedRequest["user"];
      (req as AuthenticatedRequest).session =
        session.session as AuthenticatedRequest["session"];
    }
  } catch {
    // No session, continue without auth
  }
  next();
}
