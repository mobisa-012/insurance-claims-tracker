import type { ClaimStatus } from "@/types";

const LABELS: Record<ClaimStatus, string> = {
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under Review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  PAID: "Paid",
};

const STYLES: Record<ClaimStatus, string> = {
  SUBMITTED: "bg-gray-100 text-gray-700 border-gray-300",
  UNDER_REVIEW: "bg-amber-50 text-amber-700 border-amber-300",
  APPROVED: "bg-green-50 text-green-700 border-green-300",
  REJECTED: "bg-red-50 text-red-700 border-red-300",
  PAID: "bg-blue-50 text-blue-700 border-blue-300",
};

export default function StatusBadge({ status }: { status: ClaimStatus }) {
  return (
    <span
      className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${STYLES[status]}`}
    >
      {LABELS[status]}
    </span>
  );
}
