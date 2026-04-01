import { Request, Response } from "express";
export declare const getAllTenants: (req: Request, res: Response) => Promise<void>;
export declare const createTenant: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getTenantById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateTenant: (req: Request, res: Response) => Promise<void>;
export declare const suspendTenant: (req: Request, res: Response) => Promise<void>;
export declare const deleteTenant: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
