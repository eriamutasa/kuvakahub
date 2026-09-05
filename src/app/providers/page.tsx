"use client";

import React, { useState } from "react";
import Link from "next/link";
import { APP_NAME, LAUNCH_CITY, SERVICE_CATEGORIES } from "@/lib/constants";
import { marketplaceStore } from "@/lib/marketplace-store";
import { generateWhatsAppLink, getProviderContactMessage } from "@/lib/whatsapp";
import { Users, HardHat, ShieldCheck, MapPin, MessageCircle, Star, Award } from "lucide-react";

export default function ProvidersDirectoryPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const realProviders = marketplaceStore.getProviderProfiles();

  const filteredProviders = realProviders.filter(
    (p) => selectedCategory === "all" || p.categorySlug === selectedCategory
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-400" />
            <span>Service Providers in {LAUNCH_CITY}</span>
          </h1>
          <p className="text-xs text-slate-400">
            Vetted local tradespeople and contractors operating in {LAUNCH_CITY}, Zimbabwe
          </p>
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
        >
          <option value="all">All Trade Categories</option>
          {SERVICE_CATEGORIES.map((c) => (
            <option key={c.id} value={c.slug}>{c.name}</option>
          ))}
        </select>
      </div>

      {filteredProviders.length === 0 ? (
        <div className="bg-slate-800/40 border border-slate-700/60 p-12 rounded-2xl text-center space-y-3">
          <HardHat className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-lg font-bold text-white">No professionals are available yet.</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Contractors who register and complete onboarding in {LAUNCH_CITY} will appear in this verified directory.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredProviders.map((prov) => {
            const waLink = generateWhatsAppLink(
              prov.phone,
              getProviderContactMessage(prov.businessName, "Construction Project in Chinhoyi")
            );

            return (
              <div
                key={prov.id}
                className="bg-slate-800/50 border border-slate-700/60 p-6 rounded-2xl space-y-4 shadow-lg flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center font-bold text-sm">
                      <HardHat className="w-5 h-5" />
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded border uppercase ${
                        prov.verificationStatus === "VERIFIED"
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                          : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                      }`}
                    >
                      {prov.verificationStatus}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white">{prov.businessName}</h3>
                    <p className="text-xs text-slate-400">{prov.name} • {prov.experience} experience</p>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-amber-400 font-medium">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{prov.suburb}, {prov.city}</span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                    {prov.bio}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-700/50 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">{prov.categoryName}</span>

                  <a
                    href={waLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl transition-all"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
