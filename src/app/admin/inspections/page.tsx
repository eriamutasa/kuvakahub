"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { marketplaceStore } from "@/lib/marketplace-store";
import { LAUNCH_CITY } from "@/lib/constants";
import {
  ClipboardCheck,
  Shield,
  UserCheck,
  MapPin,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Building,
} from "lucide-react";

export default function AdminInspectionsPage() {
  const { user } = useAuth();
  const unassignedList = marketplaceStore.getUnassignedMilestonesForInspection();
  const verifiedInspectors = marketplaceStore.getVerifiedInspectors();

  const [selectedInspectorId, setSelectedInspectorId] = useState<string>(
    verifiedInspectors[0]?.id || ""
  );
  const [scheduledDate, setScheduledDate] = useState("2026-09-07");
  const [successMsg, setSuccessMsg] = useState("");

  const handleAssignInspector = (milestoneId: string) => {
    if (!user) return;
    const inspector = verifiedInspectors.find((i) => i.id === selectedInspectorId) || verifiedInspectors[0];
    if (!inspector) return;

    const assignment = marketplaceStore.assignInspectorToMilestone(
      milestoneId,
      inspector.id,
      inspector.name,
      scheduledDate,
      user.id
    );

    if (assignment) {
      setSuccessMsg(`Inspector ${inspector.name} assigned to site visit on ${scheduledDate}!`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-950 to-slate-900 border border-purple-900/40 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-purple-500/20 text-purple-300 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border border-purple-500/30">
              Admin Inspection Coordinator
            </span>
            <span className="text-xs text-slate-400">Hub: {LAUNCH_CITY}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-1">Inspector Assignment Control</h1>
          <p className="text-xs text-slate-300">
            Assign registered independent site inspectors to verified milestone submissions.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 border border-purple-800/40 px-4 py-2.5 rounded-xl">
          <Shield className="w-5 h-5 text-purple-400" />
          <span className="text-xs font-bold text-purple-300">Independent Oversight</span>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-950/80 border border-emerald-800 p-4 rounded-xl flex items-center gap-3 text-xs text-emerald-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="font-bold">{successMsg}</span>
        </div>
      )}

      {/* Unassigned Milestones Needing Inspection */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <ClipboardCheck className="w-5 h-5 text-purple-400" />
          <span>Milestones Awaiting Inspector Assignment ({unassignedList.length})</span>
        </h2>

        {unassignedList.length === 0 ? (
          <div className="bg-slate-800/40 border border-slate-700/60 p-12 rounded-2xl text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <p className="font-bold text-white text-sm">All Submissions Assigned</p>
            <p className="text-xs text-slate-400">There are currently no unassigned milestones requiring inspection.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {unassignedList.map(({ milestone, project }) => (
              <div
                key={milestone.id}
                className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 space-y-3 shadow-lg"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700/60 pb-3">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold mb-1">
                      <Building className="w-3.5 h-3.5" />
                      <span>{project.title} • {project.suburb}, {project.city}</span>
                    </div>
                    <h3 className="text-base font-bold text-white">{milestone.title}</h3>
                  </div>

                  <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                    INSPECTION REQUIRED
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{milestone.description}</p>

                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-700/50 text-xs">
                  <div className="space-y-1">
                    <p className="text-slate-400">Assign Verified Inspector:</p>
                    {verifiedInspectors.length === 0 ? (
                      <p className="font-bold text-amber-400">No verified inspectors available.</p>
                    ) : (
                      <select
                        value={selectedInspectorId || verifiedInspectors[0]?.id}
                        onChange={(e) => setSelectedInspectorId(e.target.value)}
                        className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                      >
                        {verifiedInspectors.map((insp) => (
                          <option key={insp.id} value={insp.id}>
                            {insp.name} {insp.qualification ? `(${insp.qualification})` : ""}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                    />

                    <button
                      onClick={() => handleAssignInspector(milestone.id)}
                      disabled={verifiedInspectors.length === 0}
                      className="inline-flex items-center gap-1.5 font-bold bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 disabled:text-slate-500 text-white px-4 py-2 rounded-xl shadow-md transition-all"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Assign Inspector</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
