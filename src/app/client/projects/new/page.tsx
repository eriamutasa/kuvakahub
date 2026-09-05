"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { marketplaceStore } from "@/lib/marketplace-store";
import { APP_NAME, LAUNCH_CITY, SERVICE_CATEGORIES, CHINHOYI_SUBURBS } from "@/lib/constants";
import { generateWhatsAppLink, getShareProjectMessage } from "@/lib/whatsapp";
import {
  FolderPlus,
  Building,
  MapPin,
  Calendar,
  DollarSign,
  Globe,
  Lock,
  CheckCircle2,
  ArrowRight,
  MessageCircle,
  Eye,
  FileText,
} from "lucide-react";

export default function NewProjectPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [categorySlug, setCategorySlug] = useState("building");
  const [suburb, setSuburb] = useState("Hunyani");
  const [description, setDescription] = useState("");
  const [timeframe, setTimeframe] = useState("Within 2 weeks");
  const [budgetEstimate, setBudgetEstimate] = useState("");
  const [visibility, setVisibility] = useState<"MARKETPLACE" | "INVITE_ONLY">("MARKETPLACE");
  const [addressPrivate, setAddressPrivate] = useState("");

  const [createdProject, setCreatedProject] = useState<any>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !user) return;

    const categoryObj = SERVICE_CATEGORIES.find((c) => c.slug === categorySlug);

    const project = marketplaceStore.createProject({
      clientId: user.id,
      clientName: user.fullName,
      title,
      categorySlug,
      categoryName: categoryObj?.name || "General Construction",
      city: LAUNCH_CITY,
      suburb,
      description,
      timeframe,
      preferredTimeframe: timeframe,
      budgetEstimate: budgetEstimate ? parseFloat(budgetEstimate) : undefined,
      visibility,
      status: "OPEN_FOR_QUOTATIONS",
      addressPrivate: addressPrivate || undefined,
    });

    setCreatedProject(project);
  };

  if (createdProject) {
    const waLink = generateWhatsAppLink(
      user?.phoneE164 || "",
      getShareProjectMessage(
        createdProject.title,
        createdProject.suburb,
        `https://kuvakahub.co.zw/jobs`
      )
    );

    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 text-slate-100">
        <div className="sm:mx-auto sm:w-full sm:max-w-md bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl space-y-6 text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-white">Project Published!</h2>
            <p className="text-xs text-amber-400 font-semibold">
              Your project is now open for quotations in {LAUNCH_CITY}.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-left space-y-2 text-xs">
            <p className="font-bold text-white text-sm">{createdProject.title}</p>
            <p className="text-slate-400">Category: {createdProject.categoryName}</p>
            <p className="text-slate-400">Location: {createdProject.suburb}, {createdProject.city}</p>
            <p className="text-slate-400">Visibility: {createdProject.visibility}</p>
          </div>

          <div className="space-y-3">
            <Link
              href={`/client/projects/${createdProject.id}`}
              className="w-full inline-flex items-center justify-center gap-2 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-sm transition-all"
            >
              <span>View Project Overview</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href={waLink}
              target="_blank"
              rel="noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Share via WhatsApp</span>
            </a>

            <Link
              href="/providers"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl text-xs"
            >
              <span>Browse Matching Professionals</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 text-slate-100 max-w-3xl mx-auto space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold">
          <FolderPlus className="w-4 h-4" />
          <span>Diaspora Client Project Wizard</span>
        </div>
        <h1 className="text-2xl font-extrabold text-white">Post a New Construction Project</h1>
        <p className="text-xs text-slate-400">
          Request structured itemized quotations from local professionals in {LAUNCH_CITY}.
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label htmlFor="projectTitle" className="block text-xs font-semibold text-slate-300 mb-1">
              Project Title *
            </label>
            <input
              id="projectTitle"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 3-Bedroom House Foundation & Footing Construction"
              className="w-full px-3.5 py-2.5 min-h-[44px] bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          {/* Category & Suburb */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="categorySlug" className="block text-xs font-semibold text-slate-300 mb-1">
                Service Category *
              </label>
              <select
                id="categorySlug"
                value={categorySlug}
                onChange={(e) => setCategorySlug(e.target.value)}
                className="w-full px-3.5 py-2.5 min-h-[44px] bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              >
                {SERVICE_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="suburb" className="block text-xs font-semibold text-slate-300 mb-1">
                Suburb in {LAUNCH_CITY} *
              </label>
              <select
                id="suburb"
                value={suburb}
                onChange={(e) => setSuburb(e.target.value)}
                className="w-full px-3.5 py-2.5 min-h-[44px] bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              >
                {CHINHOYI_SUBURBS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-xs font-semibold text-slate-300 mb-1">
              Detailed Scope / Project Description *
            </label>
            <textarea
              id="description"
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe trench depth, slab thickness, brick requirements, and site conditions..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          {/* Timeframe & Budget */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="timeframe" className="block text-xs font-semibold text-slate-300 mb-1">
                Preferred Start Timeframe *
              </label>
              <select
                id="timeframe"
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="w-full px-3.5 py-2.5 min-h-[44px] bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="Immediately">Immediately (Within 7 days)</option>
                <option value="Within 2 weeks">Within 2 weeks</option>
                <option value="Within 1 month">Within 1 month</option>
                <option value="Flexible">Flexible / Planning stage</option>
              </select>
            </div>

            <div>
              <label htmlFor="budgetEstimate" className="block text-xs font-semibold text-slate-300 mb-1">
                Estimated Budget ($ USD) (Optional)
              </label>
              <input
                id="budgetEstimate"
                type="number"
                value={budgetEstimate}
                onChange={(e) => setBudgetEstimate(e.target.value)}
                placeholder="e.g. 6500"
                className="w-full px-3.5 py-2.5 min-h-[44px] bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
          </div>

          {/* Optional Private Property Address (Privacy Safeguard) */}
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-400" />
              <label htmlFor="addressPrivate" className="text-xs font-semibold text-white">
                Private Stand / Street Address (Optional & Protected)
              </label>
            </div>
            <input
              id="addressPrivate"
              type="text"
              value={addressPrivate}
              onChange={(e) => setAddressPrivate(e.target.value)}
              placeholder="e.g. Stand 4182 Hunyani, Chinhoyi"
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
            <p className="text-[11px] text-slate-400 leading-normal">
              🔒 <strong>Privacy Safeguard:</strong> This address is hidden from the public and bidding contractors until you select a winning provider.
            </p>
          </div>

          {/* Visibility Option */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">
              Project Marketplace Visibility
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div
                role="button"
                tabIndex={0}
                onClick={() => setVisibility("MARKETPLACE")}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setVisibility("MARKETPLACE");
                  }
                }}
                aria-pressed={visibility === "MARKETPLACE"}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  visibility === "MARKETPLACE"
                    ? "bg-amber-950/60 border-amber-500 text-white shadow"
                    : "bg-slate-950 border-slate-800 text-slate-400"
                }`}
              >
                <div className="flex items-center gap-2 font-bold mb-1">
                  <Globe className="w-4 h-4 text-amber-400" />
                  <span>Marketplace (Recommended)</span>
                </div>
                <p className="text-[11px] text-slate-400">All matching verified providers in Chinhoyi can see and quote.</p>
              </div>

              <div
                role="button"
                tabIndex={0}
                onClick={() => setVisibility("INVITE_ONLY")}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setVisibility("INVITE_ONLY");
                  }
                }}
                aria-pressed={visibility === "INVITE_ONLY"}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  visibility === "INVITE_ONLY"
                    ? "bg-amber-950/60 border-amber-500 text-white shadow"
                    : "bg-slate-950 border-slate-800 text-slate-400"
                }`}
              >
                <div className="flex items-center gap-2 font-bold mb-1">
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>Invite Only</span>
                </div>
                <p className="text-[11px] text-slate-400">Hidden from opportunity feed. Only invited pros can view.</p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 min-h-[44px] bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <span>Publish Project for Quotations</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
