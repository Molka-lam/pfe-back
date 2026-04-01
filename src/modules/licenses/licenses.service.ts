import crypto from "crypto";
import { prisma } from "../../config/database";
import { redis } from "../../config/redis";

const REDIS_TTL = parseInt(process.env.REDIS_TTL || "300");

export const generateLicenseKey = (plan: string): string => {
  const prefix = plan.toUpperCase().substring(0, 3);
  const random = crypto.randomBytes(8).toString("hex").toUpperCase();
  // Format: PRO-ABCD-1234-EFGH-5678
  const chunks = random.match(/.{1,4}/g) || [];
  return `${prefix}-${chunks.join("-")}`;
};

export const getLicenseFromCache = async (tenantId: string) => {
  if (!redis.isOpen) {
    return null;
  }

  try {
    const data = await redis.get(`license:${tenantId}`);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

export const setLicenseInCache = async (tenantId: string, license: any) => {
  if (!redis.isOpen) {
    return;
  }

  try {
    await redis.setEx(`license:${tenantId}`, REDIS_TTL, JSON.stringify(license));
  } catch {
    // Cache failures should not break business logic.
  }
};

export const invalidateCache = async (tenantId: string) => {
  if (!redis.isOpen) {
    return;
  }

  try {
    await redis.del(`license:${tenantId}`);
  } catch {
    // Cache failures should not break business logic.
  }
};

export const createAuditLog = async (
  licenseId: string,
  action: string,
  performedBy: string,
  oldStatus?: string,
  newStatus?: string,
  metadata?: any
) => {
  return prisma.licenseAudit.create({
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
