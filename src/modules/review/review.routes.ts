import { Router } from "express";
import { reviewController } from "./review.controller.js";
import { requireAuth, requireAdmin } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import {
  createReviewSchema,
  updateReviewSchema,
  reviewStatusSchema,
} from "./review.schema.js";
import type { AuthenticatedRequest } from "../../types/index.js";

const router = Router();

// Static routes MUST be defined before parameterized routes
// to prevent /:id from catching /user/me, /admin/all, etc.

// Public
router.get("/media/:mediaId", reviewController.getByMedia as any);

// User routes (static paths first)
router.get("/user/me", requireAuth, reviewController.getUserReviews as any);
router.post(
  "/",
  requireAuth,
  validate(createReviewSchema),
  reviewController.create as any,
);

// Admin routes (static paths)
router.get("/admin/all", requireAdmin, reviewController.getAllAdmin as any);
router.get("/admin/pending", requireAdmin, reviewController.getPending as any);

// Parameterized routes (must come AFTER all static routes)
router.get("/:id", reviewController.getById as any);
router.patch(
  "/:id",
  requireAuth,
  validate(updateReviewSchema),
  reviewController.update as any,
);
router.delete("/:id", requireAuth, reviewController.delete as any);
router.post("/:id/like", requireAuth, reviewController.toggleLike as any);
router.get(
  "/:id/like/check",
  requireAuth,
  reviewController.checkUserLike as any,
);
router.patch(
  "/:id/status",
  requireAdmin,
  validate(reviewStatusSchema),
  reviewController.updateStatus as any,
);

export { router as reviewRoutes };
