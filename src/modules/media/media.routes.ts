import { Router } from "express";
import { mediaController } from "./media.controller.js";
import { requireAdmin } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { createMediaSchema, updateMediaSchema } from "./media.schema.js";

const router = Router();

// Public routes
router.get("/", mediaController.getAll);
router.get("/featured", mediaController.getFeatured);
router.get("/top-rated", mediaController.getTopRated);
router.get("/newly-added", mediaController.getNewlyAdded);
router.get("/genres", mediaController.getGenres);
router.get("/platforms", mediaController.getPlatforms);
router.get("/:id", mediaController.getById);

// Admin routes
router.post(
  "/",
  requireAdmin,
  validate(createMediaSchema),
  mediaController.create,
);
router.patch(
  "/:id",
  requireAdmin,
  validate(updateMediaSchema),
  mediaController.update,
);
router.delete("/:id", requireAdmin, mediaController.delete);

export { router as mediaRoutes };
