import { Response } from "express";
import { AuthenticatedRequest } from "../../middlewares/authenticate";
export declare const getUsage: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const incrementUsage: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
