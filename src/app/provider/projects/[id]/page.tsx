"use client";

import React, { use, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { marketplaceStore } from "@/lib/marketplace-store";
import { LAUNCH_CITY } from "@/lib/constants";
import {
  HardHat,
  Building,
  MapPin,
  Play,
  Camera,
  FileSpreadsheet,
  ArrowRight,
  ShieldCheck,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  Clock,
} from "lucide-react";

export default function ProviderProjectWorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const [successMsg, setSuccessMsg] = useState("");

  const project = marketplaceStore.getProjectById(id);
  if (!project) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 p-8 text-center">
        <p className="text-slate-400">Project record not found.</p>
      </div>
    );
  }

  const milestones = marketplaceStore.getMilestonesForProject(project.id);
  const quotations = marketplaceStore.getQuotationsForProject(
    project.id,
    user?.id || "",
    "PROVIDER"
  );
  const acceptedQuote = quotations.find((q) => q.status === "ACCEPTED") || quotations[0];
  const paymentRecords = marketplaceStore.getPaymentRecordsForProject(
    project.id,
    user?.id || "",
    user?.role || "PROVIDER"
  );

  const handleStartMilestone = (milestoneId: string) => {
    marketplaceStore.startMilestone(milestoneId, user?.id || "");
  };

  const handleConfirmReceipt = (milestoneId: string) => {
    const success = marketplaceStore.confirmPaymentReceipt(milestoneId, user?.id || "");
    if (success) {
      setSuccessMsg("Payment receipt confirmed!");
      setTimeout(() => setSuccessMsg(""), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-950 to-slate-900 border border-amber-900/40 p-6 rounded-2xl space-y-3 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-amber-800/40 pb-3">
          <div>
            <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold mb-1">
              <HardHat className="w-4 h-4" />
              <span>Assigned Provider Workspace</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white">{project.title}</h1>
            <p className="text-xs text-slate-400">
              Client: {project.clientName} • Location: {project.suburb}, {project.city}
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs text-slate-400">Accepted Quotation</p>
            <p className="text-xl font-extrabold text-amber-400">
              {acceptedQuote ? `$${acceptedQuote.totalAmount.toLocaleString()} USD` : "Active"}
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">{project.description}</p>
      </div>

      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/40 p-4 rounded-xl text-emerald-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Provider Financial & Receipt Acknowledgement Section */}
      <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">Payment Receipt Status</h2>
          </div>
          <span className="text-xs text-slate-400">Off-Platform Transparency Log</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {milestones.map((m) => {
            const pr = paymentRecords.find((r) => r.milestoneId === m.id);
            return (
              <div key={m.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white truncate max-w-[200px]">{m.title}</span>
                  <span className="font-extrabold text-amber-400">${m.amount.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Client Status: {pr?.status || "NOT DUE"}</span>
                  {pr?.status === "PAID" && pr.providerAcknowledgedAt ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Receipt Confirmed
                    </span>
                  ) : pr?.status === "PAID" ? (
                    <button
                      onClick={() => handleConfirmReceipt(m.id)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-3 py-1 rounded-lg text-[10px]"
                    >
                      CONFIRM RECEIPT
                    </button>
                  ) : (
                    <span className="text-slate-500">Awaiting Client Payment</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Milestones Workspace Timeline */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Building className="w-5 h-5 text-amber-400" />
          <span>Construction Milestones ({milestones.length})</span>
        </h2>

        <div className="space-y-4">
          {milestones.map((ms) => (
            <div
              key={ms.id}
              className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 space-y-3 shadow-lg"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700/60 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-950 text-amber-400 border border-amber-500/30 flex items-center justify-center text-xs font-extrabold shrink-0">
                    {ms.orderIndex}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{ms.title}</h3>
                    <p className="text-xs text-slate-400">Value: ${ms.amount.toLocaleString()}</p>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-3 py-1 rounded-full border uppercase ${
                    ms.status === "CLIENT_APPROVED"
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                      : ms.status === "INSPECTOR_VERIFIED"
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                      : ms.status === "IN_PROGRESS"
                      ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                      : ms.status === "NEEDS_ATTENTION" || ms.status === "REJECTED"
                      ? "bg-amber-500/30 text-amber-200 border-amber-500/50"
                      : "bg-slate-900 text-slate-400 border-slate-800"
                  }`}
                >
                  {ms.status.replace(/_/g, " ")}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{ms.description}</p>

              {/* Actions depending on milestone state */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-700/50 text-xs">
                <span className="text-slate-400">Target Date: {ms.dueDate || "Not set"}</span>

                <div className="flex items-center gap-2">
                  {ms.status === "NOT_STARTED" && (
                    <button
                      onClick={() => handleStartMilestone(ms.id)}
                      className="inline-flex items-center gap-1.5 font-bold bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-xl shadow-sm transition-all"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Start Work</span>
                    </button>
                  )}

                  {(ms.status === "IN_PROGRESS" || ms.status === "NEEDS_ATTENTION" || ms.status === "REJECTED") && (
                    <Link
                      href={`/provider/projects/${project.id}/milestones/${ms.id}`}
                      className="inline-flex items-center gap-1.5 font-bold bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl shadow-sm transition-all"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Upload Progress Evidence</span>
                    </Link>
                  )}

                  {(ms.status === "PROVIDER_SUBMITTED" || ms.status === "INSPECTION_REQUIRED") && (
                    <span className="text-xs font-semibold text-amber-300 bg-amber-950/60 border border-amber-800 px-3 py-1.5 rounded-xl">
                      Awaiting Independent Site Inspection
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
