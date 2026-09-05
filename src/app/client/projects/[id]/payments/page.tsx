"use client";

import React, { use, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { marketplaceStore } from "@/lib/marketplace-store";
import {
  ArrowLeft,
  DollarSign,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Building,
  FileSpreadsheet,
  AlertCircle,
  MessageCircle,
  HelpCircle,
} from "lucide-react";
import { generateWhatsAppLink, getSharePaymentMessage } from "@/lib/whatsapp";

export default function ClientProjectPaymentsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user } = useAuth();

  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("EcoCash Direct");
  const [externalRef, setExternalRef] = useState("");
  const [clientNote, setClientNote] = useState("");
  const [showPaidModal, setShowPaidModal] = useState(false);
  
  const [disputeReason, setDisputeReason] = useState("");
  const [disputeDesc, setDisputeDesc] = useState("");
  const [showDisputeModal, setShowDisputeModal] = useState(false);

  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const project = marketplaceStore.getProjectById(id);
  if (!project) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 p-8 text-center">
        <p className="text-slate-400">Project record not found.</p>
      </div>
    );
  }

  const milestones = marketplaceStore.getMilestonesForProject(project.id);
  const summary = marketplaceStore.getFinancialSummaryForProject(project.id);
  const paymentRecords = marketplaceStore.getPaymentRecordsForProject(
    project.id,
    user?.id || "",
    user?.role || "CLIENT"
  );

  const handleApprovePayment = (milestoneId: string) => {
    setActionError(null);
    const success = marketplaceStore.approveMilestonePayment(milestoneId, user?.id || "");
    if (success) {
      setActionSuccess("Payment status set to APPROVED. You may now transfer funds directly to your Provider.");
      setTimeout(() => setActionSuccess(null), 3000);
    } else {
      setActionError("Milestone must be CLIENT_APPROVED before payment approval.");
    }
  };

  const handleMarkPaid = (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    if (!selectedMilestoneId) return;

    const success = marketplaceStore.markPaymentAsPaid(
      selectedMilestoneId,
      paymentMethod,
      externalRef,
      clientNote,
      user?.id || ""
    );

    if (success) {
      setActionSuccess("Payment successfully marked as PAID on KuvakaHub.");
      setShowPaidModal(false);
      setSelectedMilestoneId(null);
      setTimeout(() => setActionSuccess(null), 3000);
    } else {
      setActionError("Failed to record payment as paid. Verify payment approval status.");
    }
  };

  const handleRaiseDispute = (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    if (!selectedMilestoneId || !disputeReason || !disputeDesc) return;

    const success = marketplaceStore.raisePaymentDispute(
      selectedMilestoneId,
      disputeReason,
      disputeDesc,
      user?.id || ""
    );

    if (success) {
      setActionSuccess("Payment issue reported to Admin.");
      setShowDisputeModal(false);
      setSelectedMilestoneId(null);
      setTimeout(() => setActionSuccess(null), 3000);
    } else {
      setActionError("Failed to raise payment issue.");
    }
  };

  if (!project) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 p-8 text-center">
        <p className="text-slate-400">Project record not found.</p>
      </div>
    );
  }

  const getPaymentStatusBadge = (status?: string) => {
    switch (status) {
      case "PAID":
        return <span className="bg-emerald-500/20 text-emerald-300 text-xs font-extrabold px-3 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> PAID</span>;
      case "APPROVED":
        return <span className="bg-blue-500/20 text-blue-300 text-xs font-extrabold px-3 py-1 rounded-full border border-blue-500/30 flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> APPROVED</span>;
      case "PENDING_APPROVAL":
        return <span className="bg-amber-500/20 text-amber-300 text-xs font-extrabold px-3 py-1 rounded-full border border-amber-500/30 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> READY FOR APPROVAL</span>;
      case "DISPUTED":
        return <span className="bg-rose-500/20 text-rose-300 text-xs font-extrabold px-3 py-1 rounded-full border border-rose-500/30 flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> DISPUTED</span>;
      default:
        return <span className="bg-slate-800 text-slate-400 text-xs font-bold px-3 py-1 rounded-full border border-slate-700">NOT DUE</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* Navigation Header */}
      <div>
        <Link
          href={`/client/projects/${project.id}`}
          className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-semibold hover:underline mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Project Overview
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-800/80 p-6 rounded-2xl border border-slate-700/80 shadow-xl">
          <div>
            <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold mb-1">
              <Building className="w-3.5 h-3.5" />
              <span>{project.title} • {project.suburb}, {project.city}</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white">Project Financial Tracker & Transparency Log</h1>
            <p className="text-xs text-slate-300 mt-1">Record payment approvals, track off-platform settlement, and monitor milestone financial progress.</p>
          </div>
        </div>
      </div>

      {/* PROMINENT DISCLAIMER REQUIREMENT */}
      <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-2xl flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-bold text-blue-300">NO PAYMENT PROCESSING DISCLAIMER</p>
          <p className="text-slate-300 leading-relaxed">
            KuvakaHub currently records project payment status for transparency. Payments are made directly between Client and Provider using their chosen payment method (e.g., EcoCash, Bank Transfer, InnBucks, Cash). KuvakaHub does not hold, process, or custody funds.
          </p>
        </div>
      </div>

      {actionSuccess && (
        <div className="bg-emerald-500/10 border border-emerald-500/40 p-4 rounded-xl text-emerald-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="bg-rose-500/10 border border-rose-500/40 p-4 rounded-xl text-rose-300 text-xs font-bold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* FINANCIAL CONSISTENCY WARNING */}
      {!summary.isAllocatedMatched && (
        <div className="bg-amber-500/10 border border-amber-500/40 p-4 rounded-xl text-amber-300 text-xs font-bold flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          <span>
            <strong>Financial Control Warning:</strong> Milestone allocation total (${summary.milestoneTotal.toLocaleString()}) differs from accepted quotation total (${summary.quoteTotal.toLocaleString()}) by ${Math.abs(summary.discrepancyAmount).toLocaleString()}.
          </span>
        </div>
      )}

      {/* FINANCIAL SUMMARY METRICS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <p className="text-slate-400">Accepted Quote</p>
          <p className="text-lg font-extrabold text-white mt-1">${summary.quoteTotal.toLocaleString()}</p>
        </div>
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <p className="text-slate-400">Milestone Total</p>
          <p className="text-lg font-extrabold text-amber-400 mt-1">${summary.milestoneTotal.toLocaleString()}</p>
        </div>
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <p className="text-slate-400">Approved Total</p>
          <p className="text-lg font-extrabold text-blue-400 mt-1">${summary.approvedAmount.toLocaleString()}</p>
        </div>
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <p className="text-slate-400">Total Paid</p>
          <p className="text-lg font-extrabold text-emerald-400 mt-1">${summary.paidAmount.toLocaleString()}</p>
        </div>
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 col-span-2 sm:col-span-1">
          <p className="text-slate-400">Remaining Balance</p>
          <p className="text-lg font-extrabold text-slate-200 mt-1">${summary.remainingAmount.toLocaleString()}</p>
        </div>
      </div>

      {/* MILESTONE PAYMENT TABLE & BREAKDOWN */}
      <div className="bg-slate-800/60 border border-slate-700/80 p-6 rounded-2xl space-y-4 shadow-xl">
        <h2 className="text-base font-bold text-white border-b border-slate-700/60 pb-3">
          Milestone Payment Transparency Breakdown
        </h2>

        <div className="space-y-4">
          {milestones.map((m) => {
            const pr = paymentRecords.find((r) => r.milestoneId === m.id);
            const status = pr ? pr.status : m.status === "CLIENT_APPROVED" ? "PENDING_APPROVAL" : "NOT_DUE";

            const waLink = generateWhatsAppLink(
              user?.phoneE164 || "",
              getSharePaymentMessage(m.title, m.amount, pr?.paymentMethodLabel || "direct payment")
            );

            return (
              <div key={m.id} className="bg-slate-950 rounded-xl p-5 border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-900 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-amber-400 font-bold"># {m.orderIndex}</span>
                      <h3 className="text-sm font-extrabold text-white">{m.title}</h3>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{m.description}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-base font-extrabold text-white">${m.amount.toLocaleString()}</span>
                    {getPaymentStatusBadge(status)}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-400 text-[11px]">Construction Verification:</span>
                    <p className="font-bold text-amber-400 mt-0.5">{m.status}</p>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-400 text-[11px]">Payment Method Recorded:</span>
                    <p className="font-bold text-white mt-0.5">{pr?.paymentMethodLabel || "None recorded"}</p>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-400 text-[11px]">Provider Receipt Status:</span>
                    <p className="font-bold text-white mt-0.5">
                      {pr?.providerAcknowledgedAt ? (
                        <span className="text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Confirmed</span>
                      ) : (
                        <span className="text-slate-400">Pending Receipt</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* PAYMENT ACTION BUTTONS */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  {status === "PENDING_APPROVAL" && (
                    <button
                      onClick={() => handleApprovePayment(m.id)}
                      className="text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>APPROVE PAYMENT</span>
                    </button>
                  )}

                  {(status === "APPROVED" || status === "PENDING_APPROVAL") && (
                    <button
                      onClick={() => {
                        setSelectedMilestoneId(m.id);
                        setShowPaidModal(true);
                      }}
                      className="text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1.5"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>MARK AS PAID</span>
                    </button>
                  )}

                  {status === "PAID" && (
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-bold bg-emerald-800 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1.5"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Share Receipt on WhatsApp</span>
                    </a>
                  )}

                  {status !== "DISPUTED" && (
                    <button
                      onClick={() => {
                        setSelectedMilestoneId(m.id);
                        setShowDisputeModal(true);
                      }}
                      className="text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-rose-400 px-3.5 py-2.5 rounded-xl border border-slate-800 transition-all flex items-center gap-1.5"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Report Issue</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MARK AS PAID MODAL */}
      {showPaidModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-400" />
              Record Off-Platform Payment
            </h3>

            {/* CONFIRMATION WARNING REQUIREMENT */}
            <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl text-xs text-amber-300">
              <strong>Warning:</strong> Only mark this payment as paid after you have actually sent the funds to the Provider outside KuvakaHub.
            </div>

            <form onSubmit={handleMarkPaid} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Payment Method Label</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="EcoCash Direct">EcoCash Direct</option>
                  <option value="Bank Wire Transfer">Bank Wire Transfer</option>
                  <option value="InnBucks Remittance">InnBucks Remittance</option>
                  <option value="Mukuru Remittance">Mukuru Remittance</option>
                  <option value="Cash on Site Handover">Cash on Site Handover</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">External Transaction Ref (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. ECO-998124 or Wire Ref"
                  value={externalRef}
                  onChange={(e) => setExternalRef(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Notes / Instructions (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Sent funds directly to provider via EcoCash registered number."
                  value={clientNote}
                  onChange={(e) => setClientNote(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPaidModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold"
                >
                  Confirm Paid Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REPORT DISPUTE MODAL */}
      {showDisputeModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              Report Payment Dispute
            </h3>
            <p className="text-xs text-slate-300">
              Report an unreceived payment or financial discrepancy for platform admin investigation.
            </p>

            <form onSubmit={handleRaiseDispute} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Dispute Reason</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Payment transferred but unconfirmed by builder"
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Description & Details</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide transaction details or reasons for reporting this issue."
                  value={disputeDesc}
                  onChange={(e) => setDisputeDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDisputeModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold"
                >
                  Submit Dispute
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
