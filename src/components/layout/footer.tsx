import React from "react";
import Link from "next/link";
import { APP_NAME, LAUNCH_CITY } from "@/lib/constants";
import { HardHat, ShieldCheck, PhoneCall, MapPin, Globe } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 text-sm border-t border-slate-800 pt-12 pb-16 md:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Column 1: Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 font-bold text-lg text-white">
              <div className="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center text-white">
                <HardHat className="w-4 h-4" />
              </div>
              <span>{APP_NAME}</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Empowering local and diaspora property owners to build, renovate, and maintain property in Zimbabwe with independent verification and transparency.
            </p>
            <div className="flex items-center gap-2 text-xs text-amber-400 font-medium">
              <MapPin className="w-3.5 h-3.5" />
              <span>Launch Market: {LAUNCH_CITY}, Zimbabwe</span>
            </div>
          </div>

          {/* Column 2: Client Services */}
          <div>
            <h4 className="font-semibold text-slate-200 text-xs uppercase tracking-wider mb-3">Property Owners</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/register" className="hover:text-amber-400 transition-colors">Post a Project</Link></li>
              <li><Link href="/providers" className="hover:text-amber-400 transition-colors">Find Verified Builders</Link></li>
              <li><Link href="/#how-it-works" className="hover:text-amber-400 transition-colors">How Independent Inspection Works</Link></li>
              <li><Link href="/jobs" className="hover:text-amber-400 transition-colors">Browse Available Jobs</Link></li>
            </ul>
          </div>

          {/* Column 3: Local Professionals */}
          <div>
            <h4 className="font-semibold text-slate-200 text-xs uppercase tracking-wider mb-3">Local Service Providers</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/register?role=PROVIDER" className="hover:text-amber-400 transition-colors">Join as a Service Provider</Link></li>
              <li><Link href="/jobs" className="hover:text-amber-400 transition-colors">Jobs in Chinhoyi</Link></li>
              <li><Link href="/#verification" className="hover:text-amber-400 transition-colors">Provider Verification Process</Link></li>
            </ul>
          </div>

          {/* Column 4: WhatsApp & Trust */}
          <div className="space-y-3">
            <h4 className="font-semibold text-slate-200 text-xs uppercase tracking-wider">Independent Trust</h4>
            <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg flex items-start gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-[11px] leading-tight">
                <p className="font-semibold text-slate-200">Objective Verification</p>
                <p className="text-slate-400">Independent site inspectors visit sites in Chinhoyi before milestone approvals.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <Globe className="w-4 h-4 text-amber-400" />
              <span>Serving Zimbabwe & the Diaspora (SA, UK, USA, AUS)</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} {APP_NAME} Marketplace. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built for <span className="text-slate-300 font-semibold">Chinhoyi, Zimbabwe</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
