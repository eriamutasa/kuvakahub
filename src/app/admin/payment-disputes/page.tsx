"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { marketplaceStore } from "@/lib/marketplace-store";
import { LAUNCH_CITY } from "@/lib/constants";
import {
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Building,
  User,
  DollarSign,
  FileText,
} from "lucide-react";

export default function AdminPaymentDisputesPage() {
  const { user } = useAuth();
  const disputesList = marketplaceStore.getDisputesForAdmin();

  const [selectedDisputeId, setSelectedDisputeId] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleResolveDispute = (disputeId: string) => {
    if (!user || !resolutionNotes.trim()) return;

    const success = marketplaceStore.resolvePaymentDispute(
      disputeId,
      "RESOLVED",
      resolutionNotes.trim(),
      user.id
    );

    if (success) {
      setSuccessMsg("Dispute marked as RESOLVED with administrative notes recorded.");
      setSelectedDisputeId(null);
      setResolutionNotes("");
      setTimeout(() => setSuccessMsg(""), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-rose-950 to-slate-900 border border-rose-900/40 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-rose-500/20 text-rose-300 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border border-rose-500/30">
              Admin Financial Control
            </span>
            <span className="text-xs text-slate-400">Hub: {LAUNCH_CITY}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-1">Payment Dispute Resolution Workbench</h1>
          <p className="text-xs text-slate-300">
            Review reported payment issues, audit transaction references, and log administrative resolutions.
          </p>
        </div>
      </div>

      {/* ADMIN DISCLAIMER */}
      <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-xl text-xs text-blue-300 flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 text-blue-400 shrink-0" />
        <span>
          <strong>Admin Governance Note:</strong> KuvakaHub does not hold or process money. Dispute resolution logs official platform administrative findings to help resolve Client/Provider reporting discrepancies.
        </span>
      </div>

      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/40 p-4 rounded-xl text-emerald-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* DISPUTES LIST */}
      <div className="space-y-4">
        {disputesList.length === 0 ? (
          <div className="bg-slate-800/60 rounded-2xl border border-slate-700/80 p-8 text-center space-y-2 shadow-xl">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <p className="text-sm font-bold text-white">No Open Payment Disputes</p>
            <p className="text-xs text-slate-400">All milestone payment declarations across Chinhoyi are currently clean.</p>
          </div>
        ) : (
          disputesList.map(({ dispute, record, project }) => (
            <div key={dispute.id} className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-6 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700/60 pb-3">
                <div>
                  <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold mb-1">
                    <Building className="w-3.5 h-3.5" />
                    <span>{project.title} • {project.suburb}</span>
                  </div>
                  <h2 className="text-base font-extrabold text-white">Dispute Reason: {dispute.reason}</h2>
                </div>
                <span className={`text-xs font-extrabold px-3 py-1 rounded-full border ${
                  dispute.status === "OPEN"
                    ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                    : dispute.status === "RESOLVED"
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                    : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                }`}>
                  STATUS: {dispute.status}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400">Disputed Amount</span>
                  <p className="font-extrabold text-rose-400 text-sm mt-0.5">${record.amount.toLocaleString()} USD</p>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400">Method & Ref</span>
                  <p className="font-bold text-white mt-0.5">{record.paymentMethodLabel || "N/A"} ({record.externalReference || "No Ref"})</p>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400">Date Raised</span>
                  <p className="font-bold text-white mt-0.5">{new Date(dispute.createdAt).toLocaleString()}</p>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-1">
                <p className="font-bold text-slate-400">DISPUTE DESCRIPTION:</p>
                <p className="text-slate-200">{dispute.description}</p>
              </div>

              {dispute.resolutionNotes && (
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-xs space-y-1">
                  <p className="font-bold text-emerald-400">ADMIN RESOLUTION NOTES:</p>
                  <p className="text-slate-200">{dispute.resolutionNotes}</p>
                </div>
              )}

              {dispute.status === "OPEN" && (
                <div className="pt-2">
                  {selectedDisputeId === dispute.id ? (
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                      <label className="block text-xs font-bold text-slate-300">Admin Resolution Findings</label>
                      <textarea
                        rows={3}
                        required
                        placeholder="Enter resolution notes (e.g. Verified off-platform bank statement confirmation with Provider)."
                        value={resolutionNotes}
                        onChange={(e) => setResolutionNotes(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                      />
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleResolveDispute(dispute.id)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold"
                        >
                          Save Resolution
                        </button>
                        <button
                          onClick={() => setSelectedDisputeId(null)}
                          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSelectedDisputeId(dispute.id)}
                      className="text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white px-4 py-2.5 rounded-xl shadow-md transition-all"
                    >
                      Resolve Dispute
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
