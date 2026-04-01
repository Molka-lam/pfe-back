import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../config/jwt";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    tenant_id: string;
  };
}

export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1];
  const decoded = verifyAccessToken(token);

  if (!decoded) {
    return res.status(401).json({ error: "Unauthorized: Invalid or expired token" });
  }

  req.user = {
    id: decoded.id,
    email: decoded.email,
    role: decoded.role,
    tenant_id: decoded.tenant_id,
  };

  next();
};
