import { Router } from "express";
import { getDashboardSummary } from "../controllers/dashboard_controller";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/summary", requireAuth, getDashboardSummary);

export default router;
