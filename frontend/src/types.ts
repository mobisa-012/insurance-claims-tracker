export const CLAIM_TYPES = ["MOTOR", "HEALTH", "TRAVEL", "PROPERTY", "OTHER"] as const;
export type ClaimType = (typeof CLAIM_TYPES)[number];

export const CLAIM_STATUSES = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "APPROVED",
  "REJECTED",
  "PAID",
] as const;
export type ClaimStatus = (typeof CLAIM_STATUSES)[number];

export interface Claim {
  id: string;
  claimNumber: string;
  policyNumber: string;
  customerName: string;
  claimType: ClaimType;
  claimAmount: string;
  incidentDate: string;
  description: string;
  status: ClaimStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface FieldError {
  field: string;
  message: string;
}
