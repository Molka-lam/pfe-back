"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleUser = exports.getUserById = exports.createUser = exports.getAllUsers = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const database_1 = require("../../config/database");
const getAllUsers = async (req, res) => {
    try {
        const users = await database_1.prisma.user.findMany({
            include: { tenant: { select: { name: true } } },
            orderBy: { created_at: "desc" },
        });
        // Remove password hashes from response
        const safeUsers = users.map((u) => {
            const { password_hash, refresh_token, ...safeUser } = u;
            return safeUser;
        });
        res.json({ data: safeUsers });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch users" });
    }
};
exports.getAllUsers = getAllUsers;
const createUser = async (req, res) => {
    try {
        const { name, email, password, role, tenant_id, tenantId } = req.body;
        const finalTenantId = tenant_id || tenantId;
        if (!name || !email || !password || !finalTenantId) {
            return res.status(400).json({ error: "Missing required fields (name, email, password, tenant_id)" });
        }
        const password_hash = await bcryptjs_1.default.hash(password, 10);
        const user = await database_1.prisma.user.create({
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
    }
    catch (error) {
        console.error("Prisma Error (createUser):", error);
        if (error.code === "P2002") {
            return res.status(400).json({ error: "Email already exists" });
        }
        return res.status(500).json({ error: "Failed to create user" });
    }
};
exports.createUser = createUser;
const getUserById = async (req, res) => {
    try {
        const id = req.params.id;
        const user = await database_1.prisma.user.findUnique({
            where: { id },
            include: { tenant: true },
        });
        if (!user)
            return res.status(404).json({ error: "User not found" });
        const { password_hash, refresh_token, ...safeUser } = user;
        res.json({ data: safeUser });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch user" });
    }
};
exports.getUserById = getUserById;
const toggleUser = async (req, res) => {
    try {
        const id = req.params.id;
        const user = await database_1.prisma.user.findUnique({ where: { id } });
        if (!user)
            return res.status(404).json({ error: "User not found" });
        const updated = await database_1.prisma.user.update({
            where: { id },
            data: { is_active: !user.is_active },
        });
        res.json({ data: { id: updated.id, is_active: updated.is_active } });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to toggle user status" });
    }
};
exports.toggleUser = toggleUser;
//# sourceMappingURL=users.controller.js.map