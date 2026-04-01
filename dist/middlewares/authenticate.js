"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jwt_1 = require("../config/jwt");
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized: No token provided" });
    }
    const token = authHeader.split(" ")[1];
    const decoded = (0, jwt_1.verifyAccessToken)(token);
    if (!decoded) {
        return res.status(401).json({ error: "Unauthorized: Invalid or expired token" });
    }
    req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
        tenant_id: decoded.tenant_id,
    };
    next();
};
exports.authenticate = authenticate;
//# sourceMappingURL=authenticate.js.map