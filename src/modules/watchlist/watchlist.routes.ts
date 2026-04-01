import { Router } from "express";
import { watchlistController } from "./watchlist.controller.js";
import { requireAuth } from "../../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, watchlistController.getUserWatchlist as any);
router.post("/:mediaId", requireAuth, watchlistController.toggle as any);
router.get("/check/:mediaId", requireAuth, watchlistController.check as any);

export { router as watchlistRoutes };
