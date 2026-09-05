"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { marketplaceStore } from "@/lib/marketplace-store";
import { LAUNCH_CITY } from "@/lib/constants";
import { FolderKanban, PlusCircle, Building, MapPin, FileSpreadsheet, ArrowRight, ShieldCheck } from "lucide-react";

export default function ClientProjectsPage() {
  const { user } = useAuth();
  const projects = user?.id ? marketplaceStore.getProjectsForClient(user.id) : [];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-amber-400" />
            <span>My Property Projects ({LAUNCH_CITY})</span>
          </h1>
          <p className="text-xs text-slate-400">
            Manage your posted projects, compare quotes, and monitor construction progress
          </p>
        </div>

        <Link
          href="/client/projects/new"
          className="inline-flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold px-5 py-3 rounded-xl shadow-md transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post New Project</span>
        </Link>
      </div>

      <div className="space-y-4">
        {projects.length === 0 ? (
          <div className="bg-slate-800/40 border border-slate-700/60 p-12 rounded-2xl text-center space-y-3">
            <FolderKanban className="w-10 h-10 text-slate-500 mx-auto" />
            <p className="font-bold text-white text-sm">You haven&apos;t posted a project yet.</p>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Post your construction, plumbing, or roofing project in Chinhoyi to receive itemized quotations from local professionals.
            </p>
            <Link
              href="/client/projects/new"
              className="inline-block text-xs font-bold bg-amber-600 text-white px-5 py-2.5 rounded-xl shadow-sm"
            >
              Post Project Now
            </Link>
          </div>
        ) : (
          projects.map((proj) => {
            const quotations = marketplaceStore.getQuotationsForProject(
              proj.id,
              user?.id || "",
              "CLIENT"
            );

            return (
              <div
                key={proj.id}
                className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-6 space-y-4 shadow-lg"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-700/60 pb-3">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold mb-1">
                      <Building className="w-3.5 h-3.5" />
                      <span>{proj.categoryName} • {proj.suburb}, {proj.city}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white">{proj.title}</h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="bg-amber-500/20 text-amber-300 text-xs font-bold px-3 py-1 rounded-full border border-amber-500/30">
                      {proj.status.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {proj.description}
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                    <FileSpreadsheet className="w-4 h-4 text-amber-400" />
                    <span>{quotations.length} Quotation{quotations.length === 1 ? "" : "s"} Received</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/client/projects/${proj.id}/quotations`}
                      className="text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white px-4 py-2.5 rounded-xl shadow-sm transition-all"
                    >
                      Compare Quotations ({quotations.length})
                    </Link>

                    <Link
                      href={`/client/projects/${proj.id}`}
                      className="text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2.5 rounded-xl border border-slate-700"
                    >
                      Project Hub
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
