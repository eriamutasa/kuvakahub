"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { marketplaceStore } from "@/lib/marketplace-store";
import { LAUNCH_CITY, SERVICE_CATEGORIES } from "@/lib/constants";
import { Briefcase, MapPin, Search, FileSpreadsheet, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function ProviderJobsPage() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("all");

  const jobs = marketplaceStore.getMatchingJobsForProvider(
    selectedCategory === "all" ? undefined : selectedCategory
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold mb-1">
            <Briefcase className="w-4 h-4" />
            <span>Opportunities in {LAUNCH_CITY}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white">Find Construction Opportunities</h1>
          <p className="text-xs text-slate-400">
            Open jobs matching your trade category in {LAUNCH_CITY}, Zimbabwe
          </p>
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
        >
          <option value="all">All Trade Opportunities</option>
          {SERVICE_CATEGORIES.map((c) => (
            <option key={c.id} value={c.slug}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="space-y-4">
        {jobs.length === 0 ? (
          <div className="bg-slate-800/40 border border-slate-700/60 p-12 rounded-2xl text-center space-y-3">
            <Briefcase className="w-10 h-10 text-slate-500 mx-auto" />
            <p className="font-bold text-white text-sm">No Open Opportunities</p>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              There are currently no open jobs matching this category filter in {LAUNCH_CITY}. Check back soon!
            </p>
          </div>
        ) : (
          jobs.map((job) => {
            const userQuotes = marketplaceStore.getQuotationsForProject(
              job.id,
              user?.id || "",
              "PROVIDER"
            );

            const submittedQuote = userQuotes.find((q) => q.status === "SUBMITTED" || q.status === "ACCEPTED");
            const draftQuote = userQuotes.find((q) => q.status === "DRAFT");

            return (
              <div
                key={job.id}
                className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-6 space-y-4 shadow-lg"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-700/60 pb-3">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold mb-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{job.suburb}, {job.city} • Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white">{job.title}</h3>
                  </div>

                  <div className="flex items-center gap-2">
                    {submittedQuote ? (
                      <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>QUOTE SUBMITTED (${submittedQuote.totalAmount.toLocaleString()})</span>
                      </span>
                    ) : draftQuote ? (
                      <span className="bg-amber-500/20 text-amber-300 text-xs font-bold px-3 py-1 rounded-full border border-amber-500/30">
                        DRAFT SAVED
                      </span>
                    ) : (
                      <span className="bg-blue-500/20 text-blue-300 text-xs font-bold px-3 py-1 rounded-full border border-blue-500/30">
                        OPEN FOR QUOTE
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {job.description}
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <div className="text-xs text-slate-400">
                    <span>Est. Budget: </span>
                    <strong className="text-slate-200 font-bold">
                      {job.budgetEstimate ? `$${job.budgetEstimate.toLocaleString()}` : "Open Budget"}
                    </strong>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/provider/jobs/${job.id}`}
                      className="text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2.5 rounded-xl border border-slate-700"
                    >
                      View Details
                    </Link>

                    <Link
                      href={`/provider/jobs/${job.id}/quote`}
                      className="text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white px-5 py-2.5 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>{submittedQuote ? "Update Quotation" : "Submit Quotation"}</span>
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
