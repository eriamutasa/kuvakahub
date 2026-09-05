"use client";

import React, { use } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { marketplaceStore } from "@/lib/marketplace-store";
import { LAUNCH_CITY } from "@/lib/constants";
import { generateWhatsAppLink, getProviderContactMessage } from "@/lib/whatsapp";
import { HardHat, ShieldCheck, MapPin, MessageCircle, Star, Award, Image as ImageIcon, CheckCircle2 } from "lucide-react";

export default function ProviderPublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const reviews = marketplaceStore.getReviewsForProvider(id);
  const metrics = marketplaceStore.getProviderRatingMetrics(id);

  const storedProvider = marketplaceStore.getProviderProfileById(id);

  const provider = storedProvider || {
    id,
    businessName: "Service Professional",
    name: "Account",
    categoryName: "Contractor",
    city: LAUNCH_CITY,
    suburb: "Chinhoyi",
    experience: "Registered Professional",
    bio: "Registered construction service provider on KuvakaHub.",
    verificationStatus: "UNVERIFIED" as const,
    completedVerifiedProjects: 0,
    phone: "",
    portfolio: [],
  };

  const waLink = provider.phone
    ? generateWhatsAppLink(
        provider.phone,
        getProviderContactMessage(provider.businessName, "Construction Work in Chinhoyi")
      )
    : "#";

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="bg-slate-800/60 border border-slate-700/80 p-6 rounded-2xl space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-600/20 text-amber-400 flex items-center justify-center font-bold text-xl border border-amber-500/30">
              <HardHat className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-white">{provider.businessName}</h1>
                <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2.5 py-0.5 rounded border border-amber-500/30 uppercase">
                  {provider.verificationStatus}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {provider.name} • {provider.experience} experience
              </p>
            </div>
          </div>

          <a
            href={waLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-3 rounded-xl shadow-md transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Contact via WhatsApp</span>
          </a>
        </div>

        {/* Dynamic Rating & Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2 border-t border-slate-700/60">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <p className="text-slate-400">Rating Metric</p>
            <p className="font-extrabold text-amber-400 mt-0.5 flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              {metrics.totalVerifiedReviews > 0 ? `${metrics.averageRating} ★` : "No reviews yet"}
            </p>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <p className="text-slate-400">Verified Reviews</p>
            <p className="font-bold text-white mt-0.5">{metrics.totalVerifiedReviews} Verified Project Reviews</p>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <p className="text-slate-400">Operating Area</p>
            <p className="font-bold text-white mt-0.5">{provider.suburb}, {provider.city}</p>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <p className="text-slate-400">Trade Category</p>
            <p className="font-bold text-amber-400 mt-0.5">{provider.categoryName}</p>
          </div>
        </div>

        {/* About Bio */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">About Contractor</h3>
          <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800">
            {provider.bio}
          </p>
        </div>

        {/* VERIFIED PROJECT REVIEWS REQUIREMENT */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <Star className="w-4 h-4 fill-amber-400" />
              <span>Verified Project Reviews ({reviews.length})</span>
            </h3>
            <span className="text-[11px] text-emerald-400 font-extrabold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Legitimate Marketplace History
            </span>
          </div>

          {reviews.length === 0 ? (
            <div className="bg-slate-950 p-4 rounded-xl text-center border border-slate-800 text-xs text-slate-500">
              No verified project reviews yet. Reviews are generated only after completed KuvakaHub projects.
            </div>
          ) : (
            <div className="space-y-3">
              {reviews.map((rev) => (
                <div key={rev.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="bg-amber-500/20 text-amber-300 font-extrabold px-2.5 py-0.5 rounded text-[11px]">
                        {rev.overallRating} ★
                      </span>
                      <span className="font-bold text-white">Verified Client ({rev.reviewerName})</span>
                    </div>
                    <span className="bg-blue-500/20 text-blue-300 text-[10px] font-extrabold px-2 py-0.5 rounded border border-blue-500/30">
                      VERIFIED PROJECT
                    </span>
                  </div>

                  <p className="text-slate-300 italic">{rev.reviewText}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Portfolio Section */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            <span>Work Portfolio</span>
          </h3>

          {(!provider.portfolio || provider.portfolio.length === 0) ? (
            <p className="text-xs text-slate-400 bg-slate-950 p-4 rounded-xl border border-slate-800">
              No portfolio items uploaded yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {provider.portfolio.map((img) => (
                <div key={img.id} className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden space-y-2 pb-3">
                  <img src={img.url} alt={img.title} className="w-full h-44 object-cover" />
                  <p className="text-xs font-semibold text-slate-200 px-3">{img.title}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
