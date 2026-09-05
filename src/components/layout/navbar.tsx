"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { APP_NAME } from "@/lib/constants";
import {
  Home,
  Briefcase,
  Users,
  LayoutDashboard,
  FolderKanban,
  ClipboardCheck,
  Bell,
  User,
  Shield,
  Menu,
  X,
  LogOut,
  PlusCircle,
  HardHat,
  Search,
} from "lucide-react";
import { SendFeedbackButton } from "@/components/common/feedback-modal";

export function Navbar() {
  const pathname = usePathname();
  const { user, role, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Role-Specific Navigation Config
  const getRoleNavItems = () => {
    switch (role) {
      case "CLIENT":
        return [
          { label: "Dashboard", href: "/client/dashboard", icon: LayoutDashboard },
          { label: "My Projects", href: "/client/dashboard", icon: FolderKanban },
          { label: "Find Pros", href: "/providers", icon: Users },
          { label: "Notifications", href: "#", icon: Bell },
        ];
      case "PROVIDER":
        return [
          { label: "Dashboard", href: "/provider/dashboard", icon: LayoutDashboard },
          { label: "Find Jobs", href: "/jobs", icon: Briefcase, badge: 3 },
          { label: "My Projects", href: "/provider/dashboard", icon: FolderKanban },
          { label: "Notifications", href: "#", icon: Bell },
        ];
      case "INSPECTOR":
        return [
          { label: "Dashboard", href: "/inspector/dashboard", icon: LayoutDashboard },
          { label: "Inspections", href: "/inspector/dashboard", icon: ClipboardCheck, badge: 1 },
          { label: "Notifications", href: "#", icon: Bell },
        ];
      case "ADMIN":
        return [
          { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
          { label: "Users", href: "/admin/dashboard", icon: Users },
          { label: "Projects", href: "/jobs", icon: FolderKanban },
          { label: "Verifications", href: "/admin/dashboard", icon: Shield, badge: 4 },
        ];
      default:
        return [];
    }
  };

  const roleNavItems = isAuthenticated ? getRoleNavItems() : [];

  return (
    <>
      <header className="bg-amber-950 text-white border-b border-amber-800/40 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo */}
            <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
              <div className="w-9 h-9 rounded-lg bg-amber-600 flex items-center justify-center text-white shadow-md">
                <HardHat className="w-5 h-5" />
              </div>
              <span className="text-white font-extrabold">{APP_NAME}</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded uppercase font-semibold border border-amber-500/30">
                Chinhoyi
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              {!isAuthenticated ? (
                <>
                  <Link
                    href="/"
                    className={`text-sm font-medium transition-colors ${
                      pathname === "/" ? "text-amber-400 font-semibold" : "text-amber-100 hover:text-white"
                    }`}
                  >
                    Home
                  </Link>
                  <Link
                    href="/providers"
                    className={`text-sm font-medium transition-colors ${
                      pathname === "/providers" ? "text-amber-400 font-semibold" : "text-amber-100 hover:text-white"
                    }`}
                  >
                    Find Professionals
                  </Link>
                  <Link
                    href="/jobs"
                    className={`text-sm font-medium transition-colors ${
                      pathname === "/jobs" ? "text-amber-400 font-semibold" : "text-amber-100 hover:text-white"
                    }`}
                  >
                    Available Jobs
                  </Link>
                  <Link
                    href="/login"
                    className="text-sm font-medium text-amber-200 hover:text-white px-3 py-1.5 rounded-lg border border-amber-700/60 hover:bg-amber-900/50"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/register"
                    className="text-sm font-semibold bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-lg shadow-sm transition-all"
                  >
                    Get Started
                  </Link>
                </>
              ) : (
                <>
                  {roleNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.label}
                        href={item.href}
                        className={`flex items-center gap-2 text-sm font-medium transition-colors px-2.5 py-1.5 rounded-lg ${
                          isActive
                            ? "bg-amber-900/60 text-amber-300 font-semibold"
                            : "text-amber-100 hover:text-white hover:bg-amber-900/30"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                        {item.badge && (
                          <span className="bg-amber-500 text-amber-950 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}

                  {/* Post Project Action for Clients */}
                  {role === "CLIENT" && (
                    <Link
                      href="/client/dashboard"
                      className="flex items-center gap-1.5 text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white px-3 py-1.5 rounded-lg shadow-sm"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Post Project</span>
                    </Link>
                  )}

                  {/* Profile Menu */}
                  <div className="flex items-center gap-3 ml-2 pl-4 border-l border-amber-800/60">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-amber-700 text-white font-bold flex items-center justify-center text-xs">
                        {user?.fullName.charAt(0)}
                      </div>
                      <div className="text-xs">
                        <p className="font-semibold text-white truncate max-w-[100px]">{user?.fullName}</p>
                        <p className="text-[10px] text-amber-300 font-mono uppercase">{role}</p>
                      </div>
                    </div>
                    <SendFeedbackButton />
                    <button
                      onClick={logout}
                      title="Log Out"
                      className="p-1.5 text-amber-300 hover:text-white hover:bg-amber-900/50 rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </nav>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-amber-200 hover:text-white focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-amber-950 border-t border-amber-800/50 px-4 pt-3 pb-6 space-y-3">
            {!isAuthenticated ? (
              <div className="flex flex-col space-y-2">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-md text-sm font-medium text-amber-100 hover:bg-amber-900/50"
                >
                  Home
                </Link>
                <Link
                  href="/providers"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-md text-sm font-medium text-amber-100 hover:bg-amber-900/50"
                >
                  Find Professionals
                </Link>
                <Link
                  href="/jobs"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-md text-sm font-medium text-amber-100 hover:bg-amber-900/50"
                >
                  Available Jobs
                </Link>
                <div className="pt-2 flex flex-col gap-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2 text-sm font-medium text-amber-200 border border-amber-700/60 rounded-lg"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2 text-sm font-semibold bg-amber-600 text-white rounded-lg"
                  >
                    Get Started
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="px-3 py-2 bg-amber-900/40 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-amber-700 text-white font-bold flex items-center justify-center text-xs">
                      {user?.fullName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{user?.fullName}</p>
                      <p className="text-[10px] text-amber-300 font-mono uppercase">{role}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="text-xs text-amber-300 flex items-center gap-1 font-medium bg-amber-900/80 px-2 py-1 rounded"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Log out
                  </button>
                </div>

                <div className="pt-2 space-y-1">
                  {roleNavItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-amber-100 hover:bg-amber-900/50"
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5 text-amber-400" />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className="bg-amber-500 text-amber-950 text-xs font-bold px-2 py-0.5 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Mobile Bottom Navigation Bar (Persistent Thumb Reach) */}
      {isAuthenticated && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-amber-950 border-t border-amber-800/40 z-40 py-2 px-3 flex items-center justify-around shadow-lg">
          {roleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition-all min-w-[56px] py-1 ${
                  isActive ? "text-amber-400 font-bold" : "text-amber-200 hover:text-white"
                }`}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {item.badge && (
                    <span className="absolute -top-1 -right-2 bg-amber-500 text-amber-950 text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
