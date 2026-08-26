"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch, ApiRequestError } from "@/lib/api";
import { useAuth, ProtectedRoute } from "@/context/AuthContext";
import { CLAIM_STATUSES, type ClaimStatus } from "@/types";

interface DashboardSummary {
  total: number;
  countsByStatus: Record<ClaimStatus, number>;
}

const LABELS: Record<ClaimStatus, string> = {
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under Review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  PAID: "Paid",
};

function DashboardContent() {
  const { logout } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<DashboardSummary>("/api/dashboard/summary")
      .then((res) => setSummary(res.data ?? null))
      .catch((err) => setError(err instanceof ApiRequestError ? err.message : "Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <header className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
        <nav className="flex items-center gap-4">
          <Link href="/claims" className="text-sm font-medium text-gray-700 hover:underline">
            Claims
          </Link>
          <button
            type="button"
            onClick={logout}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Logout
          </button>
        </nav>
      </header>

      {loading && <p className="text-sm text-gray-500">Loading...</p>}
      {error && (
        <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      )}

      {summary && (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {CLAIM_STATUSES.map((status) => (
              <div
                key={status}
                className="rounded-lg border border-gray-200 bg-white p-5 text-center shadow-sm"
              >
                <div className="text-3xl font-semibold text-gray-900">{summary.countsByStatus[status]}</div>
                <div className="mt-1 text-sm text-gray-500">{LABELS[status]}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-sm font-medium text-gray-700">Total claims: {summary.total}</div>
        </>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
