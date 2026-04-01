import { Router } from "express";
import * as usersController from "./users.controller";
import { authenticate } from "../../middlewares/authenticate";
import { requireAdmin } from "../../middlewares/requireAdmin";

const router = Router();

router.use(authenticate, requireAdmin);

router.get("/", usersController.getAllUsers);
router.post("/", usersController.createUser);
router.get("/:id", usersController.getUserById);
router.patch("/:id/toggle", usersController.toggleUser);

export default router;
