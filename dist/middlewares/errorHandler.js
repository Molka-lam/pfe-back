"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (err, req, res, next) => {
    console.error("Error catched by global handler:", err.stack || err);
    const status = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({
        error: message,
        details: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map