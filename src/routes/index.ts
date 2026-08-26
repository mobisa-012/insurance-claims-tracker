import { Router } from "express";
import authRoutes from "./auth_routes";
import claimsRoutes from "./claims_routes";
import dashboardRoutes from "./claim_dashboard_routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/claims", claimsRoutes);
router.use("/dashboard", dashboardRoutes);

export default router;
