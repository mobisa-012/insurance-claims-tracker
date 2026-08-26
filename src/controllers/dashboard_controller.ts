import { Request, Response } from "express";
import { prisma } from "../utils/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { CLAIM_STATUSES } from "../validators/claim_schema";

export const getDashboardSummary = asyncHandler(async (_req: Request, res: Response) => {
  const grouped = await prisma.claim.groupBy({
    by: ["status"],
    _count: { _all: true },
  });

  const countsByStatus = Object.fromEntries(CLAIM_STATUSES.map((status) => [status, 0])) as Record<
    (typeof CLAIM_STATUSES)[number],
    number
  >;

  for (const row of grouped) {
    countsByStatus[row.status] = row._count._all;
  }

  const total = Object.values(countsByStatus).reduce((sum, count) => sum + count, 0);

  res.json({ success: true, data: { total, countsByStatus } });
});
