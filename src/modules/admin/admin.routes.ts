import { Router } from "express";
import { adminController } from "./admin.controller.js";
import { requireAdmin } from "../../middleware/auth.js";

const router = Router();

router.use(requireAdmin);

router.get("/dashboard", adminController.getDashboard);
router.get("/top-rated", adminController.getTopRated);
router.get("/most-reviewed", adminController.getMostReviewed);
router.get("/recent-users", adminController.getRecentUsers);
router.get("/users", adminController.getAllUsers);
router.get("/subscription-analytics", adminController.getSubscriptionAnalytics);

export { router as adminRoutes };
