import { Response } from "express";
import { prisma } from "../../config/database";
import { AuthenticatedRequest } from "../../middlewares/authenticate";

export const createRenewalRequest = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { license_id, message } = req.body;
    const tenant_id = req.user!.tenant_id;

    if (!license_id) {
      return res.status(400).json({ error: "License ID is required" });
    }

    const license = await prisma.license.findUnique({
      where: { id: license_id },
    });

    if (!license || license.tenant_id !== tenant_id) {
      return res.status(404).json({ error: "License not found for this tenant" });
    }

    const request = await prisma.renewalRequest.create({
      data: {
        license_id,
        tenant_id,
        message,
        status: "PENDING",
      },
      include: {
        tenant: { select: { name: true } }
      }
    });

    res.status(201).json({ data: request, message: "Demande de renouvellement envoyée avec succès" });
  } catch (error: any) {
    console.error("Error creating renewal request:", error);
    res.status(500).json({ error: "Failed to create renewal request" });
  }
};

export const getRenewalRequests = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Only admins can see all requests
    if (req.user!.role !== "admin") {
      const tenant_id = req.user!.tenant_id;
      const requests = await prisma.renewalRequest.findMany({
        where: { tenant_id },
        include: {
          license: true,
          tenant: { select: { name: true } }
        },
        orderBy: { created_at: "desc" }
      });
      return res.json({ data: requests });
    }

    const requests = await prisma.renewalRequest.findMany({
      include: {
        license: true,
        tenant: { select: { name: true, email: true } }
      },
      orderBy: { created_at: "desc" }
    });

    res.json({ data: requests });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch renewal requests" });
  }
};

export const updateRenewalRequestStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;

    if (!["APPROVED", "REJECTED", "PENDING"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const request = await prisma.renewalRequest.update({
      where: { id },
      data: { status },
      include: {
        license: true,
        tenant: true
      }
    });

    res.json({ data: request, message: `Request marked as ${status.toLowerCase()}` });
  } catch (error) {
    res.status(500).json({ error: "Failed to update request status" });
  }
};

export const deleteRenewalRequest = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;

    const existing = await prisma.renewalRequest.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Renewal request not found" });
    }

    await prisma.renewalRequest.delete({ where: { id } });

    return res.json({ message: "Renewal request deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Failed to delete renewal request" });
  }
};

export const bulkDeleteRenewalRequests = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { ids } = req.body as { ids?: string[] };

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "ids array is required" });
    }

    const uniqueIds = [...new Set(ids.filter(Boolean))];

    const result = await prisma.renewalRequest.deleteMany({
      where: { id: { in: uniqueIds } },
    });

    return res.json({
      data: { deletedCount: result.count },
      message: `${result.count} renewal request(s) deleted successfully`,
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to bulk delete renewal requests" });
  }
};

export const deleteAllRenewalRequests = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await prisma.renewalRequest.deleteMany({});

    return res.json({
      data: { deletedCount: result.count },
      message: `${result.count} renewal request(s) deleted successfully`,
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to delete all renewal requests" });
  }
};
