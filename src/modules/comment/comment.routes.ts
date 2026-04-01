import { Router } from "express";
import { commentController } from "./comment.controller.js";
import { requireAuth } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { createCommentSchema, updateCommentSchema } from "./comment.schema.js";

const router = Router();

router.get("/review/:reviewId", commentController.getByReview as any);
router.post(
  "/",
  requireAuth,
  validate(createCommentSchema),
  commentController.create as any,
);
router.patch(
  "/:id",
  requireAuth,
  validate(updateCommentSchema),
  commentController.update as any,
);
router.delete("/:id", requireAuth, commentController.delete as any);

export { router as commentRoutes };
