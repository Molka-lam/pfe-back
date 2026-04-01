import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./authenticate";
export declare const requireAdmin: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
