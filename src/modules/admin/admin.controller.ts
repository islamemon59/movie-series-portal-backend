import type { Request, Response, NextFunction } from "express";
import { adminService } from "./admin.service.js";

export const adminController = {
  async getDashboard(_req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await adminService.getDashboardStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  },

  async getTopRated(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await adminService.getTopRatedMedia();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async getMostReviewed(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await adminService.getMostReviewedMedia();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async getRecentUsers(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await adminService.getRecentUsers();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const result = await adminService.getAllUsers(page, limit);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  },

  async getSubscriptionAnalytics(
    _req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const data = await adminService.getSubscriptionAnalytics();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },
};
