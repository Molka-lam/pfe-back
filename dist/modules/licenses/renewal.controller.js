"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAllRenewalRequests = exports.bulkDeleteRenewalRequests = exports.deleteRenewalRequest = exports.updateRenewalRequestStatus = exports.getRenewalRequests = exports.createRenewalRequest = void 0;
const database_1 = require("../../config/database");
const createRenewalRequest = async (req, res) => {
    try {
        const { license_id, message } = req.body;
        const tenant_id = req.user.tenant_id;
        if (!license_id) {
            return res.status(400).json({ error: "License ID is required" });
        }
        const license = await database_1.prisma.license.findUnique({
            where: { id: license_id },
        });
        if (!license || license.tenant_id !== tenant_id) {
            return res.status(404).json({ error: "License not found for this tenant" });
        }
        const request = await database_1.prisma.renewalRequest.create({
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
    }
    catch (error) {
        console.error("Error creating renewal request:", error);
        res.status(500).json({ error: "Failed to create renewal request" });
    }
};
exports.createRenewalRequest = createRenewalRequest;
const getRenewalRequests = async (req, res) => {
    try {
        // Only admins can see all requests
        if (req.user.role !== "admin") {
            const tenant_id = req.user.tenant_id;
            const requests = await database_1.prisma.renewalRequest.findMany({
                where: { tenant_id },
                include: {
                    license: true,
                    tenant: { select: { name: true } }
                },
                orderBy: { created_at: "desc" }
            });
            return res.json({ data: requests });
        }
        const requests = await database_1.prisma.renewalRequest.findMany({
            include: {
                license: true,
                tenant: { select: { name: true, email: true } }
            },
            orderBy: { created_at: "desc" }
        });
        res.json({ data: requests });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch renewal requests" });
    }
};
exports.getRenewalRequests = getRenewalRequests;
const updateRenewalRequestStatus = async (req, res) => {
    try {
        const id = req.params.id;
        const { status } = req.body;
        if (!["APPROVED", "REJECTED", "PENDING"].includes(status)) {
            return res.status(400).json({ error: "Invalid status" });
        }
        const request = await database_1.prisma.renewalRequest.update({
            where: { id },
            data: { status },
            include: {
                license: true,
                tenant: true
            }
        });
        res.json({ data: request, message: `Request marked as ${status.toLowerCase()}` });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update request status" });
    }
};
exports.updateRenewalRequestStatus = updateRenewalRequestStatus;
const deleteRenewalRequest = async (req, res) => {
    try {
        const id = req.params.id;
        const existing = await database_1.prisma.renewalRequest.findUnique({ where: { id } });
        if (!existing) {
            return res.status(404).json({ error: "Renewal request not found" });
        }
        await database_1.prisma.renewalRequest.delete({ where: { id } });
        return res.json({ message: "Renewal request deleted successfully" });
    }
    catch (error) {
        return res.status(500).json({ error: "Failed to delete renewal request" });
    }
};
exports.deleteRenewalRequest = deleteRenewalRequest;
const bulkDeleteRenewalRequests = async (req, res) => {
    try {
        const { ids } = req.body;
        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ error: "ids array is required" });
        }
        const uniqueIds = [...new Set(ids.filter(Boolean))];
        const result = await database_1.prisma.renewalRequest.deleteMany({
            where: { id: { in: uniqueIds } },
        });
        return res.json({
            data: { deletedCount: result.count },
            message: `${result.count} renewal request(s) deleted successfully`,
        });
    }
    catch (error) {
        return res.status(500).json({ error: "Failed to bulk delete renewal requests" });
    }
};
exports.bulkDeleteRenewalRequests = bulkDeleteRenewalRequests;
const deleteAllRenewalRequests = async (req, res) => {
    try {
        const result = await database_1.prisma.renewalRequest.deleteMany({});
        return res.json({
            data: { deletedCount: result.count },
            message: `${result.count} renewal request(s) deleted successfully`,
        });
    }
    catch (error) {
        return res.status(500).json({ error: "Failed to delete all renewal requests" });
    }
};
exports.deleteAllRenewalRequests = deleteAllRenewalRequests;
//# sourceMappingURL=renewal.controller.js.map