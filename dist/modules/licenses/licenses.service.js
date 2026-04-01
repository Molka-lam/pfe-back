"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAuditLog = exports.invalidateCache = exports.setLicenseInCache = exports.getLicenseFromCache = exports.generateLicenseKey = void 0;
const crypto_1 = __importDefault(require("crypto"));
const database_1 = require("../../config/database");
const redis_1 = require("../../config/redis");
const REDIS_TTL = parseInt(process.env.REDIS_TTL || "300");
const generateLicenseKey = (plan) => {
    const prefix = plan.toUpperCase().substring(0, 3);
    const random = crypto_1.default.randomBytes(8).toString("hex").toUpperCase();
    // Format: PRO-ABCD-1234-EFGH-5678
    const chunks = random.match(/.{1,4}/g) || [];
    return `${prefix}-${chunks.join("-")}`;
};
exports.generateLicenseKey = generateLicenseKey;
const getLicenseFromCache = async (tenantId) => {
    if (!redis_1.redis.isOpen) {
        return null;
    }
    try {
        const data = await redis_1.redis.get(`license:${tenantId}`);
        return data ? JSON.parse(data) : null;
    }
    catch {
        return null;
    }
};
exports.getLicenseFromCache = getLicenseFromCache;
const setLicenseInCache = async (tenantId, license) => {
    if (!redis_1.redis.isOpen) {
        return;
    }
    try {
        await redis_1.redis.setEx(`license:${tenantId}`, REDIS_TTL, JSON.stringify(license));
    }
    catch {
        // Cache failures should not break business logic.
    }
};
exports.setLicenseInCache = setLicenseInCache;
const invalidateCache = async (tenantId) => {
    if (!redis_1.redis.isOpen) {
        return;
    }
    try {
        await redis_1.redis.del(`license:${tenantId}`);
    }
    catch {
        // Cache failures should not break business logic.
    }
};
exports.invalidateCache = invalidateCache;
const createAuditLog = async (licenseId, action, performedBy, oldStatus, newStatus, metadata) => {
    return database_1.prisma.licenseAudit.create({
        data: {
            license_id: licenseId,
            action,
            performed_by: performedBy,
            old_status: oldStatus,
            new_status: newStatus,
            metadata,
        },
    });
};
exports.createAuditLog = createAuditLog;
//# sourceMappingURL=licenses.service.js.map