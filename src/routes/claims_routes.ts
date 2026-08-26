import { Router } from "express";
import { createClaim, getClaimById, listClaims, updateClaimStatus } from "../controllers/claims_controller";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.use(requireAuth);

router.post("/", createClaim);
router.get("/", listClaims);
router.get("/:id", getClaimById);
router.patch("/:id/status", updateClaimStatus);

export default router;