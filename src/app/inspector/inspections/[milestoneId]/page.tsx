"use client";

import React, { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { marketplaceStore } from "@/lib/marketplace-store";
import {
  ClipboardCheck,
  ShieldCheck,
  Camera,
  Upload,
  CheckCircle2,
  AlertCircle,
  XCircle,
  FileText,
  Lock,
  ArrowRight,
  Send,
  Building,
  Eye,
} from "lucide-react";

export default function InspectorWorkbenchPage({
  params,
}: {
  params: Promise<{ milestoneId: string }>;
}) {
  const { milestoneId } = use(params);
  const router = useRouter();
  const { user } = useAuth();

  const milestone = marketplaceStore.getMilestoneById(milestoneId);
  const project = milestone ? marketplaceStore.getProjectById(milestone.projectId) : undefined;

  if (!milestone || !project) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 p-8 text-center">
        <p className="text-slate-400 font-bold">Milestone or project record not found.</p>
      </div>
    );
  }
  const providerEvidence = marketplaceStore.getProviderEvidence(milestone.id);
  const assignments = user?.id ? marketplaceStore.getInspectionAssignmentsForInspector(user.id) : [];
  const assignment = assignments.find((a) => a.milestoneId === milestone.id);

  const [result, setResult] = useState<"VERIFIED" | "NEEDS_ATTENTION" | "REJECTED">("VERIFIED");
  const [summaryNotes, setSummaryNotes] = useState("");
  const [providerFeedback, setProviderFeedback] = useState("");
  const [notes, setNotes] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [uploadedEvidenceCount, setUploadedEvidenceCount] = useState(0);

  const handleUploadInspectorEvidence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim() || !user) return;

    const report = marketplaceStore.getInspectionReportForMilestone(milestone.id);
    const randomizedFileName = `inspector_proof_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
    const storagePath = `projects/${project.id}/milestones/${milestone.id}/inspector/${randomizedFileName}`;

    marketplaceStore.addInspectorEvidence(
      {
        reportId: report?.id || "ir-temp",
        uploadedByUserId: user.id,
        storagePath,
        mediaType: "IMAGE",
        fileSize: 3100000,
        mimeType: "image/jpeg",
        notes,
      },
      user.id
    );

    setUploadedEvidenceCount((prev) => prev + 1);
    setSuccessMsg("Independent site photo evidence saved to private inspector-evidence bucket.");
    setNotes("");
  };

  const handleSubmitInspectionReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!summaryNotes.trim() || !user || !assignment) {
      setErrorMsg("Please fill in official summary notes before submitting.");
      return;
    }

    const report = marketplaceStore.submitInspectionReport(
      milestone.id,
      assignment.id,
      result,
      summaryNotes,
      providerFeedback || "Please address requested site corrections.",
      user.id,
      user.fullName
    );

    if (report) {
      setSuccessMsg(`Official Inspection Report submitted as '${result}'!`);
      setTimeout(() => {
        router.push("/inspector/dashboard");
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 text-slate-100 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
          <ClipboardCheck className="w-4 h-4" />
          <span>Independent Inspector Verification Workbench</span>
        </div>
        <h1 className="text-2xl font-extrabold text-white">{milestone.title}</h1>
        <p className="text-xs text-slate-400">
          Project: <strong>{project.title}</strong> • Location: {project.suburb}, {project.city}
        </p>
      </div>

      {errorMsg && (
        <div className="bg-red-950/60 border border-red-800 p-3 rounded-xl flex items-center gap-2 text-xs text-red-200">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-950/60 border border-emerald-800 p-3 rounded-xl flex items-center gap-2 text-xs text-emerald-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* SECTION 1: BUILDER SUBMISSION (READ-ONLY) */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h2 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
            <Eye className="w-4 h-4" />
            <span>1. Builder Progress Evidence (Read-Only Audit)</span>
          </h2>
          <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
            {providerEvidence.length} Items Submitted
          </span>
        </div>

        {providerEvidence.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No builder evidence uploaded for this submission.</p>
        ) : (
          <div className="space-y-3 text-xs">
            {providerEvidence.map((pe) => (
              <div key={pe.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between font-mono text-[11px] text-amber-300">
                  <span>{pe.storagePath}</span>
                  <span className="text-[10px] text-slate-500">{new Date(pe.uploadedAt).toLocaleString()}</span>
                </div>
                <p className="text-slate-200 leading-relaxed font-sans">{pe.notes}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 2: INDEPENDENT INSPECTOR EVIDENCE UPLOAD */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
            <Camera className="w-4 h-4" />
            <span>2. Upload Independent Site Evidence (Private Inspector Bucket)</span>
          </h2>
          <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800">
            {uploadedEvidenceCount} Inspector Photos
          </span>
        </div>

        <form onSubmit={handleUploadInspectorEvidence} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Independent Site Observation Notes *
            </label>
            <input
              type="text"
              required
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Measured trench depth at 620mm. Rebar spacing verified at 200mm c/c."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <p className="text-[10px] text-slate-500 font-mono">
              Destination: <code>projects/{project.id}/milestones/{milestone.id}/inspector/*</code>
            </p>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 font-bold bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl shadow-sm"
            >
              <Upload className="w-4 h-4" />
              <span>Save Independent Site Photo</span>
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 3: OFFICIAL INSPECTION REPORT DECISION */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-5 shadow-xl">
        <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-wider border-b border-slate-800 pb-2">
          3. Record Official Inspection Result
        </h2>

        <form onSubmit={handleSubmitInspectionReport} className="space-y-4 text-xs">
          {/* Result Buttons */}
          <div>
            <label className="block text-slate-300 font-semibold mb-2">Select Official Milestone Result *</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setResult("VERIFIED")}
                className={`p-3.5 rounded-xl border font-bold flex items-center justify-center gap-2 transition-all ${
                  result === "VERIFIED"
                    ? "bg-emerald-600 text-white border-emerald-400 shadow-md ring-1 ring-emerald-400"
                    : "bg-slate-950 text-slate-300 border-slate-800"
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>VERIFIED</span>
              </button>

              <button
                type="button"
                onClick={() => setResult("NEEDS_ATTENTION")}
                className={`p-3.5 rounded-xl border font-bold flex items-center justify-center gap-2 transition-all ${
                  result === "NEEDS_ATTENTION"
                    ? "bg-amber-600 text-white border-amber-400 shadow-md ring-1 ring-amber-400"
                    : "bg-slate-950 text-slate-300 border-slate-800"
                }`}
              >
                <AlertCircle className="w-4 h-4 text-amber-300" />
                <span>NEEDS ATTENTION</span>
              </button>

              <button
                type="button"
                onClick={() => setResult("REJECTED")}
                className={`p-3.5 rounded-xl border font-bold flex items-center justify-center gap-2 transition-all ${
                  result === "REJECTED"
                    ? "bg-red-600 text-white border-red-400 shadow-md ring-1 ring-red-400"
                    : "bg-slate-950 text-slate-300 border-slate-800"
                }`}
              >
                <XCircle className="w-4 h-4 text-red-300" />
                <span>REJECTED</span>
              </button>
            </div>
          </div>

          {/* Private Summary Notes */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Private Summary Notes (Visible to Client, Inspector & Admin ONLY) *
            </label>
            <textarea
              rows={3}
              required
              value={summaryNotes}
              onChange={(e) => setSummaryNotes(e.target.value)}
              placeholder="Detailed engineering audit assessment, concrete test cube results, structural alignment details..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
            />
          </div>

          {/* Provider Correction Instructions */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Safe Provider Correction Instructions (Shared with Builder)
            </label>
            <textarea
              rows={2}
              value={providerFeedback}
              onChange={(e) => setProviderFeedback(e.target.value)}
              placeholder="Instructions for contractor: Clean excavation debris, re-align corner pegs before next pour..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 font-bold bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3.5 rounded-xl shadow-lg transition-all"
            >
              <Send className="w-4 h-4" />
              <span>Submit Official Inspection Report</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
