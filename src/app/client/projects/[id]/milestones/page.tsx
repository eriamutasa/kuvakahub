"use client";

import React, { use, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { marketplaceStore, Milestone } from "@/lib/marketplace-store";
import { LAUNCH_CITY } from "@/lib/constants";
import {
  FolderKanban,
  Plus,
  Building,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Play,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Lock,
} from "lucide-react";

export default function ClientMilestonesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();

  const project = marketplaceStore.getProjectById(id) || marketplaceStore.getProjects()[0];
  const milestones = marketplaceStore.getMilestonesForProject(project.id);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("2026-10-15");
  const [showAddModal, setShowAddModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const handleActivateProject = () => {
    if (!user) return;
    marketplaceStore.activateProject(project.id, user.id);
    setSuccessMsg("Project is now ACTIVE! Milestones are ready for execution.");
  };

  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount || !user) return;

    marketplaceStore.createMilestone(
      {
        projectId: project.id,
        title,
        description,
        orderIndex: milestones.length + 1,
        amount: parseFloat(amount),
        dueDate,
      },
      user.id
    );

    setShowAddModal(false);
    setTitle("");
    setDescription("");
    setAmount("");
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-800/60 border border-slate-700/80 p-6 rounded-2xl space-y-3 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-700/60 pb-3">
          <div>
            <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold mb-1">
              <Building className="w-3.5 h-3.5" />
              <span>{project.categoryName} • {project.suburb}, {project.city}</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white">{project.title}</h1>
          </div>

          <div className="flex items-center gap-2">
            <span className="bg-amber-500/20 text-amber-300 text-xs font-bold px-3 py-1 rounded-full border border-amber-500/30">
              {project.status.replace(/_/g, " ")}
            </span>
          </div>
        </div>

        {/* Project Activation Trigger */}
        {project.status === "PROVIDER_SELECTED" && (
          <div className="bg-amber-950/60 border border-amber-800 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <p className="font-bold text-white">Provider Selected — Ready for Activation</p>
              <p className="text-amber-200">Activate this project to begin milestone tracking and independent site inspections.</p>
            </div>
            <button
              onClick={handleActivateProject}
              className="inline-flex items-center gap-2 text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white px-5 py-2.5 rounded-xl shadow-md transition-all shrink-0"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Activate Project</span>
            </button>
          </div>
        )}
      </div>

      {successMsg && (
        <div className="bg-emerald-950/80 border border-emerald-800 p-4 rounded-xl flex items-center gap-3 text-xs text-emerald-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="font-bold">{successMsg}</span>
        </div>
      )}

      {/* Milestone Timeline Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-amber-400" />
            <span>Project Milestones ({milestones.length})</span>
          </h2>
          <p className="text-xs text-slate-400">Sequential construction timeline & independent verification targets</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white px-4 py-2.5 rounded-xl shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Milestone</span>
        </button>
      </div>

      {/* Milestone Timeline Feed */}
      <div className="space-y-4">
        {milestones.map((ms, idx) => (
          <div
            key={ms.id}
            className={`bg-slate-800/60 border rounded-2xl p-5 space-y-3 transition-all ${
              ms.status === "CLIENT_APPROVED"
                ? "border-emerald-500/60 bg-emerald-950/10"
                : ms.status === "INSPECTOR_VERIFIED"
                ? "border-emerald-500/80 bg-slate-800/90 shadow-emerald-950/20 shadow-lg"
                : ms.status === "NEEDS_ATTENTION" || ms.status === "REJECTED"
                ? "border-amber-500/80 bg-amber-950/20"
                : "border-slate-700/80"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700/60 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-950 text-amber-400 border border-amber-500/30 flex items-center justify-center text-xs font-extrabold shrink-0">
                  {ms.orderIndex}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{ms.title}</h3>
                  <p className="text-xs text-slate-400">Target Value: ${ms.amount.toLocaleString()} USD</p>
                </div>
              </div>

              <span
                className={`text-[10px] font-bold px-3 py-1 rounded-full border uppercase ${
                  ms.status === "CLIENT_APPROVED"
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                    : ms.status === "INSPECTOR_VERIFIED"
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                    : ms.status === "INSPECTION_REQUIRED"
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                    : ms.status === "NEEDS_ATTENTION"
                    ? "bg-amber-500/30 text-amber-200 border-amber-500/50"
                    : "bg-slate-900 text-slate-400 border-slate-800"
                }`}
              >
                {ms.status.replace(/_/g, " ")}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{ms.description}</p>

            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-700/50 text-xs">
              <div className="flex items-center gap-2 text-slate-400">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>Target Date: {ms.dueDate || "Not set"}</span>
              </div>

              <Link
                href={`/client/projects/${project.id}/milestones/${ms.id}`}
                className="inline-flex items-center justify-center gap-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 px-4 py-2 rounded-xl transition-all"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Verification Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Add Milestone Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">
              Add Project Milestone
            </h3>

            <form onSubmit={handleAddMilestone} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Milestone Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 5. Roof Truss Framing & Sheeting"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description *</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe technical work requirements and inspection criteria..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Value ($ USD) *</label>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="1800"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Target Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 font-bold text-white"
                >
                  Create Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
