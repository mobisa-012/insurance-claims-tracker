import { z } from "zod";

export const CLAIM_TYPES = ["MOTOR", "HEALTH", "TRAVEL", "PROPERTY", "OTHER"] as const;
export const CLAIM_STATUSES = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "APPROVED",
  "REJECTED",
  "PAID",
] as const;

const isoDate = z
  .string()
  .min(1, "Please enter the incident date")
  .refine((val) => !Number.isNaN(Date.parse(val)), "Incident date must be a valid date");

export const createClaimSchema = z.object({
  claimNumber: z.string().trim().min(1, "The claim number is required"),
  policyNumber: z.string().trim().min(1, "The policy number is required"),
  customerName: z.string().trim().min(1, "Please enter your name is"),
  claimType: z.enum(CLAIM_TYPES, { message: "Claim type must be one of MOTOR, HEALTH, TRAVEL, PROPERTY, OTHER" }),
  claimAmount: z.coerce.number().positive("Claim amount must be a positive number above 0"),
  incidentDate: isoDate,
  description: z.string().trim().min(1, "Please describe the issue"),
});

export type CreateClaimInput = z.infer<typeof createClaimSchema>;

export const updateStatusSchema = z.object({
  status: z.enum(CLAIM_STATUSES, { message: "The status claim must be one of SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED, PAID" }),
});

export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;

export const listClaimsQuerySchema = z.object({
  status: z.enum(CLAIM_STATUSES).optional(),
  policyNumber: z.string().trim().min(1).optional(),
  claimNumber: z.string().trim().min(1).optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(10),
});

export type ListClaimsQuery = z.infer<typeof listClaimsQuerySchema>;
