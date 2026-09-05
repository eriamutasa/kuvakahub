"use client";

import React from "react";
import Link from "next/link";
import { APP_NAME, APP_TAGLINE, APP_SUBTITLE, LAUNCH_CITY, CHINHOYI_SUBURBS, SERVICE_CATEGORIES } from "@/lib/constants";
import {
  HardHat,
  ShieldCheck,
  MapPin,
  CheckCircle2,
  ArrowRight,
  ClipboardCheck,
  Camera,
  MessageCircle,
  Users,
  FileSpreadsheet,
  Award,
  Sparkles,
  Hammer,
  Wrench,
  Zap,
  Paintbrush,
  Axe,
  LayoutGrid,
  Home,
  Flame,
} from "lucide-react";

// Icon mapping helper
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Hammer: <Hammer className="w-6 h-6 text-amber-600" />,
  Wrench: <Wrench className="w-6 h-6 text-amber-600" />,
  Zap: <Zap className="w-6 h-6 text-amber-600" />,
  Paintbrush: <Paintbrush className="w-6 h-6 text-amber-600" />,
  Axe: <Axe className="w-6 h-6 text-amber-600" />,
  LayoutGrid: <LayoutGrid className="w-6 h-6 text-amber-600" />,
  Home: <Home className="w-6 h-6 text-amber-600" />,
  Flame: <Flame className="w-6 h-6 text-amber-600" />,
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* HERO SECTION */}
      <section className="relative bg-gradient-to-b from-amber-950 via-slate-900 to-slate-950 pt-12 pb-20 px-4 sm:px-6 lg:px-8 border-b border-amber-900/30 overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          {/* Launch Market Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span>Now Live in <strong>{LAUNCH_CITY}</strong>, Zimbabwe</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            {APP_TAGLINE}
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed">
            {APP_SUBTITLE}
          </p>

          {/* Primary & Secondary Call to Actions */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register?role=CLIENT"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-base font-bold bg-amber-600 hover:bg-amber-500 text-white px-8 py-4 rounded-xl shadow-lg shadow-amber-900/40 transition-all transform hover:-translate-y-0.5"
            >
              <span>POST A PROJECT</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              href="/providers"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-base font-semibold bg-slate-800 hover:bg-slate-700 text-slate-100 px-8 py-4 rounded-xl border border-slate-700 transition-all"
            >
              <Users className="w-5 h-5 text-amber-400" />
              <span>FIND A PROFESSIONAL</span>
            </Link>
          </div>

          {/* Trust Highlights */}
          <div className="pt-8 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-slate-300 max-w-4xl mx-auto">
            <div className="bg-slate-800/60 border border-slate-700/50 p-3 rounded-lg flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Independent Verification</span>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/50 p-3 rounded-lg flex items-center justify-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Itemized Quotations</span>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/50 p-3 rounded-lg flex items-center justify-center gap-2">
              <Camera className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Remote Progress Evidence</span>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/50 p-3 rounded-lg flex items-center justify-center gap-2">
              <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>WhatsApp Integration</span>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <h2 className="text-xs font-bold text-amber-400 uppercase tracking-widest">Simple Workflow</h2>
          <p className="text-2xl sm:text-4xl font-extrabold text-white">How {APP_NAME} Works</p>
          <p className="text-slate-400 text-sm">
            Designed for local and diaspora property owners who require transparency and structured oversight.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Step 1 */}
          <div className="bg-slate-800/50 border border-slate-700/60 p-6 rounded-2xl relative space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-extrabold text-lg flex items-center justify-center">
              1
            </div>
            <h3 className="text-lg font-bold text-white">Post Your Project</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Define your building, plumbing, or roofing project in Chinhoyi. Specify your suburb, budget estimate, and upload architectural plans.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-slate-800/50 border border-slate-700/60 p-6 rounded-2xl relative space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-extrabold text-lg flex items-center justify-center">
              2
            </div>
            <h3 className="text-lg font-bold text-white">Receive Quotations</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Verified local builders submit itemized quotes breaking down Labour vs Materials. Competitor quotes remain strictly private.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-slate-800/50 border border-slate-700/60 p-6 rounded-2xl relative space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-extrabold text-lg flex items-center justify-center">
              3
            </div>
            <h3 className="text-lg font-bold text-white">Choose a Professional</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Compare itemized prices side-by-side, inspect provider portfolios, read past reviews, and hire your preferred contractor.
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-slate-800/50 border border-slate-700/60 p-6 rounded-2xl relative space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-extrabold text-lg flex items-center justify-center">
              4
            </div>
            <h3 className="text-lg font-bold text-white">Track & Verify Work</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Monitor milestone progress remotely. Independent site inspectors visit the site and provide objective photo/video proof before you approve.
            </p>
          </div>
        </div>
      </section>

      {/* INDEPENDENT VERIFICATION SPOTLIGHT */}
      <section className="bg-amber-950/40 border-y border-amber-900/40 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Core Trust Pillar</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
              Independent Site Inspection — Never Guess Construction Quality
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed">
              A major vulnerability for property developers, whether local or abroad, is relying solely on contractor self-reporting. On {APP_NAME}, builder photos are <strong>never allowed</strong> to count as automatic verification.
            </p>

            <ul className="space-y-3 text-xs text-slate-200">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Separate Evidence Buckets:</strong> Inspector notes and photo proof are stored separately from contractor submissions.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Side-by-Side Comparison:</strong> Compare contractor claims with independent inspector findings before approving milestones.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Status Decisions:</strong> Inspectors record <code>VERIFIED</code>, <code>NEEDS_ATTENTION</code>, or <code>REJECTED</code>.</span>
              </li>
            </ul>

            <div className="pt-2">
              <Link
                href="/register?role=CLIENT"
                className="inline-flex items-center gap-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-3 rounded-lg transition-all"
              >
                <span>Protect Your Property Project</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Visual Mockup Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-amber-400" />
                <span className="text-xs font-bold text-white">Milestone 1: Foundation & Slab Inspection</span>
              </div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold border border-emerald-500/30">
                INSPECTOR VERIFIED
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                <p className="font-semibold text-amber-300 text-[11px]">Builder Evidence</p>
                <div className="h-24 bg-slate-800 rounded-lg flex items-center justify-center text-slate-500 text-[10px]">
                  [ Foundation Photo Uploaded ]
                </div>
                <p className="text-[10px] text-slate-400">"Footing poured & cured according to plan."</p>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-emerald-900/40 space-y-2">
                <p className="font-semibold text-emerald-400 text-[11px]">Independent Inspector Proof</p>
                <div className="h-24 bg-slate-800 rounded-lg flex items-center justify-center text-emerald-400 text-[10px] font-semibold">
                  [ Inspector Site Visit Verified ]
                </div>
                <p className="text-[10px] text-slate-300">"Depth verified at 600mm. Rebar spacing confirmed."</p>
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
              <div>
                <p className="text-[10px] text-slate-400">Milestone Payment Status</p>
                <p className="font-bold text-amber-400 text-xs">PENDING CLIENT APPROVAL</p>
              </div>
              <span className="text-xs bg-amber-600 text-white font-bold px-3 py-1.5 rounded-lg">
                Client Review Required
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICE CATEGORIES GRID */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-2">
          <h2 className="text-xs font-bold text-amber-400 uppercase tracking-widest">Verified Trades</h2>
          <p className="text-2xl sm:text-4xl font-extrabold text-white">Chinhoyi Service Categories</p>
          <p className="text-slate-400 text-sm">
            Find vetted local professionals operating across all suburbs in Chinhoyi.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {SERVICE_CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={`/providers?category=${cat.slug}`}
              className="bg-slate-800/40 hover:bg-slate-800 border border-slate-700/60 hover:border-amber-500/50 p-5 rounded-2xl transition-all group space-y-3"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                {CATEGORY_ICONS[cat.icon] || <Hammer className="w-6 h-6 text-amber-600" />}
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">
                {cat.name}
              </h3>
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                {cat.description}
              </p>
              <div className="flex items-center gap-1 text-xs font-semibold text-amber-400 pt-1">
                <span>Find Pros in Chinhoyi</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CHINHOYI LAUNCH SUBURBS */}
      <section className="bg-slate-950 py-12 px-4 border-t border-slate-800 text-center space-y-4">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-xs font-bold text-amber-400 uppercase tracking-widest">Active Service Coverage</h3>
          <p className="text-xl font-bold text-white mt-1">Operating Suburbs in Chinhoyi</p>
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
            {CHINHOYI_SUBURBS.map((suburb) => (
              <span
                key={suburb}
                className="bg-slate-900 border border-slate-800 text-slate-300 text-xs px-3 py-1.5 rounded-full font-medium"
              >
                📍 {suburb}
              </span>
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-4">
            Architecture designed for instant data-driven expansion to Harare, Bulawayo, Mutare & Gweru.
          </p>
        </div>
      </section>
    </div>
  );
}
