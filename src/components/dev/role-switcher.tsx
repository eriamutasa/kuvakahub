"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuth, ROLE_DASHBOARD_ROUTES } from "@/lib/auth-context";
import { UserRole } from "@/lib/constants";
import { UserCheck, Shield, HardHat, ClipboardCheck, ArrowRightLeft } from "lucide-react";

export function DevRoleSwitcher() {
  const router = useRouter();
  const { role, switchRole, user } = useAuth();

  // Gated strictly behind development environment
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  const handleSwitch = (nextRole: UserRole) => {
    switchRole(nextRole);
    router.push(ROLE_DASHBOARD_ROUTES[nextRole]);
  };

  const roles: { key: UserRole; label: string; icon: React.ReactNode; color: string }[] = [
    { key: "CLIENT", label: "Client (Local & Diaspora)", icon: <UserCheck className="w-3.5 h-3.5" />, color: "bg-blue-600" },
    { key: "PROVIDER", label: "Provider (Builder)", icon: <HardHat className="w-3.5 h-3.5" />, color: "bg-amber-600" },
    { key: "INSPECTOR", label: "Inspector", icon: <ClipboardCheck className="w-3.5 h-3.5" />, color: "bg-emerald-600" },
    { key: "ADMIN", label: "Admin", icon: <Shield className="w-3.5 h-3.5" />, color: "bg-purple-600" },
  ];

  return (
    <div className="bg-slate-950 text-white text-xs py-2 px-3 border-b border-amber-500/30 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-medium">
          <span className="bg-amber-500/20 text-amber-300 font-semibold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider flex items-center gap-1 border border-amber-500/30">
            <ArrowRightLeft className="w-3 h-3" /> Dev Role Switcher
          </span>
          <span className="text-slate-400 hidden sm:inline">Active Role:</span>
          <span className="font-bold text-amber-200 uppercase">{role}</span>
          {user && (
            <span className="text-slate-400 text-[11px] truncate max-w-[140px] sm:max-w-[200px]">
              ({user.fullName})
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 scrollbar-none">
          {roles.map((r) => {
            const isActive = role === r.key;
            return (
              <button
                key={r.key}
                onClick={() => handleSwitch(r.key)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                  isActive
                    ? `${r.color} text-white shadow-sm ring-1 ring-white/30 font-semibold`
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                }`}
              >
                {r.icon}
                <span>{r.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
