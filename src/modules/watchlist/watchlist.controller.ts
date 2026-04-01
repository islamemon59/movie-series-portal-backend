import type { Response, NextFunction } from "express";
import { watchlistService } from "./watchlist.service.js";
import type { AuthenticatedRequest } from "../../types/index.js";

export const watchlistController = {
  async toggle(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await watchlistService.toggle(
        req.user.id,
        req.params.mediaId as string,
      );
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  },

  async getUserWatchlist(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 12;
      const result = await watchlistService.getUserWatchlist(
        req.user.id,
        page,
        limit,
      );
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  },

  async check(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await watchlistService.check(
        req.user.id,
        req.params.mediaId as string,
      );
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  },
};
