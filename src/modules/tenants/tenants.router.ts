import { Router } from "express";
import * as tenantsController from "./tenants.controller";
import { authenticate } from "../../middlewares/authenticate";
import { requireAdmin } from "../../middlewares/requireAdmin";

const router = Router();

router.use(authenticate, requireAdmin);

router.get("/", tenantsController.getAllTenants);
router.post("/", tenantsController.createTenant);
router.get("/:id", tenantsController.getTenantById);
router.patch("/:id", tenantsController.updateTenant);
router.patch("/:id/suspend", tenantsController.suspendTenant);
router.delete("/:id", tenantsController.deleteTenant);

export default router;
