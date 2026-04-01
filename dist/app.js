"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const errorHandler_1 = require("./middlewares/errorHandler");
const auth_router_1 = __importDefault(require("./modules/auth/auth.router"));
const licenses_router_1 = __importDefault(require("./modules/licenses/licenses.router"));
const tenants_router_1 = __importDefault(require("./modules/tenants/tenants.router"));
const users_router_1 = __importDefault(require("./modules/users/users.router"));
const usage_router_1 = __importDefault(require("./modules/usage/usage.router"));
const app = (0, express_1.default)();
// Middlewares
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({ origin: process.env.FRONTEND_URL || "http://localhost:5173", credentials: true }));
app.use((0, morgan_1.default)("dev"));
app.use(express_1.default.json());
// Routes
app.use("/api/auth", auth_router_1.default);
app.use("/api/licenses", licenses_router_1.default);
app.use("/api/tenants", tenants_router_1.default);
app.use("/api/users", users_router_1.default);
app.use("/api/usage", usage_router_1.default);
// Health check
app.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date() });
});
// Error Handler
app.use(errorHandler_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map