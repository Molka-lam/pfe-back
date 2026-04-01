"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTenant = exports.suspendTenant = exports.updateTenant = exports.getTenantById = exports.createTenant = exports.getAllTenants = void 0;
const database_1 = require("../../config/database");
const getAllTenants = async (req, res) => {
    try {
        const tenants = await database_1.prisma.tenant.findMany({
            include: { _count: { select: { users: true, licenses: true } } },
            orderBy: { name: "asc" },
        });
        res.json({ data: tenants });
    }
    catch (error) {
        console.error("Prisma Error (getAllTenants):", error);
        res.status(500).json({ error: "Failed to fetch tenants" });
    }
};
exports.getAllTenants = getAllTenants;
const createTenant = async (req, res) => {
    try {
        const { name, email, company, phone, address } = req.body;
        if (!name || !email)
            return res.status(400).json({ error: "Name and email required" });
        const tenant = await database_1.prisma.tenant.create({
            data: { name, email, company, phone, address },
        });
        res.status(201).json({ data: tenant });
    }
    catch (error) {
        console.error("Prisma Error (createTenant):", error);
        res.status(500).json({ error: "Failed to create tenant" });
    }
};
exports.createTenant = createTenant;
const getTenantById = async (req, res) => {
    try {
        const id = req.params.id;
        const tenant = await database_1.prisma.tenant.findUnique({
            where: { id },
            include: { users: true, licenses: true },
        });
        if (!tenant)
            return res.status(404).json({ error: "Tenant not found" });
        res.json({ data: tenant });
    }
    catch (error) {
        console.error("Prisma Error (getTenantById):", error);
        res.status(500).json({ error: "Failed to fetch tenant" });
    }
};
exports.getTenantById = getTenantById;
const updateTenant = async (req, res) => {
    try {
        const id = req.params.id;
        const data = req.body;
        const tenant = await database_1.prisma.tenant.update({ where: { id }, data });
        res.json({ data: tenant });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update tenant" });
    }
};
exports.updateTenant = updateTenant;
const suspendTenant = async (req, res) => {
    try {
        const id = req.params.id;
        const tenant = await database_1.prisma.tenant.update({
            where: { id },
            data: { status: "suspended" },
        });
        res.json({ data: tenant, message: "Tenant suspended" });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to suspend tenant" });
    }
};
exports.suspendTenant = suspendTenant;
const deleteTenant = async (req, res) => {
    try {
        const id = req.params.id;
        const existing = await database_1.prisma.tenant.findUnique({ where: { id } });
        if (!existing) {
            return res.status(404).json({ error: "Tenant not found" });
        }
        await database_1.prisma.tenant.delete({ where: { id } });
        return res.json({ message: "Tenant deleted successfully" });
    }
    catch (error) {
        console.error("Prisma Error (deleteTenant):", error);
        return res.status(500).json({ error: "Failed to delete tenant" });
    }
};
exports.deleteTenant = deleteTenant;
//# sourceMappingURL=tenants.controller.js.map