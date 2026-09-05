"use client";

import React, { use } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { marketplaceStore } from "@/lib/marketplace-store";
import { generateWhatsAppLink, getShareProjectMessage } from "@/lib/whatsapp";
import {
  FolderKanban,
  Building,
  MapPin,
  Calendar,
  FileSpreadsheet,
  MessageCircle,
  Users,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Clock,
  Activity,
  ArrowRight,
} from "lucide-react";

export default function ClientProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();

  const project = marketplaceStore.getProjectById(id);
  const quotations = project
    ? marketplaceStore.getQuotationsForProject(project.id, user?.id || "", "CLIENT")
    : [];
  const milestones = project ? marketplaceStore.getMilestonesForProject(project.id) : [];
  const auditLogs = marketplaceStore.getAuditLogs();

  if (!project) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 py-12 px-4 max-w-4xl mx-auto text-center space-y-4">
        <FolderKanban className="w-12 h-12 text-slate-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">Project Not Found</h2>
        <p className="text-xs text-slate-400">The requested construction project record does not exist.</p>
        <Link
          href="/client/projects"
          className="inline-block bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-4 py-2 rounded-xl"
        >
          Back to Projects
        </Link>
      </div>
    );
  }

  const waLink = generateWhatsAppLink(
    user?.phoneE164 || "",
    getShareProjectMessage(project.title, project.suburb, `https://kuvakahub.co.zw/jobs`)
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-800/60 border border-slate-700/80 p-6 rounded-2xl space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-700/60 pb-4">
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

        <p className="text-xs text-slate-300 leading-relaxed">{project.description}</p>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <p className="text-slate-400">Timeframe</p>
            <p className="font-bold text-white mt-0.5">{project.preferredTimeframe}</p>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <p className="text-slate-400">Budget Estimate</p>
            <p className="font-bold text-emerald-400 mt-0.5">
              {project.budgetEstimate ? `$${project.budgetEstimate.toLocaleString()}` : "Open"}
            </p>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <p className="text-slate-400">Visibility</p>
            <p className="font-bold text-white mt-0.5">{project.visibility}</p>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <p className="text-slate-400">Quotes Received</p>
            <p className="font-bold text-amber-400 mt-0.5">{quotations.length} Bids</p>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="pt-2 flex flex-wrap items-center gap-3">
          <Link
            href={`/client/projects/${project.id}/milestones`}
            className="inline-flex items-center gap-2 text-xs font-extrabold bg-blue-600 hover:bg-blue-500 text-white px-5 py-3 rounded-xl shadow-md transition-all"
          >
            <ShieldCheck className="w-4 h-4 text-blue-200" />
            <span>Verification & Milestones ({milestones.length})</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>

          <Link
            href={`/client/projects/${project.id}/quotations`}
            className="inline-flex items-center gap-2 text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white px-5 py-3 rounded-xl shadow-md transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Compare Quotations ({quotations.length})</span>
          </Link>

          <a
            href={waLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-3 rounded-xl shadow-md transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Share via WhatsApp</span>
          </a>
        </div>
      </div>

      {/* Permanent Project Timeline & Audit Record */}
      <div className="bg-slate-800/60 border border-slate-700/80 p-6 rounded-2xl space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">Permanent Project Timeline & Audit Log</h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">Immutable History</span>
        </div>

        {/* Chronological Timeline Events */}
        <div className="relative border-l-2 border-slate-700 ml-4 space-y-6 py-2">
          {auditLogs.length > 0 ? (
            auditLogs
              .filter((log) => log.entityId === project.id)
              .map((log) => (
                <div key={log.id} className="relative pl-6">
                  <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900" />
                  <div className="text-xs">
                    <span className="font-extrabold text-white">{log.action.replace(/_/g, " ")}</span>
                    <span className="text-slate-400 text-[11px] ml-2">
                      {new Date(log.createdAt).toLocaleDateString()}
                    </span>
                    <p className="text-slate-300 mt-0.5">
                      {log.metadata ? JSON.stringify(log.metadata) : "Recorded action."}
                    </p>
                  </div>
                </div>
              ))
          ) : (
            <div className="relative pl-6">
              <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900" />
              <div className="text-xs">
                <span className="font-extrabold text-white">Project Created</span>
                <span className="text-slate-400 text-[11px] ml-2">
                  {new Date(project.createdAt).toLocaleDateString()}
                </span>
                <p className="text-slate-300 mt-0.5">
                  Project initialized in {project.city} by client {project.clientName}.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
