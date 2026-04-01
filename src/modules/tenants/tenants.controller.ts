import { Request, Response } from "express";
import { prisma } from "../../config/database";

export const getAllTenants = async (req: Request, res: Response) => {
  try {
    const tenants = await prisma.tenant.findMany({
      include: { _count: { select: { users: true, licenses: true } } },
      orderBy: { name: "asc" },
    });
    res.json({ data: tenants });
  } catch (error) {
    console.error("Prisma Error (getAllTenants):", error);
    res.status(500).json({ error: "Failed to fetch tenants" });
  }
};

export const createTenant = async (req: Request, res: Response) => {
  try {
    const { name, email, company, phone, address } = req.body;
    if (!name || !email) return res.status(400).json({ error: "Name and email required" });

    const tenant = await prisma.tenant.create({
      data: { name, email, company, phone, address },
    });
    res.status(201).json({ data: tenant });
  } catch (error) {
    console.error("Prisma Error (createTenant):", error);
    res.status(500).json({ error: "Failed to create tenant" });
  }
};

export const getTenantById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const tenant = await prisma.tenant.findUnique({
      where: { id },
      include: { users: true, licenses: true },
    });
    if (!tenant) return res.status(404).json({ error: "Tenant not found" });
    res.json({ data: tenant });
  } catch (error) {
    console.error("Prisma Error (getTenantById):", error);
    res.status(500).json({ error: "Failed to fetch tenant" });
  }
};

export const updateTenant = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const data = req.body;
    const tenant = await prisma.tenant.update({ where: { id }, data });
    res.json({ data: tenant });
  } catch (error) {
    res.status(500).json({ error: "Failed to update tenant" });
  }
};

export const suspendTenant = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const tenant = await prisma.tenant.update({
      where: { id },
      data: { status: "suspended" },
    });
    res.json({ data: tenant, message: "Tenant suspended" });
  } catch (error) {
    res.status(500).json({ error: "Failed to suspend tenant" });
  }
};

export const deleteTenant = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const existing = await prisma.tenant.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Tenant not found" });
    }

    await prisma.tenant.delete({ where: { id } });

    return res.json({ message: "Tenant deleted successfully" });
  } catch (error) {
    console.error("Prisma Error (deleteTenant):", error);
    return res.status(500).json({ error: "Failed to delete tenant" });
  }
};
