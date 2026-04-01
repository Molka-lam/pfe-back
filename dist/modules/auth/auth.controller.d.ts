import { Request, Response } from "express";
import { AuthenticatedRequest } from "../../middlewares/authenticate";
export declare const register: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const login: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const logout: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const refresh: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const me: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
