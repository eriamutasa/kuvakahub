"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { APP_NAME } from "@/lib/constants";
import { HardHat, UserCheck, AlertCircle, ArrowRight } from "lucide-react";

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role") === "PROVIDER" ? "PROVIDER" : "CLIENT";

  const [selectedRole, setSelectedRole] = useState<"CLIENT" | "PROVIDER">(initialRole);

  const handleNext = () => {
    if (selectedRole === "CLIENT") {
      router.push("/onboarding/client");
    } else {
      router.push("/onboarding/provider");
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 py-8 px-6 shadow-xl sm:rounded-2xl space-y-6">
      {/* Public Role Selection */}
      <div className="space-y-3">
        <label className="block text-xs font-bold uppercase tracking-wider text-amber-400">
          Select Account Type
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Client Option */}
          <div
            onClick={() => setSelectedRole("CLIENT")}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              selectedRole === "CLIENT"
                ? "bg-amber-950/60 border-amber-500 shadow-md ring-1 ring-amber-500/50"
                : "bg-slate-950 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
                <UserCheck className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm text-white">Client (Local or Diaspora)</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              I want to post building, renovation, or maintenance jobs in Chinhoyi, whether I live locally or abroad.
            </p>
          </div>

          {/* Provider Option */}
          <div
            onClick={() => setSelectedRole("PROVIDER")}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              selectedRole === "PROVIDER"
                ? "bg-amber-950/60 border-amber-500 shadow-md ring-1 ring-amber-500/50"
                : "bg-slate-950 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-amber-600/20 text-amber-400 flex items-center justify-center">
                <HardHat className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm text-white">Service Provider</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              I am a local builder, plumber, electrician, painter, carpenter, or roofer.
            </p>
          </div>
        </div>
      </div>

      {/* Security Notice for Inspector & Admin Roles */}
      <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-start gap-2.5 text-[11px] text-slate-400">
        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-slate-300">Independent Inspector Accounts</p>
          <p className="text-slate-400">
            To preserve objective verification integrity, <strong>Inspector</strong> and <strong>Admin</strong> accounts cannot be created via public registration and require manual verification.
          </p>
        </div>
      </div>

      <button
        onClick={handleNext}
        className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2"
      >
        <span>Continue to Profile Setup</span>
        <ArrowRight className="w-4 h-4" />
      </button>

      <div className="text-center pt-2 border-t border-slate-800">
        <p className="text-xs text-slate-400">
          Already have an account?{" "}
          <Link href="/login" className="text-amber-400 font-bold hover:underline">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 text-slate-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-amber-600 mx-auto flex items-center justify-center text-white shadow-lg">
          <HardHat className="w-6 h-6" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          Create Your Account
        </h2>
        <p className="text-xs text-slate-400">
          Join {APP_NAME} in Chinhoyi, Zimbabwe
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <Suspense fallback={<div className="text-center py-8 text-slate-400">Loading form...</div>}>
          <RegisterContent />
        </Suspense>
      </div>
    </div>
  );
}
