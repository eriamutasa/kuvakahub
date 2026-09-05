"use client";

import React, { useState } from "react";
import Link from "next/link";
import { APP_NAME, LAUNCH_CITY, SERVICE_CATEGORIES, CHINHOYI_SUBURBS } from "@/lib/constants";
import { marketplaceStore } from "@/lib/marketplace-store";
import { Briefcase, MapPin, Search, ShieldCheck, Lock, Calendar, ArrowRight } from "lucide-react";

export default function PublicJobsPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSuburb, setSelectedSuburb] = useState("all");

  const realJobs = marketplaceStore.getPublicJobListings();

  const filteredJobs = realJobs.filter((job) => {
    if (selectedCategory !== "all" && job.categorySlug !== selectedCategory) return false;
    if (selectedSuburb !== "all" && job.suburb !== selectedSuburb) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* Privacy Notice Banner */}
      <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-start gap-3 text-xs text-slate-300">
        <Lock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-white">Public Job Privacy & Data Protection</p>
          <p className="text-slate-400 leading-relaxed">
            Public job cards show general category, city, suburb, and work summary. Exact property addresses, client contact details, and house plans are strictly restricted to authenticated bidding service providers.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-amber-400" />
            <span>Available Jobs in {LAUNCH_CITY}</span>
          </h1>
          <p className="text-xs text-slate-400">
            Current construction opportunities in {LAUNCH_CITY}, Zimbabwe
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Categories</option>
            {SERVICE_CATEGORIES.map((c) => (
              <option key={c.id} value={c.slug}>{c.name}</option>
            ))}
          </select>

          <select
            value={selectedSuburb}
            onChange={(e) => setSelectedSuburb(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Suburbs</option>
            {CHINHOYI_SUBURBS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Job Cards Feed */}
      <div className="space-y-4">
        {filteredJobs.length === 0 ? (
          <div className="bg-slate-800/40 border border-slate-700/60 p-12 rounded-2xl text-center space-y-3">
            <Briefcase className="w-12 h-12 text-slate-500 mx-auto" />
            <h3 className="text-lg font-bold text-white">No open projects available right now.</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              New property construction projects posted by clients in {LAUNCH_CITY} will appear in this public marketplace feed.
            </p>
          </div>
        ) : (
          filteredJobs.map((job) => (
            <div
              key={job.id}
              className="bg-slate-800/50 hover:bg-slate-800/80 border border-slate-700/60 p-6 rounded-2xl transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700/50 pb-3">
                <div>
                  <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold mb-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{job.suburb}, {job.city} • {new Date(job.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white">{job.title}</h3>
                </div>

                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
                  {job.preferredTimeframe}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{job.description}</p>

              <div className="flex items-center justify-between pt-2 text-xs">
                <span className="text-slate-400 font-medium">{job.categoryName}</span>

                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 font-bold bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-xl transition-all"
                >
                  <span>Submit Quotation</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
