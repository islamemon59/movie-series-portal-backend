import { Router } from "express";
import { adminController } from "../admin/admin.controller.js";
import { requireManagerOrAdmin } from "../../middleware/auth.js";

const router = Router();

router.use(requireManagerOrAdmin);

router.get("/dashboard", adminController.getDashboard);
router.get("/top-rated", adminController.getTopRated);
router.get("/most-reviewed", adminController.getMostReviewed);
router.get("/recent-users", adminController.getRecentUsers);
router.get("/subscription-analytics", adminController.getSubscriptionAnalytics);

export { router as managerRoutes };
