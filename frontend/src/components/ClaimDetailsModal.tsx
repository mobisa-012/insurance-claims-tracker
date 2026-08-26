"use client";

import { useEffect, useState } from "react";
import Modal from "./Modal";
import StatusBadge from "./StatusBadge";
import { apiFetch, ApiRequestError } from "@/lib/api";
import { CLAIM_STATUSES, type Claim, type ClaimStatus } from "@/types";

interface ClaimDetailsModalProps {
  claimId: string;
  onClose: () => void;
  onStatusUpdated: (claim: Claim) => void;
}

export default function ClaimDetailsModal({ claimId, onClose, onStatusUpdated }: ClaimDetailsModalProps) {
  const [claim, setClaim] = useState<Claim | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [selectedStatus, setSelectedStatus] = useState<ClaimStatus | "">("");
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  useEffect(() => {
    setLoading(true);
    setLoadError(null);
    apiFetch<Claim>(`/api/claims/${claimId}`)
      .then((res) => {
        setClaim(res.data ?? null);
        setSelectedStatus(res.data?.status ?? "");
      })
      .catch((err) => setLoadError(err instanceof ApiRequestError ? err.message : "Failed to load claim"))
      .finally(() => setLoading(false));
  }, [claimId]);

  async function handleUpdateStatus() {
    if (!claim || !selectedStatus || selectedStatus === claim.status) return;

    setUpdating(true);
    setUpdateError(null);
    setUpdateSuccess(false);

    try {
      const res = await apiFetch<Claim>(`/api/claims/${claimId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: selectedStatus }),
      });
      setClaim(res.data ?? null);
      setUpdateSuccess(true);
      onStatusUpdated(res.data as Claim);
    } catch (err) {
      setUpdateError(err instanceof ApiRequestError ? err.message : "Failed to update status");
    } finally {
      setUpdating(false);
    }
  }

  return (
    <Modal title="Claim Details" onClose={onClose}>
      {loading && <p className="text-sm text-gray-500">Loading...</p>}
      {loadError && (
        <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {loadError}
        </div>
      )}

      {claim && (
        <div>
          <dl className="grid grid-cols-[130px_1fr] gap-y-2 text-sm">
            <dt className="font-medium text-gray-500">Claim Number</dt>
            <dd>{claim.claimNumber}</dd>
            <dt className="font-medium text-gray-500">Policy Number</dt>
            <dd>{claim.policyNumber}</dd>
            <dt className="font-medium text-gray-500">Customer</dt>
            <dd>{claim.customerName}</dd>
            <dt className="font-medium text-gray-500">Claim Type</dt>
            <dd>{claim.claimType}</dd>
            <dt className="font-medium text-gray-500">Claim Amount</dt>
            <dd>{Number(claim.claimAmount).toFixed(2)}</dd>
            <dt className="font-medium text-gray-500">Incident Date</dt>
            <dd>{new Date(claim.incidentDate).toLocaleDateString()}</dd>
            <dt className="font-medium text-gray-500">Description</dt>
            <dd>{claim.description}</dd>
            <dt className="font-medium text-gray-500">Status</dt>
            <dd>
              <StatusBadge status={claim.status} />
            </dd>
          </dl>

          <div className="mt-5 border-t border-gray-200 pt-4">
            <label htmlFor="statusSelect" className="block text-sm font-medium text-gray-700">
              Update Status
            </label>
            <div className="mt-2 flex gap-2">
              <select
                id="statusSelect"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as ClaimStatus)}
                disabled={updating}
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
              >
                {CLAIM_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleUpdateStatus}
                disabled={updating || selectedStatus === claim.status}
                className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60"
              >
                {updating ? "Updating..." : "Update Status"}
              </button>
            </div>
            {updateError && <p className="mt-2 text-sm text-red-600">{updateError}</p>}
            {updateSuccess && <p className="mt-2 text-sm text-green-600">Status updated successfully</p>}
          </div>
        </div>
      )}
    </Modal>
  );
}
