"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = void 0;
const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ error: "Forbidden: Admin access required" });
    }
    next();
};
exports.requireAdmin = requireAdmin;
//# sourceMappingURL=requireAdmin.js.map