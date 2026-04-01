import { Response } from "express";
import { AuthenticatedRequest } from "../../middlewares/authenticate";
export declare const createRenewalRequest: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getRenewalRequests: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateRenewalRequestStatus: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteRenewalRequest: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const bulkDeleteRenewalRequests: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deleteAllRenewalRequests: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
