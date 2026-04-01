"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateLicense = exports.getMyLicense = exports.updateLicense = exports.deleteLicense = exports.suspendLicense = exports.revokeLicense = exports.getLicenseById = exports.createLicense = exports.getAllLicenses = void 0;
const database_1 = require("../../config/database");
const licenseService = __importStar(require("./licenses.service"));
// ADMIN
const getAllLicenses = async (req, res) => {
    try {
        const licenses = await database_1.prisma.license.findMany({
            include: { tenant: { select: { id: true, name: true, email: true } } },
            orderBy: { created_at: "desc" },
        });
        res.json({ data: licenses });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch licenses" });
    }
};
exports.getAllLicenses = getAllLicenses;
const createLicense = async (req, res) => {
    try {
        const { tenant_id, tenantId, plan, expires_at, expiresAt, features, limits } = req.body;
        const finalTenantId = tenant_id || tenantId;
        const finalExpiresAt = expires_at || expiresAt;
        if (!finalTenantId || !plan || !finalExpiresAt) {
            return res.status(400).json({ error: "Missing required fields (tenant_id, plan, expires_at)" });
        }
        const license_key = licenseService.generateLicenseKey(plan);
        console.log(`Creating license for tenant: ${finalTenantId}, plan: ${plan}`);
        const license = await database_1.prisma.license.create({
            data: {
                tenant_id: finalTenantId,
                license_key,
                plan,
                expires_at: new Date(finalExpiresAt),
                features: features || {},
                limits: limits || {},
            },
        });
        // Invalidate cache
        await licenseService.invalidateCache(finalTenantId);
        // Audit log
        if (req.user) {
            await licenseService.createAuditLog(license.id, "created", req.user.id, undefined, "active", { plan, license_key });
        }
        return res.status(201).json({
            data: license,
            message: "License created successfully"
        });
    }
    catch (error) {
        console.error("Prisma Error (createLicense):", {
            message: error.message,
            code: error.code,
            meta: error.meta,
            stack: error.stack
        });
        return res.status(500).json({
            error: "Failed to create license",
            details: error.message
        });
    }
};
exports.createLicense = createLicense;
const getLicenseById = async (req, res) => {
    try {
        const id = req.params.id;
        const license = await database_1.prisma.license.findUnique({
            where: { id },
            include: { tenant: true, audits: true },
        });
        if (!license)
            return res.status(404).json({ error: "License not found" });
        res.json({ data: license });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch license" });
    }
};
exports.getLicenseById = getLicenseById;
const revokeLicense = async (req, res) => {
    try {
        const id = req.params.id;
        const license = await database_1.prisma.license.findUnique({ where: { id } });
        if (!license)
            return res.status(404).json({ error: "License not found" });
        const updated = await database_1.prisma.license.update({
            where: { id },
            data: { status: "expired" },
        });
        await licenseService.invalidateCache(license.tenant_id);
        await licenseService.createAuditLog(id, "revoked", req.user.id, license.status, "expired");
        res.json({ data: updated, message: "License revoked" });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to revoke license" });
    }
};
exports.revokeLicense = revokeLicense;
const suspendLicense = async (req, res) => {
    try {
        const id = req.params.id;
        const license = await database_1.prisma.license.findUnique({ where: { id } });
        if (!license)
            return res.status(404).json({ error: "License not found" });
        const updated = await database_1.prisma.license.update({
            where: { id },
            data: { status: "suspended" },
        });
        await licenseService.invalidateCache(license.tenant_id);
        await licenseService.createAuditLog(id, "suspended", req.user.id, license.status, "suspended");
        res.json({ data: updated, message: "License suspended" });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to suspend license" });
    }
};
exports.suspendLicense = suspendLicense;
const deleteLicense = async (req, res) => {
    try {
        const id = req.params.id;
        const license = await database_1.prisma.license.findUnique({ where: { id } });
        if (!license)
            return res.status(404).json({ error: "License not found" });
        await database_1.prisma.license.delete({ where: { id } });
        await licenseService.invalidateCache(license.tenant_id);
        if (req.user) {
            await licenseService.createAuditLog(id, "deleted", req.user.id, license.status, undefined, { deleted: true });
        }
        return res.json({ message: "License deleted successfully" });
    }
    catch (error) {
        return res.status(500).json({ error: "Failed to delete license" });
    }
};
exports.deleteLicense = deleteLicense;
const updateLicense = async (req, res) => {
    try {
        const id = req.params.id;
        const { plan, expires_at, expiresAt, features, limits, status, notes } = req.body;
        const current = await database_1.prisma.license.findUnique({ where: { id } });
        if (!current)
            return res.status(404).json({ error: "License not found" });
        const finalExpiresAt = expires_at || expiresAt;
        const data = {};
        if (plan)
            data.plan = plan;
        if (finalExpiresAt)
            data.expires_at = new Date(finalExpiresAt);
        if (features)
            data.features = features;
        if (limits)
            data.limits = limits;
        if (status)
            data.status = status;
        if (notes !== undefined)
            data.notes = notes;
        const updated = await database_1.prisma.license.update({
            where: { id },
            data,
        });
        // Invalidate cache
        await licenseService.invalidateCache(current.tenant_id);
        // Audit log
        if (req.user) {
            await licenseService.createAuditLog(id, "updated", req.user.id, current.status, updated.status, { planChanged: plan !== current.plan });
        }
        res.json({ data: updated, message: "License updated successfully" });
    }
    catch (error) {
        console.error("Prisma Error (updateLicense):", error);
        res.status(500).json({ error: "Failed to update license", details: error.message });
    }
};
exports.updateLicense = updateLicense;
// CLIENT
const getMyLicense = async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;
        if (!tenantId)
            return res.status(400).json({ error: "User has no associated tenant" });
        // 1. Check Cache
        const cached = await licenseService.getLicenseFromCache(tenantId);
        if (cached)
            return res.json({ data: cached, _source: "cache" });
        // 2. Query DB
        const license = await database_1.prisma.license.findFirst({
            where: { tenant_id: tenantId },
            orderBy: { created_at: "desc" },
        });
        let finalLicense = license;
        // Auto-provision fallback for legacy tenants created without a license.
        if (!finalLicense) {
            const basicPlan = await database_1.prisma.plan.findUnique({ where: { name: "BASIC" } });
            const defaultFeatures = basicPlan?.features || {
                advanced_ai: false,
                export_pdf: false,
                multi_user: false,
                api_access: true,
            };
            const defaultLimits = basicPlan?.limits || {
                max_users: 5,
                api_calls_per_month: 10000,
                storage_gb: 5,
            };
            const expiresAt = new Date();
            expiresAt.setMonth(expiresAt.getMonth() + 1);
            finalLicense = await database_1.prisma.license.create({
                data: {
                    tenant_id: tenantId,
                    license_key: licenseService.generateLicenseKey("BASIC"),
                    plan: "BASIC",
                    status: "active",
                    expires_at: expiresAt,
                    features: defaultFeatures,
                    limits: defaultLimits,
                    notes: "Auto-provisioned on first client access",
                },
            });
        }
        // 3. Set Cache
        await licenseService.setLicenseInCache(tenantId, finalLicense);
        res.json({ data: finalLicense });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch license" });
    }
};
exports.getMyLicense = getMyLicense;
const validateLicense = async (req, res) => {
    try {
        const { feature, tenant_id, tenantId } = req.body;
        const finalTenantId = tenant_id || tenantId || req.user?.tenant_id;
        if (!finalTenantId) {
            return res.status(400).json({ error: "Tenant ID is required" });
        }
        if (!feature) {
            return res.status(400).json({ error: "Feature name required" });
        }
        console.log(`Validating license for tenant: ${finalTenantId}, feature: ${feature}`);
        let license = await licenseService.getLicenseFromCache(finalTenantId);
        if (!license) {
            license = await database_1.prisma.license.findFirst({
                where: { tenant_id: finalTenantId },
                orderBy: { created_at: "desc" },
            });
            if (license)
                await licenseService.setLicenseInCache(finalTenantId, license);
        }
        if (!license) {
            return res.status(404).json({ allowed: false, reason: "No license found for this tenant" });
        }
        // Check expiration
        if (new Date(license.expires_at) < new Date()) {
            return res.json({ allowed: false, reason: "License expired" });
        }
        // Check status
        if (license.status !== "active") {
            return res.json({ allowed: false, reason: `License is ${license.status}` });
        }
        // Check feature
        const features = license.features || {};
        const isAllowed = features[feature] === true;
        return res.json({
            data: {
                allowed: isAllowed,
                reason: isAllowed ? "Feature allowed" : "Feature not included in plan",
            },
        });
    }
    catch (error) {
        console.error("Prisma Error (validateLicense):", error);
        return res.status(500).json({ error: "Validation failed" });
    }
};
exports.validateLicense = validateLicense;
//# sourceMappingURL=licenses.controller.js.map