import { Router } from "express";
import * as licensesController from "./licenses.controller";
import * as renewalController from "./renewal.controller";
import { authenticate } from "../../middlewares/authenticate";
import { requireAdmin } from "../../middlewares/requireAdmin";

const router = Router();

// Client routes
router.get("/me", authenticate, licensesController.getMyLicense);
router.post("/validate", authenticate, licensesController.validateLicense);

// Admin routes
router.get("/renewal-requests", authenticate, renewalController.getRenewalRequests);
router.post("/renewal-requests", authenticate, renewalController.createRenewalRequest);
router.patch("/renewal-requests/:id", authenticate, requireAdmin, renewalController.updateRenewalRequestStatus);
router.delete("/renewal-requests/:id", authenticate, requireAdmin, renewalController.deleteRenewalRequest);
router.post("/renewal-requests/bulk-delete", authenticate, requireAdmin, renewalController.bulkDeleteRenewalRequests);
router.delete("/renewal-requests", authenticate, requireAdmin, renewalController.deleteAllRenewalRequests);

router.get("/", authenticate, requireAdmin, licensesController.getAllLicenses);
router.post("/", authenticate, requireAdmin, licensesController.createLicense);
router.get("/:id", authenticate, requireAdmin, licensesController.getLicenseById);
router.patch("/:id", authenticate, requireAdmin, licensesController.updateLicense);
router.patch("/:id/revoke", authenticate, requireAdmin, licensesController.revokeLicense);
router.patch("/:id/suspend", authenticate, requireAdmin, licensesController.suspendLicense);
router.delete("/:id", authenticate, requireAdmin, licensesController.deleteLicense);

export default router;
