import { Router } from "express";
import { login, logout, me } from "../controllers/auth_controller";
import { requireAuth } from "../middleware/auth";
import { loginRateLimiter } from "../middleware/rate_limiter";

const router = Router();

router.post("/login", loginRateLimiter, login);
router.post("/logout", logout);
router.get("/me", requireAuth, me);

export default router;
