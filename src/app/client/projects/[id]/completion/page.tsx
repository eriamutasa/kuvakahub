"use client";

import React, { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { marketplaceStore } from "@/lib/marketplace-store";
import {
  ArrowLeft,
  CheckCircle2,
  Building,
  ShieldCheck,
  Award,
  FileText,
  Star,
  DollarSign,
  Calendar,
  User,
  AlertTriangle,
  Send,
} from "lucide-react";

export default function ClientProjectCompletionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user } = useAuth();
  const router = useRouter();

  const [overallRating, setOverallRating] = useState(5);
  const [qualityRating, setQualityRating] = useState(5);
  const [commRating, setCommRating] = useState(5);
  const [timeRating, setTimeRating] = useState(5);
  const [reviewText, setReviewText] = useState("");

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
  const quotations = marketplaceStore.getQuotationsForProject(
    project.id,
    user?.id || "",
    user?.role || "CLIENT"
  );
  const acceptedQuote = quotations.find((q) => q.status === "ACCEPTED");

  const canComplete = marketplaceStore.canCompleteProject(project.id);
  const canReview = marketplaceStore.canSubmitReview(project.id, user?.id || "");
  const existingReviews = marketplaceStore.getReviewsForProvider(acceptedQuote?.providerId || "");
  const myReview = existingReviews.find((r) => r.projectId === project.id);

  const handleCompleteProject = () => {
    setActionError(null);
    const success = marketplaceStore.completeProject(project.id, user?.id || "");
    if (success) {
      setActionSuccess("Project formally marked as COMPLETED! Construction Passport generated.");
      setTimeout(() => router.refresh(), 1000);
    } else {
      setActionError("Cannot complete project until all milestones are marked CLIENT_APPROVED.");
    }
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    if (!acceptedQuote || !reviewText.trim()) return;

    const review = marketplaceStore.submitProviderReview({
      projectId: project.id,
      reviewerClientId: user?.id || "",
      reviewerName: user?.fullName || "Account",
      providerId: acceptedQuote.providerId,
      overallRating,
      qualityRating,
      communicationRating: commRating,
      timelinessRating: timeRating,
      reviewText: reviewText.trim(),
    });

    if (review) {
      setActionSuccess("Verified review submitted successfully!");
      setTimeout(() => router.refresh(), 1000);
    } else {
      setActionError("Failed to submit review. Project must be COMPLETED first.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div>
        <Link
          href={`/client/projects/${project.id}`}
          className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-semibold hover:underline mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Project Overview
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 rounded-2xl border border-slate-700/80 shadow-xl">
          <div>
            <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold mb-1">
              <Award className="w-4 h-4 text-amber-400" />
              <span>KuvakaHub Construction Passport & Formal Completion</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white">{project.title}</h1>
            <p className="text-xs text-slate-300 mt-1">Verified permanent record of physical site inspection, milestone completion, and financial settlement.</p>
          </div>
          <span className={`text-xs font-extrabold px-4 py-1.5 rounded-full border ${
            project.status === "COMPLETED"
              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
              : "bg-amber-500/20 text-amber-300 border-amber-500/40"
          }`}>
            {project.status.replace(/_/g, " ")}
          </span>
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

      {/* COMPLETE PROJECT ACTION BUTTON (If not completed yet) */}
      {project.status !== "COMPLETED" && (
        <div className="bg-slate-800/80 border border-slate-700/80 p-6 rounded-2xl space-y-3 shadow-xl">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            Project Completion Authorization
          </h2>
          <p className="text-xs text-slate-300">
            {canComplete
              ? "All project milestones have been independently inspected and marked CLIENT_APPROVED. You may now formally authorize project completion."
              : "Complete project action is locked. All project milestones must be CLIENT_APPROVED before you can complete this project."}
          </p>

          <button
            onClick={handleCompleteProject}
            disabled={!canComplete}
            className={`text-xs font-extrabold px-6 py-3.5 rounded-xl shadow-lg transition-all flex items-center gap-2 ${
              canComplete
                ? "bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
                : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
            }`}
          >
            <Award className="w-4 h-4 text-amber-400" />
            <span>MARK PROJECT COMPLETED</span>
          </button>
        </div>
      )}

      {/* UNPAID BALANCE WARNING REQUIREMENT */}
      {summary.remainingAmount > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl text-xs text-amber-300 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          <span>
            <strong>Settlement Status:</strong> Construction completed — financial settlement outstanding of ${summary.remainingAmount.toLocaleString()}.
          </span>
        </div>
      )}

      {/* CONSTRUCTION PASSPORT FOUNDATION CARD */}
      <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-6 space-y-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">KuvakaHub Construction Passport Summary</h2>
          </div>
          <span className="text-xs bg-amber-500/20 text-amber-300 font-extrabold px-3 py-1 rounded-full border border-amber-500/30">
            VERIFIED PASSPORT RECORD
          </span>
        </div>

        {/* Passport Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-400 flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-amber-400" /> Primary Contractor</span>
            <p className="font-bold text-white text-sm">{acceptedQuote?.providerBusinessName || "Selected Contractor"}</p>
            <p className="text-slate-400 text-[11px]">Lead Builder: {acceptedQuote?.providerName || "Provider"}</p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-400 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-blue-400" /> Location & Hub</span>
            <p className="font-bold text-white text-sm">{project.suburb}, {project.city}</p>
            <p className="text-slate-400 text-[11px]">Category: {project.categoryName}</p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-400 flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Total Contract Value</span>
            <p className="font-bold text-emerald-400 text-sm">${summary.quoteTotal.toLocaleString()}</p>
            <p className="text-slate-400 text-[11px]">Total Paid: ${summary.paidAmount.toLocaleString()}</p>
          </div>
        </div>

        {/* Milestones Verification Summary */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Verified Milestones Audit Record</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {milestones.map((m) => (
              <div key={m.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-white">{m.title}</p>
                  <p className="text-slate-400 text-[11px]">${m.amount.toLocaleString()} • Target: {m.dueDate || "N/A"}</p>
                </div>
                <span className="bg-emerald-500/20 text-emerald-300 text-[11px] font-extrabold px-2.5 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> VERIFIED
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* VERIFIED REVIEW SECTION */}
      <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-6 space-y-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            <h2 className="text-base font-bold text-white">Verified Provider Review</h2>
          </div>
          <span className="bg-blue-500/20 text-blue-300 text-xs font-extrabold px-3 py-1 rounded-full border border-blue-500/30">
            VERIFIED PROJECT BADGE
          </span>
        </div>

        {myReview ? (
          <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="bg-amber-500/20 text-amber-300 text-xs font-extrabold px-3 py-1 rounded-full border border-amber-500/30 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {myReview.overallRating} / 5
                </span>
                <span className="text-xs font-bold text-white">{myReview.reviewerName}</span>
              </div>
              <span className="text-[11px] text-slate-400">{new Date(myReview.createdAt).toLocaleDateString()}</span>
            </div>

            <p className="text-xs text-slate-300 italic">{myReview.reviewText}</p>

            <div className="text-[11px] text-emerald-400 font-extrabold flex items-center gap-1.5 pt-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> VERIFIED PROJECT REVIEW (Tied to completed Chinhoyi project)
            </div>
          </div>
        ) : canReview ? (
          <form onSubmit={handleSubmitReview} className="space-y-4 bg-slate-950 p-5 rounded-xl border border-slate-800">
            <p className="text-xs font-extrabold text-white">How was your experience with {acceptedQuote?.providerBusinessName || "your Builder"}?</p>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Overall Rating</label>
                <select
                  value={overallRating}
                  onChange={(e) => setOverallRating(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-amber-400 font-bold focus:outline-none"
                >
                  <option value={5}>5 ★★★★★ (Excellent)</option>
                  <option value={4}>4 ★★★★☆ (Good)</option>
                  <option value={3}>3 ★★★☆☆ (Average)</option>
                  <option value={2}>2 ★★☆☆☆ (Poor)</option>
                  <option value={1}>1 ★☆☆☆☆ (Terrible)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Quality of Work</label>
                <select
                  value={qualityRating}
                  onChange={(e) => setQualityRating(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none"
                >
                  <option value={5}>5 - Top Workmanship</option>
                  <option value={4}>4 - High Quality</option>
                  <option value={3}>3 - Acceptable</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Communication</label>
                <select
                  value={commRating}
                  onChange={(e) => setCommRating(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none"
                >
                  <option value={5}>5 - Responsive & Clear</option>
                  <option value={4}>4 - Good Communication</option>
                  <option value={3}>3 - Adequate</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Timeliness</label>
                <select
                  value={timeRating}
                  onChange={(e) => setTimeRating(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none"
                >
                  <option value={5}>5 - On Schedule</option>
                  <option value={4}>4 - Minor Delays</option>
                  <option value={3}>3 - Delayed</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Written Review</label>
              <textarea
                rows={3}
                required
                placeholder="What should other KuvakaHub clients know about this provider's work?"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-extrabold px-6 py-3 rounded-xl shadow-lg transition-all"
            >
              <Send className="w-4 h-4" />
              <span>Submit Verified Review</span>
            </button>
          </form>
        ) : (
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-400">
            Reviews can only be submitted after project completion by the verified project owner.
          </div>
        )}
      </div>
    </div>
  );
}
