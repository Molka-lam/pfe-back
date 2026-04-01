export declare const generateLicenseKey: (plan: string) => string;
export declare const getLicenseFromCache: (tenantId: string) => Promise<any>;
export declare const setLicenseInCache: (tenantId: string, license: any) => Promise<void>;
export declare const invalidateCache: (tenantId: string) => Promise<void>;
export declare const createAuditLog: (licenseId: string, action: string, performedBy: string, oldStatus?: string, newStatus?: string, metadata?: any) => Promise<{
    id: string;
    created_at: Date;
    license_id: string;
    action: string;
    performed_by: string;
    old_status: string | null;
    new_status: string | null;
    metadata: import("@prisma/client/runtime/library").JsonValue | null;
}>;
