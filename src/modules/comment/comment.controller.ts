import type { Response, NextFunction } from "express";
import { commentService } from "./comment.service.js";
import type { AuthenticatedRequest } from "../../types/index.js";

export const commentController = {
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const comment = await commentService.create(req.user.id, req.body);
      res.status(201).json({ success: true, data: comment });
    } catch (error) {
      next(error);
    }
  },

  async getByReview(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await commentService.getByReview(
        req.params.reviewId as string,
        page,
        limit,
      );
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  },

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const comment = await commentService.update(
        req.params.id as string,
        req.user.id,
        req.body,
      );
      res.json({ success: true, data: comment });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const isAdmin = req.user.role === "ADMIN";
      await commentService.delete(
        req.params.id as string,
        req.user.id,
        isAdmin,
      );
      res.json({ success: true, message: "Comment deleted successfully" });
    } catch (error) {
      next(error);
    }
  },
};
