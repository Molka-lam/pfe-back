import { Router } from "express";
import * as usageController from "./usage.controller";
import { authenticate } from "../../middlewares/authenticate";

const router = Router();

router.get("/:tenantId", authenticate, usageController.getUsage);
router.post("/increment", authenticate, usageController.incrementUsage);

export default router;
