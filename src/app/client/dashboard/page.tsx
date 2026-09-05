"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { APP_NAME, LAUNCH_CITY } from "@/lib/constants";
import { marketplaceStore } from "@/lib/marketplace-store";
import { generateWhatsAppLink, getProviderContactMessage } from "@/lib/whatsapp";
import {
  FolderKanban,
  PlusCircle,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  MessageCircle,
  FileText,
  Building,
  DollarSign,
  Award,
} from "lucide-react";

export default function ClientDashboardPage() {
  const { user } = useAuth();
  const projects = user?.id ? marketplaceStore.getProjectsForClient(user.id) : [];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-950 to-slate-900 border border-amber-900/40 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-blue-500/20 text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border border-blue-500/30">
              Diaspora Client Portal
            </span>
            <span className="text-xs text-slate-400">
              {user?.profileDetails?.diasporaCountry ? `Living in ${user.profileDetails.diasporaCountry}` : "Diaspora Account"}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-1">
            Welcome back, {user?.fullName || "Account"}
          </h1>
          <p className="text-xs text-slate-300">
            Remotely monitoring property projects in {LAUNCH_CITY}, Zimbabwe.
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

      {/* Trust & Independent Verification Alert Banner */}
      <div className="bg-emerald-950/40 border border-emerald-800/50 p-4 rounded-xl flex items-start gap-3 text-xs text-emerald-200">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-emerald-300">Independent Verification & Payment Transparency Active</p>
          <p className="text-emerald-200/90 leading-relaxed">
            Site inspections in {LAUNCH_CITY} are conducted by registered independent inspectors before milestone payment approvals. KuvakaHub records financial transparency status while you settle directly.
          </p>
        </div>
      </div>

      {/* Active Projects Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-amber-400" />
            <span>Active Property Projects ({LAUNCH_CITY})</span>
          </h2>
          <span className="text-xs text-slate-400">{projects.length} Total Projects</span>
        </div>

        {projects.length === 0 ? (
          <div className="bg-slate-800/40 border border-slate-700/60 p-12 rounded-2xl text-center space-y-3">
            <FolderKanban className="w-12 h-12 text-slate-500 mx-auto" />
            <h3 className="text-lg font-bold text-white">You haven&apos;t posted a project yet.</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Post your construction or property building project in {LAUNCH_CITY} to receive quotes from verified local contractors.
            </p>
            <Link
              href="/client/projects/new"
              className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition-all mt-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post Your First Project</span>
            </Link>
          </div>
        ) : (
          projects.map((proj) => {
            const assignment = marketplaceStore.getAssignmentForProject(proj.id);
            const provider = assignment ? marketplaceStore.getProviderProfileById(assignment.providerId) : undefined;
            const whatsappLink = provider?.phone
              ? generateWhatsAppLink(
                  provider.phone,
                  getProviderContactMessage(provider.businessName, proj.title)
                )
              : "#";

            return (
              <div key={proj.id} className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-6 space-y-4 shadow-lg">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-700/60 pb-4">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold mb-1">
                      <Building className="w-3.5 h-3.5" />
                      <span>{proj.categoryName} • {proj.suburb}, {proj.city}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white">{proj.title}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/30">
                      {proj.status.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>

                {/* Quick Action Links Toolbar */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Link
                    href={`/client/projects/${proj.id}/milestones`}
                    className="text-xs font-extrabold bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Independent Verification & Milestones</span>
                  </Link>

                  <Link
                    href={`/client/projects/${proj.id}/payments`}
                    className="text-xs font-extrabold bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                  >
                    <DollarSign className="w-4 h-4" />
                    <span>Financial Status & Payments</span>
                  </Link>

                  <Link
                    href={`/client/projects/${proj.id}/completion`}
                    className="text-xs font-bold bg-slate-950 hover:bg-slate-900 text-amber-400 border border-amber-500/30 px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5"
                  >
                    <Award className="w-4 h-4" />
                    <span>Passport & Reviews</span>
                  </Link>

                  {provider?.phone && (
                    <a
                      href={whatsappLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-bold bg-emerald-800 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>WhatsApp Builder</span>
                    </a>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
