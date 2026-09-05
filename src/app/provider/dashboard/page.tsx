"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { LAUNCH_CITY } from "@/lib/constants";
import { marketplaceStore, Project } from "@/lib/marketplace-store";
import {
  HardHat,
  Briefcase,
  ShieldAlert,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  ArrowRight,
  MapPin,
  Building,
} from "lucide-react";

export default function ProviderDashboardPage() {
  const { user } = useAuth();

  const businessName = user?.profileDetails?.businessName || "Service Business";
  const verificationStatus = user?.profileDetails?.verificationStatus || "UNVERIFIED";

  const openJobs = marketplaceStore.getPublicJobListings();
  const myProjects = user?.id ? marketplaceStore.getProjectsForProvider(user.id) : [];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-950 to-slate-900 border border-amber-900/40 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border border-amber-500/30">
              Service Provider Portal
            </span>
            <span className="text-xs text-slate-400">Operating in {LAUNCH_CITY}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-1">{businessName}</h1>
          <p className="text-xs text-slate-300">
            Professional Tradesperson • {user?.fullName || "Account"}
          </p>
        </div>

        {/* Verification Status Badge */}
        <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-4 py-2.5 rounded-xl">
          <ShieldAlert className="w-5 h-5 text-amber-400" />
          <div className="text-xs">
            <p className="text-slate-400 text-[10px]">Verification Status:</p>
            <p className="font-bold text-amber-400 uppercase tracking-wider">{verificationStatus}</p>
          </div>
        </div>
      </div>

      {/* Verification Notice */}
      <div className="bg-amber-950/40 border border-amber-800/50 p-4 rounded-xl flex items-start gap-3 text-xs text-amber-200">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-amber-300">Account Verification Status</p>
          <p className="text-amber-200/90 leading-relaxed">
            Your profile is visible in Chinhoyi. You can submit itemized quotations for available jobs. Full verified badge will be assigned after Admin credential review.
          </p>
        </div>
      </div>

      {/* Provider Active Projects */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <HardHat className="w-5 h-5 text-amber-400" />
          <span>My Active Construction Projects</span>
        </h2>

        {myProjects.length === 0 ? (
          <div className="bg-slate-800/40 border border-slate-700/60 p-8 rounded-2xl text-center space-y-2">
            <HardHat className="w-8 h-8 text-slate-500 mx-auto" />
            <p className="font-bold text-white text-sm">No active projects yet.</p>
            <p className="text-xs text-slate-400">Submit quotations on open jobs in {LAUNCH_CITY} to get hired by property clients.</p>
          </div>
        ) : (
          myProjects.map((proj: Project) => (
            <div key={proj.id} className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 space-y-3 shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700/60 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white">{proj.title}</h3>
                  <p className="text-xs text-slate-400">{proj.suburb}, {proj.city} • Client: {proj.clientName}</p>
                </div>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
                  {proj.status.replace(/_/g, " ")}
                </span>
              </div>
              <div className="pt-1">
                <Link
                  href={`/provider/projects/${proj.id}`}
                  className="text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-xl inline-flex items-center gap-1.5"
                >
                  <span>Manage Milestone Evidence</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Available Opportunities in Chinhoyi */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-amber-400" />
            <span>Available Jobs in {LAUNCH_CITY}</span>
          </h2>
          <Link href="/jobs" className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1">
            <span>Browse All Jobs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {openJobs.length === 0 ? (
          <div className="bg-slate-800/40 border border-slate-700/60 p-12 rounded-2xl text-center space-y-3">
            <Briefcase className="w-12 h-12 text-slate-500 mx-auto" />
            <h3 className="text-lg font-bold text-white">No open projects available right now.</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              New construction opportunities in {LAUNCH_CITY} posted by diaspora clients will appear here.
            </p>
          </div>
        ) : (
          openJobs.map((job: ReturnType<typeof marketplaceStore.getPublicJobListings>[0]) => (
            <div key={job.id} className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-6 space-y-4 shadow-lg">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-700/60 pb-3">
                <div>
                  <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold mb-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{job.suburb}, {job.city} • {job.categoryName}</span>
                  </div>
                  <h3 className="text-base font-bold text-white">{job.title}</h3>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                {job.description}
              </p>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <div className="text-xs text-slate-400">
                  <span>Itemized Quotation Format: </span>
                  <strong className="text-slate-200">Labour + Materials Separate</strong>
                </div>

                <Link
                  href={`/provider/jobs/${job.id}/quote`}
                  className="inline-flex items-center gap-2 text-xs font-extrabold bg-amber-600 hover:bg-amber-500 text-white px-5 py-2.5 rounded-xl shadow-md transition-all"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Submit Quotation</span>
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
