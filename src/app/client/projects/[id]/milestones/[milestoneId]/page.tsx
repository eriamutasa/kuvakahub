"use client";

import React, { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { marketplaceStore } from "@/lib/marketplace-store";
import {
  ArrowLeft,
  ShieldCheck,
  Building,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  DollarSign,
  Calendar,
  FileText,
  UserCheck,
  UserX,
  ExternalLink,
  MessageCircle,
  Eye,
  Info,
} from "lucide-react";
import { generateWhatsAppLink } from "@/lib/whatsapp";

export default function ClientMilestoneDetailPage({
  params,
}: {
  params: Promise<{ id: string; milestoneId: string }>;
}) {
  const { id, milestoneId } = use(params);
  const { user } = useAuth();
  const router = useRouter();

  const [returnReason, setReturnReason] = useState("");
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const project = marketplaceStore.getProjectById(id) || marketplaceStore.getProjects()[0];
  const milestone = marketplaceStore.getMilestoneById(milestoneId) || marketplaceStore.getMilestonesForProject(project.id)[1];

  const providerEvidence = milestone ? marketplaceStore.getProviderEvidence(milestone.id) : [];
  const inspectionReport = milestone ? marketplaceStore.getInspectionReportForMilestone(milestone.id) : undefined;
  
  // Client can read inspector evidence
  const inspectorEvidence = inspectionReport
    ? marketplaceStore.getInspectorEvidence(inspectionReport.id, user?.id || "", user?.role || "CLIENT")
    : [];

  const handleApprove = () => {
    setActionError(null);
    if (!milestone) return;

    if (milestone.status !== "INSPECTOR_VERIFIED") {
      setActionError("Milestone can only be approved after an Independent Inspector has marked it VERIFIED.");
      return;
    }

    const success = marketplaceStore.approveMilestoneByClient(milestone.id, user?.id || "");
    if (success) {
      setActionSuccess("Milestone successfully approved by Client!");
      setTimeout(() => {
        router.refresh();
      }, 1200);
    } else {
      setActionError("Failed to record approval. Please verify project ownership.");
    }
  };

  const handleReturn = (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    if (!milestone || !returnReason.trim()) return;

    const success = marketplaceStore.returnMilestoneByClient(
      milestone.id,
      returnReason.trim(),
      user?.id || ""
    );

    if (success) {
      setActionSuccess("Milestone returned to Builder for attention with feedback.");
      setShowReturnModal(false);
      setTimeout(() => {
        router.refresh();
      }, 1200);
    } else {
      setActionError("Failed to return milestone. Please check user session.");
    }
  };

  if (!project || !milestone) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 p-8 text-center">
        <p className="text-slate-400">Milestone or project record not found.</p>
        <Link href="/client/dashboard" className="text-amber-400 font-bold underline mt-4 inline-block">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CLIENT_APPROVED":
        return <span className="bg-emerald-500/20 text-emerald-300 text-xs font-extrabold px-3 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> CLIENT APPROVED</span>;
      case "INSPECTOR_VERIFIED":
        return <span className="bg-blue-500/20 text-blue-300 text-xs font-extrabold px-3 py-1 rounded-full border border-blue-500/30 flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" /> INSPECTOR VERIFIED</span>;
      case "NEEDS_ATTENTION":
        return <span className="bg-amber-500/20 text-amber-300 text-xs font-extrabold px-3 py-1 rounded-full border border-amber-500/30 flex items-center gap-1.5"><AlertTriangle className="w-4 h-4" /> NEEDS ATTENTION</span>;
      case "REJECTED":
        return <span className="bg-rose-500/20 text-rose-300 text-xs font-extrabold px-3 py-1 rounded-full border border-rose-500/30 flex items-center gap-1.5"><XCircle className="w-4 h-4" /> REJECTED BY INSPECTOR</span>;
      case "INSPECTION_REQUIRED":
        return <span className="bg-purple-500/20 text-purple-300 text-xs font-extrabold px-3 py-1 rounded-full border border-purple-500/30 flex items-center gap-1.5"><Clock className="w-4 h-4" /> INSPECTION PENDING</span>;
      case "IN_PROGRESS":
        return <span className="bg-amber-500/20 text-amber-300 text-xs font-bold px-3 py-1 rounded-full border border-amber-500/30">WORK IN PROGRESS</span>;
      default:
        return <span className="bg-slate-700 text-slate-300 text-xs font-bold px-3 py-1 rounded-full">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link
          href={`/client/projects/${project.id}/milestones`}
          className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-semibold hover:underline mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Project Milestones
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-800/80 p-6 rounded-2xl border border-slate-700/80 shadow-xl">
          <div>
            <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold mb-1">
              <Building className="w-3.5 h-3.5" />
              <span>{project.title} • Milestone #{milestone.orderIndex}</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white">{milestone.title}</h1>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl">{milestone.description}</p>
          </div>
          <div>{getStatusBadge(milestone.status)}</div>
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

      {/* Milestone Overview Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <p className="text-slate-400 flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5 text-amber-400" /> Milestone Value</p>
          <p className="text-lg font-extrabold text-amber-400 mt-1">${milestone.amount.toLocaleString()}</p>
        </div>
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <p className="text-slate-400 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-blue-400" /> Target Date</p>
          <p className="text-sm font-bold text-white mt-1">{milestone.dueDate || "N/A"}</p>
        </div>
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <p className="text-slate-400 flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 text-indigo-400" /> Builder Evidence</p>
          <p className="text-sm font-bold text-white mt-1">{providerEvidence.length} files attached</p>
        </div>
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <p className="text-slate-400 flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Inspection Status</p>
          <p className="text-sm font-bold text-white mt-1">
            {inspectionReport ? inspectionReport.result : "Pending Site Visit"}
          </p>
        </div>
      </div>

      {/* Trust Notice Banner */}
      <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-bold text-amber-300">KuvakaHub Central Trust Protocol</p>
          <p className="text-slate-300">
            Compare what the Builder claimed against what the Independent Site Inspector verified. You hold final approval authority before releasing milestone confirmation.
          </p>
        </div>
      </div>

      {/* Side-by-Side Verification Experience */}
      {/* Desktop: Grid 2 columns | Mobile: Stacked sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* PANEL 1: BUILDER SUBMISSION (Provider Evidence) */}
        <div className="bg-slate-800/60 rounded-2xl border border-slate-700/80 p-6 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Builder Submission</h2>
                  <p className="text-xs text-slate-400">Claimed site progress & evidence</p>
                </div>
              </div>
              <span className="text-[11px] bg-slate-900 text-slate-300 px-2.5 py-1 rounded-md border border-slate-800">
                {providerEvidence.length} Attachments
              </span>
            </div>

            {providerEvidence.length === 0 ? (
              <div className="bg-slate-950 p-6 rounded-xl text-center border border-slate-800 space-y-2">
                <Clock className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400">The provider has not submitted evidence for this milestone yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {providerEvidence.map((item) => (
                  <div key={item.id} className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="font-mono text-[11px] text-amber-400">{item.mimeType}</span>
                      <span>{new Date(item.uploadedAt).toLocaleString()}</span>
                    </div>

                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-xs text-slate-200">
                      <p className="font-semibold text-slate-400 text-[11px] mb-1">BUILDER NOTES:</p>
                      <p className="italic">{item.notes || "No notes provided."}</p>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs">
                        <FileText className="w-4 h-4 text-amber-400" />
                        <span className="truncate max-w-[200px] text-slate-200">{item.storagePath.split("/").pop()}</span>
                      </div>
                      <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" /> Read-Only Evidence
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-700/60 text-xs text-slate-400 flex items-center justify-between">
            <span>Source: Primary Construction Provider</span>
            <span className="text-amber-400 font-medium">Immutable Audit Trail</span>
          </div>
        </div>

        {/* PANEL 2: INDEPENDENT INSPECTION (Inspector Proof) */}
        <div className="bg-slate-800/60 rounded-2xl border border-slate-700/80 p-6 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Independent Inspection</h2>
                  <p className="text-xs text-slate-400">On-site third-party verification report</p>
                </div>
              </div>
              {inspectionReport && (
                <span className={`text-[11px] font-extrabold px-3 py-1 rounded-full border ${
                  inspectionReport.result === "VERIFIED"
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                    : inspectionReport.result === "NEEDS_ATTENTION"
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                    : "bg-rose-500/20 text-rose-300 border-rose-500/40"
                }`}>
                  {inspectionReport.result}
                </span>
              )}
            </div>

            {!inspectionReport ? (
              <div className="bg-slate-950 p-6 rounded-xl text-center border border-slate-800 space-y-2">
                <ShieldCheck className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400">An independent inspector has not yet completed a physical site inspection for this milestone.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Inspector Header */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-blue-400" />
                      <span className="text-xs font-bold text-white">{inspectionReport.inspectorName}</span>
                    </div>
                    <span className="text-[11px] text-slate-400">{new Date(inspectionReport.createdAt).toLocaleString()}</span>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <p className="text-[11px] font-bold text-slate-400">SUMMARY INSPECTION NOTES (CLIENT & ADMIN PRIVATE):</p>
                      <p className="text-xs text-slate-200 mt-1 leading-relaxed bg-slate-900 p-3 rounded-lg border border-slate-800">
                        {inspectionReport.summaryNotes || "No summary notes provided."}
                      </p>
                    </div>

                    <div>
                      <p className="text-[11px] font-bold text-amber-400">INSTRUCTIONS SENT TO BUILDER:</p>
                      <p className="text-xs text-slate-300 mt-1 italic bg-slate-900 p-3 rounded-lg border border-slate-800">
                        {inspectionReport.providerFeedback || "No corrective feedback required."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Inspector Evidence Files */}
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-300">Inspector Site Photos & Evidence:</p>
                  {inspectorEvidence.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No independent inspector photos recorded.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {inspectorEvidence.map((ie) => (
                        <div key={ie.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
                          <div className="flex items-center justify-between text-blue-400 font-mono text-[11px]">
                            <span>{ie.mediaType}</span>
                            <span>{ie.storagePath.split("/").pop()}</span>
                          </div>
                          <p className="text-slate-300 text-[11px] truncate">{ie.notes || "Site photo"}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-700/60 text-xs text-slate-400 flex items-center justify-between">
            <span>Inspector Authority: Human Site Audit</span>
            <span className="text-blue-400 font-medium">Independent Trust Layer</span>
          </div>
        </div>

      </div>

      {/* PANEL 3: CLIENT DECISION TOOLBAR */}
      <div className="bg-slate-800/90 rounded-2xl border border-slate-700/80 p-6 space-y-4 shadow-xl">
        <div className="flex items-center gap-2 border-b border-slate-700/60 pb-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-sm">
            3
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Client Decision Portal</h2>
            <p className="text-xs text-slate-400">Final milestone authorization by property owner</p>
          </div>
        </div>

        {milestone.status === "CLIENT_APPROVED" ? (
          <div className="bg-emerald-500/10 border border-emerald-500/40 p-5 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-emerald-300 font-extrabold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Milestone Formally Approved by Client</span>
            </div>
            <p className="text-xs text-slate-300">
              You approved this milestone based on Independent Inspector report reference{" "}
              <code className="bg-slate-900 px-2 py-0.5 rounded text-emerald-400">{inspectionReport?.id || "IR-VERIFIED"}</code>.
            </p>
          </div>
        ) : milestone.status === "INSPECTOR_VERIFIED" ? (
          <div className="space-y-4">
            <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-xl text-xs text-blue-200 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0" />
              <span>
                <strong>Independent inspection has marked this milestone VERIFIED.</strong> You can now review both evidence sets and formally approve the milestone or return it for attention.
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
              <button
                onClick={handleApprove}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-6 py-3.5 rounded-xl shadow-lg transition-all text-xs"
              >
                <UserCheck className="w-4 h-4" />
                <span>APPROVE MILESTONE</span>
              </button>

              <button
                onClick={() => setShowReturnModal(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-950 hover:bg-slate-900 text-amber-400 font-bold px-6 py-3.5 rounded-xl border border-amber-500/30 transition-all text-xs"
              >
                <UserX className="w-4 h-4" />
                <span>RETURN FOR CORRECTION</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Client approval is currently locked. This milestone must be marked <strong>INSPECTOR_VERIFIED</strong> by an independent site inspector before you can record formal client approval.
            </span>
          </div>
        )}
      </div>

      {/* Return for Correction Modal */}
      {showReturnModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              Return Milestone for Correction
            </h3>
            <p className="text-xs text-slate-300">
              The Inspector verified the physical work, but as the Client, you have legitimate concerns. Explain what requires attention.
            </p>

            <form onSubmit={handleReturn} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Reason / Required Action
                </label>
                <textarea
                  rows={4}
                  required
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  placeholder="e.g. Please clarify clean-up of surrounding site debris before we issue formal approval."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReturnModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold"
                >
                  Submit Return Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
