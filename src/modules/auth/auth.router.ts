import { Router } from "express";
import * as authController from "./auth.controller";
import { authenticate } from "../../middlewares/authenticate";

const router = Router();

router.post("/login", authController.login);
router.post("/register", authController.register);
router.post("/logout", authenticate, authController.logout);
router.post("/refresh", authController.refresh);
router.get("/me", authenticate, authController.me);

export default router;
