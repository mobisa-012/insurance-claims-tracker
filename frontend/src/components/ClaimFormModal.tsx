"use client";

import { useState, type FormEvent } from "react";
import Modal from "./Modal";
import { apiFetch, ApiRequestError } from "@/lib/api";
import { CLAIM_TYPES, type Claim, type FieldError } from "@/types";

interface ClaimFormModalProps {
  onClose: () => void;
  onCreated: (claim: Claim) => void;
}

const initialForm = {
  claimNumber: "",
  policyNumber: "",
  customerName: "",
  claimType: "MOTOR",
  claimAmount: "",
  incidentDate: "",
  description: "",
};

const inputClass =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none disabled:bg-gray-100";
const labelClass = "mt-3 block text-sm font-medium text-gray-700";

export default function ClaimFormModal({ onClose, onCreated }: ClaimFormModalProps) {
  const [form, setForm] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof typeof initialForm>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validateClientSide(): Record<string, string> {
    const errors: Record<string, string> = {};
    if (!form.claimNumber.trim()) errors.claimNumber = "Claim number is required";
    if (!form.policyNumber.trim()) errors.policyNumber = "Policy number is required";
    if (!form.customerName.trim()) errors.customerName = "Customer name is required";
    if (!form.incidentDate) errors.incidentDate = "Incident date is required";
    if (!form.description.trim()) errors.description = "Description is required";
    const amount = Number(form.claimAmount);
    if (!form.claimAmount || Number.isNaN(amount) || amount <= 0) {
      errors.claimAmount = "Claim amount must be a positive number";
    }
    return errors;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);

    const clientErrors = validateClientSide();
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      return;
    }

    setFieldErrors({});
    setSubmitting(true);

    try {
      const res = await apiFetch<Claim>("/api/claims", {
        method: "POST",
        body: JSON.stringify({ ...form, claimAmount: Number(form.claimAmount) }),
      });
      onCreated(res.data as Claim);
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setFormError(err.message);
        if (err.fieldErrors) {
          const mapped: Record<string, string> = {};
          err.fieldErrors.forEach((fe: FieldError) => {
            mapped[fe.field] = fe.message;
          });
          setFieldErrors(mapped);
        }
      } else {
        setFormError("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title="New Claim" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        {formError && (
          <div className="mb-3 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
            {formError}
          </div>
        )}

        <label className={labelClass} htmlFor="claimNumber">
          Claim Number
        </label>
        <input
          id="claimNumber"
          className={inputClass}
          value={form.claimNumber}
          onChange={(e) => update("claimNumber", e.target.value)}
          disabled={submitting}
        />
        {fieldErrors.claimNumber && <p className="mt-1 text-xs text-red-600">{fieldErrors.claimNumber}</p>}

        <label className={labelClass} htmlFor="policyNumber">
          Policy Number
        </label>
        <input
          id="policyNumber"
          className={inputClass}
          value={form.policyNumber}
          onChange={(e) => update("policyNumber", e.target.value)}
          disabled={submitting}
        />
        {fieldErrors.policyNumber && <p className="mt-1 text-xs text-red-600">{fieldErrors.policyNumber}</p>}

        <label className={labelClass} htmlFor="customerName">
          Customer Name
        </label>
        <input
          id="customerName"
          className={inputClass}
          value={form.customerName}
          onChange={(e) => update("customerName", e.target.value)}
          disabled={submitting}
        />
        {fieldErrors.customerName && <p className="mt-1 text-xs text-red-600">{fieldErrors.customerName}</p>}

        <label className={labelClass} htmlFor="claimType">
          Claim Type
        </label>
        <select
          id="claimType"
          className={inputClass}
          value={form.claimType}
          onChange={(e) => update("claimType", e.target.value)}
          disabled={submitting}
        >
          {CLAIM_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        <label className={labelClass} htmlFor="claimAmount">
          Claim Amount
        </label>
        <input
          id="claimAmount"
          type="number"
          min="0.01"
          step="0.01"
          className={inputClass}
          value={form.claimAmount}
          onChange={(e) => update("claimAmount", e.target.value)}
          disabled={submitting}
        />
        {fieldErrors.claimAmount && <p className="mt-1 text-xs text-red-600">{fieldErrors.claimAmount}</p>}

        <label className={labelClass} htmlFor="incidentDate">
          Incident Date
        </label>
        <input
          id="incidentDate"
          type="date"
          className={inputClass}
          value={form.incidentDate}
          onChange={(e) => update("incidentDate", e.target.value)}
          disabled={submitting}
        />
        {fieldErrors.incidentDate && <p className="mt-1 text-xs text-red-600">{fieldErrors.incidentDate}</p>}

        <label className={labelClass} htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          rows={4}
          className={inputClass}
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          disabled={submitting}
        />
        {fieldErrors.description && <p className="mt-1 text-xs text-red-600">{fieldErrors.description}</p>}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60"
          >
            {submitting ? "Saving..." : "Create Claim"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
