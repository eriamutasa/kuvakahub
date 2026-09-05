"use client";

import React, { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { marketplaceStore, Quotation } from "@/lib/marketplace-store";
import { generateWhatsAppLink, getProviderContactMessage } from "@/lib/whatsapp";
import {
  FileSpreadsheet,
  Building,
  CheckCircle2,
  ShieldCheck,
  MessageCircle,
  Award,
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  XCircle,
  HardHat,
  Lock,
} from "lucide-react";

export default function QuotationComparisonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();

  const project = marketplaceStore.getProjectById(id);
  if (!project) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 p-8 text-center">
        <p className="text-slate-400">Project record not found.</p>
      </div>
    );
  }

  const quotations = marketplaceStore.getQuotationsForProject(
    project.id,
    user?.id || "",
    user?.role || "CLIENT"
  );

  const [expandedQuoteId, setExpandedQuoteId] = useState<string | null>(null);
  const [selectedQuoteForModal, setSelectedQuoteForModal] = useState<Quotation | null>(null);
  const [successMsg, setSuccessMsg] = useState("");

  const handleSelectConfirm = () => {
    if (!selectedQuoteForModal || !user) return;

    marketplaceStore.selectProviderForProject(project.id, selectedQuoteForModal.id, user.id);

    setSuccessMsg(`Provider ${selectedQuoteForModal.providerBusinessName} selected! Project is now active.`);
    setSelectedQuoteForModal(null);

    setTimeout(() => {
      router.push(`/client/projects/${project.id}`);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-800/60 border border-slate-700/80 p-6 rounded-2xl space-y-3 shadow-xl">
        <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold">
          <FileSpreadsheet className="w-4 h-4" />
          <span>Quotation Comparison Matrix</span>
        </div>
        <h1 className="text-2xl font-extrabold text-white">{project.title}</h1>
        <p className="text-xs text-slate-400">
          Location: {project.suburb}, {project.city} • Total Bids: {quotations.length}
        </p>
      </div>

      {successMsg && (
        <div className="bg-emerald-950/80 border border-emerald-800 p-4 rounded-xl flex items-center gap-3 text-xs text-emerald-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="font-bold">{successMsg}</span>
        </div>
      )}

      {/* Secrecy Confirmation Notice */}
      <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-start gap-3 text-xs text-slate-300">
        <Lock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-white">Confidential Bidding Environment</p>
          <p className="text-slate-400 leading-relaxed">
            As the project owner, you can view all itemized quotations side-by-side. Providers are strictly blocked from seeing competitor quotes and prices.
          </p>
        </div>
      </div>

      {/* Quotations List / Cards */}
      <div className="space-y-6">
        {quotations.length === 0 ? (
          <div className="bg-slate-800/40 border border-slate-700/60 p-12 rounded-2xl text-center space-y-3">
            <FileSpreadsheet className="w-10 h-10 text-slate-500 mx-auto" />
            <p className="font-bold text-white text-sm">No Quotations Submitted Yet</p>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Your project is open for quotations. Local providers in Chinhoyi will submit itemized bids shortly.
            </p>
          </div>
        ) : (
          quotations.map((quote) => {
            const isExpanded = expandedQuoteId === quote.id;
            const waLink = generateWhatsAppLink(
              quote.providerPhone,
              getProviderContactMessage(quote.providerBusinessName, project.title)
            );

            return (
              <div
                key={quote.id}
                className={`bg-slate-800/60 border rounded-2xl p-6 space-y-4 shadow-lg transition-all ${
                  quote.status === "ACCEPTED"
                    ? "border-emerald-500/80 bg-emerald-950/20"
                    : "border-slate-700/80"
                }`}
              >
                {/* Provider Info Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700/60 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-white">{quote.providerBusinessName}</h3>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded uppercase border ${
                          quote.verificationStatus === "VERIFIED"
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                            : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                        }`}
                      >
                        {quote.verificationStatus}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Contractor: {quote.providerName} • {quote.providerExperience} experience
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-extrabold text-amber-400">
                      ${quote.totalAmount.toLocaleString()} USD
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Labour: ${quote.laborSubtotal.toLocaleString()} | Materials: ${quote.materialSubtotal.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Duration & Start Date */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <p className="text-slate-400">Est. Duration</p>
                    <p className="font-bold text-white mt-0.5">{quote.estDurationDays} Days</p>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <p className="text-slate-400">Proposed Start</p>
                    <p className="font-bold text-white mt-0.5">{quote.proposedStartDate}</p>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <p className="text-slate-400">Labour Subtotal</p>
                    <p className="font-bold text-amber-300 mt-0.5">${quote.laborSubtotal.toLocaleString()}</p>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <p className="text-slate-400">Material Subtotal</p>
                    <p className="font-bold text-amber-300 mt-0.5">${quote.materialSubtotal.toLocaleString()}</p>
                  </div>
                </div>

                {quote.notes && (
                  <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <strong>Note:</strong> {quote.notes}
                  </p>
                )}

                {/* Itemized Line Items Drawer */}
                <div>
                  <button
                    onClick={() => setExpandedQuoteId(isExpanded ? null : quote.id)}
                    className="flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:underline"
                  >
                    <span>{isExpanded ? "Hide Full Itemized Breakdown" : "View Full Itemized Breakdown"}</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {isExpanded && (
                    <div className="mt-3 bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4 text-xs">
                      {/* Labour Breakdown */}
                      <div className="space-y-2">
                        <h4 className="font-bold text-amber-400 text-[11px] uppercase tracking-wider">
                          Labour Line Items
                        </h4>
                        <div className="space-y-1">
                          {quote.items
                            .filter((i) => i.itemType === "LABOUR")
                            .map((item) => (
                              <div key={item.id} className="flex justify-between py-1 border-b border-slate-900 text-slate-300">
                                <span>{item.description}</span>
                                <span className="font-semibold text-white">${item.lineTotal.toLocaleString()}</span>
                              </div>
                            ))}
                        </div>
                      </div>

                      {/* Materials Breakdown */}
                      <div className="space-y-2 pt-2 border-t border-slate-900">
                        <h4 className="font-bold text-amber-400 text-[11px] uppercase tracking-wider">
                          Material Line Items
                        </h4>
                        <div className="space-y-1">
                          {quote.items
                            .filter((i) => i.itemType === "MATERIAL")
                            .map((item) => (
                              <div key={item.id} className="flex justify-between py-1 border-b border-slate-900 text-slate-300">
                                <span>{item.description} ({item.quantity} {item.unit} @ ${item.unitPrice})</span>
                                <span className="font-semibold text-white">${item.lineTotal.toLocaleString()}</span>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-700/50">
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 px-3.5 py-2 rounded-xl border border-emerald-500/30"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp Provider</span>
                  </a>

                  {quote.status === "ACCEPTED" ? (
                    <span className="text-xs font-bold bg-emerald-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>SELECTED PROVIDER</span>
                    </span>
                  ) : quote.status === "REJECTED" ? (
                    <span className="text-xs font-semibold text-slate-500 bg-slate-900 px-4 py-2 rounded-xl">
                      NOT SELECTED
                    </span>
                  ) : (
                    <button
                      onClick={() => setSelectedQuoteForModal(quote)}
                      className="text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white px-6 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2"
                    >
                      <span>SELECT PROVIDER</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* CONFIRMATION MODAL */}
      {selectedQuoteForModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm border-b border-slate-800 pb-3">
              <AlertTriangle className="w-5 h-5" />
              <span>Confirm Provider Selection</span>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <p>You are selecting <strong className="text-white">{selectedQuoteForModal.providerBusinessName}</strong> for this project.</p>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <p>Quotation Total: <strong className="text-amber-400">${selectedQuoteForModal.totalAmount.toLocaleString()} USD</strong></p>
                <p>Est. Duration: <strong>{selectedQuoteForModal.estDurationDays} Days</strong></p>
                <p>Proposed Start: <strong>{selectedQuoteForModal.proposedStartDate}</strong></p>
              </div>
              <p className="text-amber-300 text-[11px] leading-normal pt-1">
                ⚠️ Selecting this provider will close this project to new quotations and assign the project.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedQuoteForModal(null)}
                className="text-xs font-semibold px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                Cancel
              </button>

              <button
                onClick={handleSelectConfirm}
                className="text-xs font-bold px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white shadow-md"
              >
                Confirm Selection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
