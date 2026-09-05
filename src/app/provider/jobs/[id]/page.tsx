"use client";

import React, { use } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { marketplaceStore } from "@/lib/marketplace-store";
import { Briefcase, Building, MapPin, Calendar, FileSpreadsheet, Lock, ArrowRight, ShieldCheck } from "lucide-react";

export default function ProviderJobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();

  const job = marketplaceStore.getProjectById(id);
  if (!job) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 p-8 text-center">
        <p className="text-slate-400">Job opportunity record not found.</p>
      </div>
    );
  }

  const userQuotes = marketplaceStore.getQuotationsForProject(
    job.id,
    user?.id || "",
    "PROVIDER"
  );
  const existingQuote = userQuotes[0];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-6">
      {/* Privacy Guarantee Banner */}
      <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-start gap-3 text-xs text-slate-300">
        <Lock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-white">Privacy & Secrecy Policy</p>
          <p className="text-slate-400 leading-relaxed">
            Client contact details and exact property addresses are hidden until quotation acceptance. Your quotation details and pricing remain strictly confidential and will <strong>never</strong> be disclosed to competitor service providers.
          </p>
        </div>
      </div>

      <div className="bg-slate-800/60 border border-slate-700/80 p-6 rounded-2xl space-y-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-700/60 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold mb-1">
              <Building className="w-3.5 h-3.5" />
              <span>{job.categoryName} • {job.suburb}, {job.city}</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white">{job.title}</h1>
          </div>

          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
            {job.budgetEstimate ? `$${job.budgetEstimate.toLocaleString()}` : "Open Budget"}
          </span>
        </div>

        <div>
          <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">Project Scope & Specifications</h3>
          <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800">
            {job.description}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <p className="text-slate-400">Target Location</p>
            <p className="font-bold text-white mt-0.5">{job.suburb}, {job.city}</p>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <p className="text-slate-400">Preferred Start</p>
            <p className="font-bold text-white mt-0.5">{job.preferredTimeframe}</p>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <p className="text-slate-400">Quotation Format</p>
            <p className="font-bold text-emerald-400 mt-0.5">Labour + Materials</p>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between">
          <Link
            href="/provider/jobs"
            className="text-xs text-slate-400 hover:text-white font-medium"
          >
            ← Back to All Opportunities
          </Link>

          <Link
            href={`/provider/jobs/${job.id}/quote`}
            className="inline-flex items-center gap-2 text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white px-6 py-3 rounded-xl shadow-md transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{existingQuote ? "Edit Submitted Quotation" : "Build Itemized Quotation"}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
