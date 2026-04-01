import { Response } from "express";
import { prisma } from "../../config/database";
import { AuthenticatedRequest } from "../../middlewares/authenticate";

export const getUsage = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tenantId = Array.isArray(req.params.tenantId)
      ? req.params.tenantId[0]
      : req.params.tenantId;

    if (!tenantId) {
      return res.status(400).json({ error: "Tenant ID is required" });
    }

    // Check if the user is from the same tenant or is admin
    if (req.user!.role !== "admin" && req.user!.tenant_id !== tenantId) {
      return res.status(403).json({ error: "Forbidden: You cannot access other tenant's usage" });
    }

    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);

    // Sum api_calls and get latest storage_gb from usage_logs for the current month
    const logs = await prisma.usageLog.findMany({
      where: {
        tenant_id: tenantId,
        created_at: { gte: firstDay },
      },
    });

    const totalCalls = logs.reduce((sum: number, log: any) => sum + log.api_calls, 0);
    const lastLog = logs.length > 0 ? logs[logs.length - 1] : null;
    const currentStorage = lastLog ? (lastLog as any).storage_gb : 0;

    // Get limits from License
    const license = await prisma.license.findFirst({
      where: { tenant_id: tenantId, status: "active" },
    });

    res.json({
      data: {
        tenant_id: tenantId,
        api_calls_used: totalCalls,
        api_calls_limit: license ? (license.limits as any).api_calls_per_month : 0,
        users_count: await prisma.user.count({ where: { tenant_id: tenantId } }),
        users_limit: license ? (license.limits as any).max_users : 0,
        storage_used_gb: currentStorage,
        storage_limit_gb: license ? (license.limits as any).storage_gb : 0,
        period_start: firstDay.toISOString(),
        period_end: new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString(),
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch usage stats" });
  }
};

export const incrementUsage = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenant_id;
    if (!tenantId) return res.status(400).json({ error: "User has no associate tenant" });

    const log = await prisma.usageLog.create({
      data: {
        tenant_id: tenantId,
        api_calls: 1,
      },
    });

    res.status(201).json({ data: log });
  } catch (error) {
    res.status(500).json({ error: "Failed to increment usage" });
  }
};
