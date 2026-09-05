"use client";

import React, { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { marketplaceStore } from "@/lib/marketplace-store";
import {
  Camera,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileText,
  Lock,
  ArrowRight,
  ShieldCheck,
  Send,
  RotateCcw,
} from "lucide-react";

export default function ProviderEvidenceUploadPage({
  params,
}: {
  params: Promise<{ id: string; milestoneId: string }>;
}) {
  const { id, milestoneId } = use(params);
  const router = useRouter();
  const { user } = useAuth();

  const project = marketplaceStore.getProjectById(id) || marketplaceStore.getProjects()[0];
  const milestone = marketplaceStore.getMilestoneById(milestoneId) || marketplaceStore.getMilestonesForProject(project.id)[1];
  const evidenceList = marketplaceStore.getProviderEvidence(milestone.id);
  const inspectionReport = marketplaceStore.getInspectionReportForMilestone(milestone.id);

  const [notes, setNotes] = useState("");
  const [mediaType, setMediaType] = useState<"IMAGE" | "VIDEO" | "DOCUMENT">("IMAGE");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const isLocked = milestone.status === "PROVIDER_SUBMITTED" || milestone.status === "INSPECTION_REQUIRED" || milestone.status === "CLIENT_APPROVED";

  const handleUploadEvidence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim() || !user) return;

    const randomizedFileName = `evidence_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
    const storagePath = `projects/${project.id}/milestones/${milestone.id}/provider/${randomizedFileName}`;

    const uploaded = marketplaceStore.addProviderEvidence(
      {
        milestoneId: milestone.id,
        uploadedByUserId: user.id,
        storagePath,
        mediaType,
        fileSize: 2450000,
        mimeType: mediaType === "IMAGE" ? "image/jpeg" : mediaType === "VIDEO" ? "video/mp4" : "application/pdf",
        notes,
      },
      user.id
    );

    if (uploaded) {
      setSuccessMsg("Evidence uploaded successfully!");
      setNotes("");
    } else {
      setErrorMsg("Cannot upload evidence to locked or unauthorized milestone.");
    }
  };

  const handleSubmitForInspection = () => {
    if (!user) return;
    if (evidenceList.length === 0) {
      setErrorMsg("You must upload at least one progress photo/evidence item before submitting for inspection.");
      return;
    }

    const success = marketplaceStore.submitMilestoneForInspection(milestone.id, user.id);
    if (success) {
      setSuccessMsg("Milestone submitted! An independent site inspector will be assigned.");
      setTimeout(() => {
        router.push(`/provider/projects/${project.id}`);
      }, 1500);
    }
  };

  const handleResubmitWork = () => {
    if (!user) return;
    marketplaceStore.resubmitMilestoneProvider(milestone.id, user.id);
    setSuccessMsg("Milestone reset to IN_PROGRESS for corrective work.");
  };

  return (
    <div className="min-h-screen bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 text-slate-100 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold">
          <Camera className="w-4 h-4" />
          <span>Provider Milestone Evidence Workbench</span>
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

      {/* Provider Correction Feedback (If Returned/Needs Attention) */}
      {inspectionReport && (milestone.status === "NEEDS_ATTENTION" || milestone.status === "REJECTED") && (
        <div className="bg-amber-950/60 border border-amber-800 p-4 rounded-xl space-y-2 text-xs text-amber-200">
          <div className="flex items-center justify-between">
            <span className="font-bold text-amber-300 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" />
              <span>Inspection Correction Instructions ({inspectionReport.result})</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">{inspectionReport.createdAt}</span>
          </div>

          <p className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-slate-200 leading-relaxed">
            "{inspectionReport.providerFeedback || "Please address requested site corrections and resubmit updated evidence."}"
          </p>

          <button
            onClick={handleResubmitWork}
            className="inline-flex items-center gap-1.5 font-bold bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-lg shadow-sm"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Re-open Milestone for Corrective Uploads</span>
          </button>
        </div>
      )}

      {/* Evidence Immutability Locked Notice */}
      {isLocked && (
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-3 text-xs text-slate-300">
          <Lock className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <p className="font-bold text-white">Submitted Evidence Immutable</p>
            <p className="text-slate-400">
              This milestone has been submitted for independent inspection. Previously submitted evidence items are locked to maintain permanent audit integrity.
            </p>
          </div>
        </div>
      )}

      {/* Upload Form */}
      {!isLocked && (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider">
            Upload Progress Evidence
          </h3>

          <form onSubmit={handleUploadEvidence} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Evidence Type</label>
              <select
                value={mediaType}
                onChange={(e) => setMediaType(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
              >
                <option value="IMAGE">Photo / Site Image (.jpg, .png)</option>
                <option value="VIDEO">Short Site Video (.mp4)</option>
                <option value="DOCUMENT">Quality Test Report (.pdf)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Work Description & Notes *</label>
              <textarea
                rows={3}
                required
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Describe steel reinforcement spacing, concrete mix ratio, compaction test results..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
              />
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-dashed border-slate-700 text-center space-y-2">
              <Upload className="w-6 h-6 text-amber-400 mx-auto" />
              <p className="text-slate-300 font-medium">Select Site Photo/Video File</p>
              <p className="text-[10px] text-slate-500">
                Storage path will be randomized: <code>projects/{project.id}/milestones/{milestone.id}/provider/*</code>
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Camera className="w-4 h-4" />
              <span>Add Evidence Record</span>
            </button>
          </form>
        </div>
      )}

      {/* Submitted Evidence List */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <FileText className="w-4 h-4 text-amber-400" />
          <span>Uploaded Builder Evidence Items ({evidenceList.length})</span>
        </h3>

        {evidenceList.length === 0 ? (
          <p className="text-xs text-slate-500 italic bg-slate-900 p-4 rounded-xl border border-slate-800">
            No progress photos uploaded yet. Upload at least 1 photo before submitting for inspection.
          </p>
        ) : (
          <div className="space-y-3">
            {evidenceList.map((item) => (
              <div key={item.id} className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-emerald-400 text-[11px] truncate max-w-[280px]">
                    {item.storagePath}
                  </span>
                  <span className="text-[10px] text-slate-400">{new Date(item.uploadedAt).toLocaleString()}</span>
                </div>
                <p className="text-slate-200">{item.notes}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submission Action */}
      {!isLocked && (
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={handleSubmitForInspection}
            className="inline-flex items-center gap-2 font-bold bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3.5 rounded-xl shadow-lg transition-all text-xs"
          >
            <Send className="w-4 h-4" />
            <span>Submit Milestone for Independent Site Inspection</span>
          </button>
        </div>
      )}
    </div>
  );
}
