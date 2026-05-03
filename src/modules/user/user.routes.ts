import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { userController } from "./user.controller.js";
import { updateProfileSchema } from "./user.schema.js";

const router = Router();

router.get("/me", requireAuth, userController.getMe as any);
router.patch(
  "/me",
  requireAuth,
  validate(updateProfileSchema),
  userController.updateMe as any,
);

export { router as userRoutes };
