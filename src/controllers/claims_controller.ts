import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../utils/prisma";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { parseWithSchema } from "../utils/validate";
import { createClaimSchema, listClaimsQuerySchema, updateStatusSchema } from "../validators/claim_schema";

export const createClaim = asyncHandler(async (req: Request, res: Response) => {
  const input = parseWithSchema(createClaimSchema, req.body);

  try {
    const claim = await prisma.claim.create({
      data: {
        claimNumber: input.claimNumber,
        policyNumber: input.policyNumber,
        customerName: input.customerName,
        claimType: input.claimType,
        claimAmount: input.claimAmount,
        incidentDate: new Date(input.incidentDate),
        description: input.description,
      },
    });

    res.status(201).json({ success: true, message: "Claim created successfully", data: claim });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      throw new ApiError(409, "A claim with this claim number already exists", [
        { field: "claimNumber", message: "Claim number must be unique" },
      ]);
    }
    throw err;
  }
});

export const listClaims = asyncHandler(async (req: Request, res: Response) => {
  const query = parseWithSchema(listClaimsQuerySchema, req.query);

  const where: Prisma.ClaimWhereInput = {
    ...(query.status ? { status: query.status } : {}),
    ...(query.policyNumber ? { policyNumber: { contains: query.policyNumber, mode: "insensitive" } } : {}),
    ...(query.claimNumber ? { claimNumber: { contains: query.claimNumber, mode: "insensitive" } } : {}),
  };

  const [data, total] = await Promise.all([
    prisma.claim.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
    prisma.claim.count({ where }),
  ]);

  res.json({
    success: true,
    data,
    pagination: {
      page: query.page,
      pageSize: query.pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
    },
  });
});

export const getClaimById = asyncHandler(async (req: Request, res: Response) => {
  const claim = await prisma.claim.findUnique({ where: { id: req.params.id } });

  if (!claim) {
    throw new ApiError(404, "Claim not found");
  }

  res.json({ success: true, data: claim });
});

export const updateClaimStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status } = parseWithSchema(updateStatusSchema, req.body);

  const existing = await prisma.claim.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    throw new ApiError(404, "Claim not found");
  }

  const claim = await prisma.claim.update({
    where: { id: req.params.id },
    data: { status },
  });

  res.json({ success: true, message: "Claim status updated successfully", data: claim });
});
