"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { APP_NAME, LAUNCH_CITY } from "@/lib/constants";
import { marketplaceStore } from "@/lib/marketplace-store";
import { feedbackStore } from "@/lib/feedback-store";
import {
  Shield,
  Users,
  FolderKanban,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  ClipboardList,
  UserCheck,
  HardHat,
  Database,
  ShieldAlert,
  ArrowRight,
  MessageSquarePlus,
  Clock,
} from "lucide-react";

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [providerVerified, setProviderVerified] = useState(false);

  const pendingMilestones = marketplaceStore.getUnassignedMilestonesForInspection();
  const openDisputes = marketplaceStore.getDisputesForAdmin().filter((d) => d.dispute.status === "OPEN");
  const pilotFeedback = feedbackStore.getFeedbackForAdmin();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-950 to-slate-900 border border-purple-900/40 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-purple-500/20 text-purple-300 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border border-purple-500/30">
              Admin Platform Control Center
            </span>
            <span className="text-xs text-slate-400">Hub: {LAUNCH_CITY}, Zimbabwe</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-1">Platform Pilot Operations</h1>
          <p className="text-xs text-slate-300">
            {APP_NAME} Operational Oversight & Verifications
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/inspections"
            className="text-xs font-extrabold bg-purple-600 hover:bg-purple-500 text-white px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1.5"
          >
            <UserCheck className="w-4 h-4" />
            <span>Inspector Assignments ({pendingMilestones.length})</span>
          </Link>

          <Link
            href="/admin/payment-disputes"
            className="text-xs font-extrabold bg-rose-600 hover:bg-rose-500 text-white px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1.5"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Disputes ({openDisputes.length})</span>
          </Link>
        </div>
      </div>

      {/* Operations Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/60 p-4 rounded-xl space-y-1">
          <p className="text-xs text-slate-400">Total Registered Users</p>
          <p className="text-2xl font-extrabold text-white">4 Accounts</p>
          <p className="text-[10px] text-slate-500">Client, Provider, Inspector, Admin</p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/60 p-4 rounded-xl space-y-1">
          <p className="text-xs text-slate-400">Pending Inspections</p>
          <p className="text-2xl font-extrabold text-amber-400">{pendingMilestones.length} Pending</p>
          <p className="text-[10px] text-slate-500">Awaiting Inspector Assignment</p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/60 p-4 rounded-xl space-y-1">
          <p className="text-xs text-slate-400">Open Payment Disputes</p>
          <p className="text-2xl font-extrabold text-rose-400">{openDisputes.length} Open</p>
          <p className="text-[10px] text-slate-500">Requires Admin Review</p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/60 p-4 rounded-xl space-y-1">
          <p className="text-xs text-slate-400">Pilot Feedback Logged</p>
          <p className="text-2xl font-extrabold text-emerald-400">{pilotFeedback.length} Submissions</p>
          <p className="text-[10px] text-slate-500">From Active Pilot Users</p>
        </div>
      </div>

      {/* Verification & Operations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Provider Credential Verification Queue */}
        <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-purple-400" />
              <span>Provider Verification Queue</span>
            </h3>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-bold">
              {marketplaceStore.getProviderProfiles().length} Providers
            </span>
          </div>

          {marketplaceStore.getProviderProfiles().length === 0 ? (
            <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 text-center text-xs text-slate-400">
              No unverified providers in queue.
            </div>
          ) : (
            marketplaceStore.getProviderProfiles().map((prov) => (
              <div key={prov.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{prov.businessName}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      prov.verificationStatus === "VERIFIED"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                        : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    }`}
                  >
                    {prov.verificationStatus}
                  </span>
                </div>
                <p className="text-slate-400">{prov.name} • Trade: {prov.categoryName} • {prov.city}</p>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={() => {
                      const newStatus = prov.verificationStatus === "VERIFIED" ? "UNVERIFIED" : "VERIFIED";
                      marketplaceStore.saveProviderProfile({ ...prov, verificationStatus: newStatus });
                    }}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm transition-all ${
                      prov.verificationStatus === "VERIFIED"
                        ? "bg-slate-800 text-slate-300 border border-slate-700"
                        : "bg-emerald-600 hover:bg-emerald-500 text-white"
                    }`}
                  >
                    {prov.verificationStatus === "VERIFIED" ? "Revoke Verification" : "Approve Verified Provider Status"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pilot User Feedback Stream */}
        <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <MessageSquarePlus className="w-4 h-4 text-emerald-400" />
              <span>Pilot User Feedback Stream</span>
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">{pilotFeedback.length} ITEMS</span>
          </div>

          <div className="space-y-2.5 text-xs">
            {pilotFeedback.map((fb) => (
              <div key={fb.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-bold text-amber-400">{fb.category}</span>
                  <span>{new Date(fb.createdAt).toLocaleTimeString()}</span>
                </div>
                <p className="text-slate-200">{fb.message}</p>
                <p className="text-[10px] text-slate-500 font-mono">{fb.pageContext}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
