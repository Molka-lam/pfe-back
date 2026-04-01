import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../../config/database";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../config/jwt";
import { AuthenticatedRequest } from "../../middlewares/authenticate";
import { generateLicenseKey } from "../licenses/licenses.service";

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, companyName } = req.body;
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

    if (!name || !normalizedEmail || !password) {
      return res.status(400).json({ error: "Name, email and password are required" });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const existingTenant = await prisma.tenant.findUnique({
      where: { email: normalizedEmail },
      include: { _count: { select: { users: true } } },
    });

    if (existingTenant && existingTenant._count.users > 0) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const createdUser = await prisma.$transaction(async (tx) => {
      const tenant = existingTenant
        ? await tx.tenant.update({
            where: { id: existingTenant.id },
            data: {
              name: existingTenant.name || companyName || `${name} workspace`,
              company: companyName || existingTenant.company || null,
            },
          })
        : await tx.tenant.create({
            data: {
              name: companyName || `${name} workspace`,
              email: normalizedEmail,
              company: companyName || null,
            },
          });

      const user = await tx.user.create({
        data: {
          name,
          email: normalizedEmail,
          password_hash,
          role: "client",
          tenant_id: tenant.id,
        },
      });

      const basicPlan = await tx.plan.findUnique({ where: { name: "BASIC" } });
      const defaultFeatures = (basicPlan?.features as any) || {
        advanced_ai: false,
        export_pdf: false,
        multi_user: false,
        api_access: true,
      };
      const defaultLimits = (basicPlan?.limits as any) || {
        max_users: 5,
        api_calls_per_month: 10000,
        storage_gb: 5,
      };
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);

      const hasLicense = await tx.license.findFirst({
        where: { tenant_id: tenant.id },
        select: { id: true },
      });

      if (!hasLicense) {
        await tx.license.create({
          data: {
            tenant_id: tenant.id,
            license_key: generateLicenseKey("BASIC"),
            plan: "BASIC",
            status: "active",
            expires_at: expiresAt,
            features: defaultFeatures,
            limits: defaultLimits,
            notes: "Auto-provisioned at signup",
          },
        });
      }

      return user;
    });

    const payload = {
      id: createdUser.id,
      email: createdUser.email,
      role: createdUser.role,
      tenant_id: createdUser.tenant_id,
    };

    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken({ id: createdUser.id });

    await prisma.user.update({
      where: { id: createdUser.id },
      data: { refresh_token: refreshToken },
    });

    const { password_hash: _, refresh_token, ...userWithoutPassword } = createdUser;

    res.status(201).json({
      data: {
        accessToken,
        refreshToken,
        user: userWithoutPassword,
      },
    });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return res.status(400).json({ error: "Email already exists" });
    }
    res.status(500).json({ error: "Registration failed", details: error?.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

    if (!normalizedEmail || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail, is_active: true },
    });

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      tenant_id: user.tenant_id,
    };

    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken({ id: user.id });

    // Store refresh token in DB
    await prisma.user.update({
      where: { id: user.id },
      data: { refresh_token: refreshToken },
    });

    // Don't return password hash
    const { password_hash, refresh_token, ...userWithoutPassword } = user;

    res.json({
      data: {
        accessToken,
        refreshToken,
        user: userWithoutPassword,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
};

export const logout = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    await prisma.user.update({
      where: { id: req.user.id },
      data: { refresh_token: null },
    });

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ error: "Logout failed" });
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: "Refresh token is required" });
    }

    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id, is_active: true },
    });

    if (!user || user.refresh_token !== refreshToken) {
      return res.status(401).json({ error: "Refresh token mismatch or user inactive" });
    }

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      tenant_id: user.tenant_id,
    };

    const accessToken = signAccessToken(payload);

    res.json({ data: { accessToken } });
  } catch (error) {
    res.status(500).json({ error: "Refresh failed" });
  }
};

export const me = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { tenant: true },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const { password_hash, refresh_token, ...userWithoutPassword } = user;
    res.json({ data: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ error: "Fetching user info failed" });
  }
};
