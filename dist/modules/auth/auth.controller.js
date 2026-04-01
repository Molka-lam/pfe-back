"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.me = exports.refresh = exports.logout = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const database_1 = require("../../config/database");
const jwt_1 = require("../../config/jwt");
const licenses_service_1 = require("../licenses/licenses.service");
const register = async (req, res) => {
    try {
        const { name, email, password, companyName } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ error: "Name, email and password are required" });
        }
        const existingUser = await database_1.prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            return res.status(400).json({ error: "Email already exists" });
        }
        const existingTenant = await database_1.prisma.tenant.findUnique({
            where: { email },
            include: { _count: { select: { users: true } } },
        });
        if (existingTenant && existingTenant._count.users > 0) {
            return res.status(400).json({ error: "Email already exists" });
        }
        const password_hash = await bcryptjs_1.default.hash(password, 10);
        const createdUser = await database_1.prisma.$transaction(async (tx) => {
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
                        email,
                        company: companyName || null,
                    },
                });
            const user = await tx.user.create({
                data: {
                    name,
                    email,
                    password_hash,
                    role: "client",
                    tenant_id: tenant.id,
                },
            });
            const basicPlan = await tx.plan.findUnique({ where: { name: "BASIC" } });
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
            const hasLicense = await tx.license.findFirst({
                where: { tenant_id: tenant.id },
                select: { id: true },
            });
            if (!hasLicense) {
                await tx.license.create({
                    data: {
                        tenant_id: tenant.id,
                        license_key: (0, licenses_service_1.generateLicenseKey)("BASIC"),
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
        const accessToken = (0, jwt_1.signAccessToken)(payload);
        const refreshToken = (0, jwt_1.signRefreshToken)({ id: createdUser.id });
        await database_1.prisma.user.update({
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
    }
    catch (error) {
        if (error?.code === "P2002") {
            return res.status(400).json({ error: "Email already exists" });
        }
        res.status(500).json({ error: "Registration failed", details: error?.message });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }
        const user = await database_1.prisma.user.findUnique({
            where: { email, is_active: true },
        });
        if (!user || !(await bcryptjs_1.default.compare(password, user.password_hash))) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        const payload = {
            id: user.id,
            email: user.email,
            role: user.role,
            tenant_id: user.tenant_id,
        };
        const accessToken = (0, jwt_1.signAccessToken)(payload);
        const refreshToken = (0, jwt_1.signRefreshToken)({ id: user.id });
        // Store refresh token in DB
        await database_1.prisma.user.update({
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
    }
    catch (error) {
        res.status(500).json({ error: "Login failed" });
    }
};
exports.login = login;
const logout = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: "Unauthorized" });
        await database_1.prisma.user.update({
            where: { id: req.user.id },
            data: { refresh_token: null },
        });
        res.json({ message: "Logged out successfully" });
    }
    catch (error) {
        res.status(500).json({ error: "Logout failed" });
    }
};
exports.logout = logout;
const refresh = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ error: "Refresh token is required" });
        }
        const decoded = (0, jwt_1.verifyRefreshToken)(refreshToken);
        if (!decoded) {
            return res.status(401).json({ error: "Invalid refresh token" });
        }
        const user = await database_1.prisma.user.findUnique({
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
        const accessToken = (0, jwt_1.signAccessToken)(payload);
        res.json({ data: { accessToken } });
    }
    catch (error) {
        res.status(500).json({ error: "Refresh failed" });
    }
};
exports.refresh = refresh;
const me = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: "Unauthorized" });
        const user = await database_1.prisma.user.findUnique({
            where: { id: req.user.id },
            include: { tenant: true },
        });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        const { password_hash, refresh_token, ...userWithoutPassword } = user;
        res.json({ data: userWithoutPassword });
    }
    catch (error) {
        res.status(500).json({ error: "Fetching user info failed" });
    }
};
exports.me = me;
//# sourceMappingURL=auth.controller.js.map