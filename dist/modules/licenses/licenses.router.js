"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const licensesController = __importStar(require("./licenses.controller"));
const renewalController = __importStar(require("./renewal.controller"));
const authenticate_1 = require("../../middlewares/authenticate");
const requireAdmin_1 = require("../../middlewares/requireAdmin");
const router = (0, express_1.Router)();
// Client routes
router.get("/me", authenticate_1.authenticate, licensesController.getMyLicense);
router.post("/validate", authenticate_1.authenticate, licensesController.validateLicense);
// Admin routes
router.get("/renewal-requests", authenticate_1.authenticate, renewalController.getRenewalRequests);
router.post("/renewal-requests", authenticate_1.authenticate, renewalController.createRenewalRequest);
router.patch("/renewal-requests/:id", authenticate_1.authenticate, requireAdmin_1.requireAdmin, renewalController.updateRenewalRequestStatus);
router.delete("/renewal-requests/:id", authenticate_1.authenticate, requireAdmin_1.requireAdmin, renewalController.deleteRenewalRequest);
router.post("/renewal-requests/bulk-delete", authenticate_1.authenticate, requireAdmin_1.requireAdmin, renewalController.bulkDeleteRenewalRequests);
router.delete("/renewal-requests", authenticate_1.authenticate, requireAdmin_1.requireAdmin, renewalController.deleteAllRenewalRequests);
router.get("/", authenticate_1.authenticate, requireAdmin_1.requireAdmin, licensesController.getAllLicenses);
router.post("/", authenticate_1.authenticate, requireAdmin_1.requireAdmin, licensesController.createLicense);
router.get("/:id", authenticate_1.authenticate, requireAdmin_1.requireAdmin, licensesController.getLicenseById);
router.patch("/:id", authenticate_1.authenticate, requireAdmin_1.requireAdmin, licensesController.updateLicense);
router.patch("/:id/revoke", authenticate_1.authenticate, requireAdmin_1.requireAdmin, licensesController.revokeLicense);
router.patch("/:id/suspend", authenticate_1.authenticate, requireAdmin_1.requireAdmin, licensesController.suspendLicense);
router.delete("/:id", authenticate_1.authenticate, requireAdmin_1.requireAdmin, licensesController.deleteLicense);
exports.default = router;
//# sourceMappingURL=licenses.router.js.map