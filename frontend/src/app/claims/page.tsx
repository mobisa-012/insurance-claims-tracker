"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch, ApiRequestError } from "@/lib/api";
import { useAuth, ProtectedRoute } from "@/context/AuthContext";
import StatusBadge from "@/components/StatusBadge";
import ClaimFormModal from "@/components/ClaimFormModal";
import ClaimDetailsModal from "@/components/ClaimDetailsModal";
import { CLAIM_STATUSES, type Claim, type Pagination } from "@/types";

const PAGE_SIZE = 10;

function ClaimsContent() {
  const { logout } = useAuth();

  const [claims, setClaims] = useState<Claim[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);

  const [statusFilter, setStatusFilter] = useState("");
  const [policyNumberFilter, setPolicyNumberFilter] = useState("");
  const [claimNumberFilter, setClaimNumberFilter] = useState("");
  const [appliedFilters, setAppliedFilters] = useState({ status: "", policyNumber: "", claimNumber: "" });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);

  useEffect(() => {
    loadClaims();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, appliedFilters]);

  function loadClaims() {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("pageSize", String(PAGE_SIZE));
    if (appliedFilters.status) params.set("status", appliedFilters.status);
    if (appliedFilters.policyNumber) params.set("policyNumber", appliedFilters.policyNumber);
    if (appliedFilters.claimNumber) params.set("claimNumber", appliedFilters.claimNumber);

    apiFetch<Claim[]>(`/api/claims?${params.toString()}`)
      .then((res) => {
        setClaims(res.data ?? []);
        setPagination((res.pagination as Pagination) ?? null);
      })
      .catch((err) => setError(err instanceof ApiRequestError ? err.message : "Failed to load claims"))
      .finally(() => setLoading(false));
  }

  function handleSearch() {
    setPage(1);
    setAppliedFilters({ status: statusFilter, policyNumber: policyNumberFilter, claimNumber: claimNumberFilter });
  }

  function handleClearFilters() {
    setStatusFilter("");
    setPolicyNumberFilter("");
    setClaimNumberFilter("");
    setPage(1);
    setAppliedFilters({ status: "", policyNumber: "", claimNumber: "" });
  }

  function handleClaimCreated(claim: Claim) {
    setShowCreateModal(false);
    setClaims((prev) => [claim, ...prev]);
    loadClaims();
  }

  function handleStatusUpdated(updated: Claim) {
    setClaims((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <header className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Claims</h1>
        <nav className="flex items-center gap-4">
          <Link href="/dashboard" className="text-sm font-medium text-gray-700 hover:underline">
            Dashboard
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

      <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-gray-200 bg-white p-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
        >
          <option value="">All statuses</option>
          {CLAIM_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <input
          placeholder="Policy number"
          value={policyNumberFilter}
          onChange={(e) => setPolicyNumberFilter(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
        />
        <input
          placeholder="Claim number"
          value={claimNumberFilter}
          onChange={(e) => setClaimNumberFilter(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
        />
        <button
          type="button"
          onClick={handleSearch}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Search
        </button>
        <button
          type="button"
          onClick={handleClearFilters}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="ml-auto rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          New Claim
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs uppercase text-gray-500">
              <th className="px-4 py-2">Claim Number</th>
              <th className="px-4 py-2">Policy Number</th>
              <th className="px-4 py-2">Customer</th>
              <th className="px-4 py-2">Type</th>
              <th className="px-4 py-2">Amount</th>
              <th className="px-4 py-2">Incident Date</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={7} className="px-4 py-4 text-gray-500">
                  Loading...
                </td>
              </tr>
            )}
            {!loading && claims.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-4 text-gray-500">
                  No claims found.
                </td>
              </tr>
            )}
            {!loading &&
              claims.map((claim) => (
                <tr
                  key={claim.id}
                  onClick={() => setSelectedClaimId(claim.id)}
                  className="cursor-pointer border-b border-gray-100 last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-2">{claim.claimNumber}</td>
                  <td className="px-4 py-2">{claim.policyNumber}</td>
                  <td className="px-4 py-2">{claim.customerName}</td>
                  <td className="px-4 py-2">{claim.claimType}</td>
                  <td className="px-4 py-2">{Number(claim.claimAmount).toFixed(2)}</td>
                  <td className="px-4 py-2">{new Date(claim.incidentDate).toLocaleDateString()}</td>
                  <td className="px-4 py-2">
                    <StatusBadge status={claim.status} />
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="mt-4 flex items-center justify-center gap-4 text-sm">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-md border border-gray-300 px-3 py-1.5 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-gray-600">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} claims)
          </span>
          <button
            type="button"
            disabled={page >= pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-md border border-gray-300 px-3 py-1.5 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {showCreateModal && <ClaimFormModal onClose={() => setShowCreateModal(false)} onCreated={handleClaimCreated} />}

      {selectedClaimId && (
        <ClaimDetailsModal
          claimId={selectedClaimId}
          onClose={() => setSelectedClaimId(null)}
          onStatusUpdated={handleStatusUpdated}
        />
      )}
    </div>
  );
}

export default function ClaimsPage() {
  return (
    <ProtectedRoute>
      <ClaimsContent />
    </ProtectedRoute>
  );
}
