import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../../config/database";

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      include: { tenant: { select: { name: true } } },
      orderBy: { created_at: "desc" },
    });
    // Remove password hashes from response
    const safeUsers = users.map((u: any) => {
      const { password_hash, refresh_token, ...safeUser } = u;
      return safeUser;
    });
    res.json({ data: safeUsers });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, tenant_id, tenantId } = req.body;
    const finalTenantId = tenant_id || tenantId;

    if (!name || !email || !password || !finalTenantId) {
      return res.status(400).json({ error: "Missing required fields (name, email, password, tenant_id)" });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { 
        name, 
        email, 
        password_hash, 
        role: role || "client", 
        tenant_id: finalTenantId 
      },
    });

    const { password_hash: _, ...safeUser } = user;
    return res.status(201).json({ data: safeUser });
  } catch (error: any) {
    console.error("Prisma Error (createUser):", error);
    if (error.code === "P2002") {
      return res.status(400).json({ error: "Email already exists" });
    }
    return res.status(500).json({ error: "Failed to create user" });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const user = await prisma.user.findUnique({
      where: { id },
      include: { tenant: true },
    });
    if (!user) return res.status(404).json({ error: "User not found" });

    const { password_hash, refresh_token, ...safeUser } = user;
    res.json({ data: safeUser });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
};

export const toggleUser = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const updated = await prisma.user.update({
      where: { id },
      data: { is_active: !user.is_active },
    });

    res.json({ data: { id: updated.id, is_active: updated.is_active } });
  } catch (error) {
    res.status(500).json({ error: "Failed to toggle user status" });
  }
};
