"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { LAUNCH_CITY } from "@/lib/constants";
import { marketplaceStore } from "@/lib/marketplace-store";
import {
  ClipboardCheck,
  ShieldCheck,
  MapPin,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Camera,
  FileText,
  UserCheck,
} from "lucide-react";

export default function InspectorDashboardPage() {
  const { user } = useAuth();
  const assignments = user?.id ? marketplaceStore.getInspectionAssignmentsForInspector(user.id) : [];

  const qualifications = user?.profileDetails?.qualifications || "Independent Site Inspector";

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 to-slate-900 border border-emerald-900/40 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border border-emerald-500/30">
              Independent Inspector Workbench
            </span>
            <span className="text-xs text-slate-400">Assigned Area: {LAUNCH_CITY}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-1">{user?.fullName || "Account"}</h1>
          <p className="text-xs text-emerald-300 font-mono">
            {qualifications}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 border border-emerald-800/40 px-4 py-2.5 rounded-xl">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <div className="text-xs">
            <p className="text-slate-400 text-[10px]">Verification Authority:</p>
            <p className="font-bold text-emerald-400 uppercase tracking-wider">OFFICIAL INSPECTOR</p>
          </div>
        </div>
      </div>

      {/* Segregated Evidence Mandate */}
      <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-start gap-3 text-xs text-slate-300">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-white">Segregated Independent Evidence Rule</p>
          <p className="text-slate-400 leading-relaxed">
            Your site inspection photos, video notes, and status assessments are stored in a dedicated private bucket (<code>inspector-evidence</code>). Builders cannot edit or overwrite your inspection reports.
          </p>
        </div>
      </div>

      {/* Assigned Site Inspections */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-emerald-400" />
            <span>Assigned Site Inspections in {LAUNCH_CITY}</span>
          </h2>
          <span className="text-xs text-slate-400">{assignments.length} Scheduled Visit{assignments.length === 1 ? "" : "s"}</span>
        </div>

        {assignments.length === 0 ? (
          <div className="bg-slate-800/40 border border-slate-700/60 p-12 rounded-2xl text-center space-y-3">
            <ClipboardCheck className="w-12 h-12 text-slate-500 mx-auto" />
            <h3 className="text-lg font-bold text-white">No inspections assigned.</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              When an Admin assigns you to perform independent milestone site verification in {LAUNCH_CITY}, your assignments will appear here.
            </p>
          </div>
        ) : (
          assignments.map((assign) => {
            const milestone = marketplaceStore.getMilestoneById(assign.milestoneId);
            const project = milestone ? marketplaceStore.getProjectById(milestone.projectId) : undefined;

            return (
              <div key={assign.id} className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-6 space-y-4 shadow-lg">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-700/60 pb-3">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold mb-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{project?.suburb || "Chinhoyi"}, {LAUNCH_CITY} • Scheduled: {assign.scheduledDate}</span>
                    </div>
                    <h3 className="text-base font-bold text-white">{milestone?.title || "Milestone Site Inspection"}</h3>
                    <p className="text-xs text-slate-400">Project: {project?.title || "Property Construction"} • Client: {project?.clientName || "Client"}</p>
                  </div>

                  <span className="text-xs font-bold text-amber-300 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
                    {assign.status.replace(/_/g, " ")}
                  </span>
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <Link
                    href={`/inspector/inspections/${assign.milestoneId}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl shadow-sm"
                  >
                    <ClipboardCheck className="w-4 h-4" />
                    <span>Conduct Site Inspection</span>
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
