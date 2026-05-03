import type { Request, Response, NextFunction } from "express";
import { mediaService } from "./media.service.js";
import { mediaQuerySchema } from "./media.schema.js";
import type { AuthenticatedRequest } from "../../types/index.js";

export const mediaController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const query = mediaQuerySchema.parse(req.query);
      const result = await mediaService.getAll(query);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const media = await mediaService.getById(req.params.id as string);
      res.json({ success: true, data: media });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const media = await mediaService.create(req.body);
      res.status(201).json({ success: true, data: media });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const media = await mediaService.update(
        req.params.id as string,
        req.body,
      );
      res.json({ success: true, data: media });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await mediaService.delete(req.params.id as string);
      res.json({ success: true, message: "Media deleted successfully" });
    } catch (error) {
      next(error);
    }
  },

  async getFeatured(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await mediaService.getFeatured();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async getTopRated(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await mediaService.getTopRated();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async getNewlyAdded(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await mediaService.getNewlyAdded();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async getGenres(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await mediaService.getGenres();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async getPlatforms(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await mediaService.getPlatforms();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async getSuggestions(req: Request, res: Response, next: NextFunction) {
    try {
      const query = String(req.query.q || "");
      const limit = Number(req.query.limit || 6);
      const data = await mediaService.getSuggestions(query, limit);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async getRecommendations(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const data = await mediaService.getRecommendations(req.user?.id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },
};
