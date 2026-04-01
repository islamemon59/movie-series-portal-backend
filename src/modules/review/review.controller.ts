import type { Response, NextFunction } from "express";
import { reviewService } from "./review.service.js";
import type { AuthenticatedRequest } from "../../types/index.js";

export const reviewController = {
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const review = await reviewService.create(req.user.id, req.body);
      res.status(201).json({ success: true, data: review });
    } catch (error) {
      next(error);
    }
  },

  async getByMedia(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const result = await reviewService.getByMedia(
        req.params.mediaId as string,
        page,
        limit,
      );
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const review = await reviewService.getById(req.params.id as string);
      res.json({ success: true, data: review });
    } catch (error) {
      next(error);
    }
  },

  async getUserReviews(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const result = await reviewService.getUserReviews(
        req.user.id,
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
      const review = await reviewService.update(
        req.params.id as string,
        req.user.id,
        req.body,
      );
      res.json({ success: true, data: review });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const isAdmin = req.user.role === "ADMIN";
      await reviewService.delete(req.params.id as string, req.user.id, isAdmin);
      res.json({ success: true, message: "Review deleted successfully" });
    } catch (error) {
      next(error);
    }
  },

  async updateStatus(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const review = await reviewService.updateStatus(
        req.params.id as string,
        req.body.status,
      );
      res.json({ success: true, data: review });
    } catch (error) {
      next(error);
    }
  },

  async toggleLike(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const result = await reviewService.toggleLike(
        req.params.id as string,
        req.user.id,
      );
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  },

  async checkUserLike(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const result = await reviewService.checkUserLike(
        req.params.id as string,
        req.user.id,
      );
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  },

  async getPending(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const result = await reviewService.getPending(page, limit);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  },

  async getAllAdmin(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as string | undefined;
      const result = await reviewService.getAllAdmin(page, limit, status);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  },
};
