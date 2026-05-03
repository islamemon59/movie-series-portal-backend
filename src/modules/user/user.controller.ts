import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../../types/index.js";
import { userService } from "./user.service.js";

export const userController = {
  async getMe(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await userService.getProfile(req.user.id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async updateMe(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const data = await userService.updateProfile(req.user.id, req.body);
      res.json({
        success: true,
        data,
        message: "Profile updated successfully",
      });
    } catch (error) {
      next(error);
    }
  },
};
