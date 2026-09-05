"use client";

import React, { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { marketplaceStore, QuotationItem } from "@/lib/marketplace-store";
import {
  FileSpreadsheet,
  Plus,
  Trash2,
  Save,
  Send,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  DollarSign,
  Calendar,
  Clock,
  RotateCcw,
} from "lucide-react";

export default function QuotationBuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();

  const job = marketplaceStore.getProjectById(id);
  if (!job) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 p-8 text-center">
        <p className="text-slate-400">Job opportunity record not found.</p>
      </div>
    );
  }

  const userQuotes = marketplaceStore.getQuotationsForProject(
    job.id,
    user?.id || "",
    "PROVIDER"
  );
  const existingQuote = userQuotes[0];

  // Quotation Items State
  const [items, setItems] = useState<Omit<QuotationItem, "id" | "quotationId">[]>(
    existingQuote?.items || [
      { itemType: "LABOUR", description: "", quantity: 1, unit: "Sum", unitPrice: 0, lineTotal: 0 },
    ]
  );

  const [estDurationDays, setEstDurationDays] = useState(existingQuote?.estDurationDays || 14);
  const [proposedStartDate, setProposedStartDate] = useState(existingQuote?.proposedStartDate || "2026-09-15");
  const [notes, setNotes] = useState(existingQuote?.notes || "Price includes machine compaction and 25MPa concrete mix testing.");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Trusted Calculations (Monetary arithmetic)
  const laborSubtotal = items
    .filter((i) => i.itemType === "LABOUR")
    .reduce((sum, i) => sum + (i.quantity > 0 && i.unitPrice > 0 ? i.quantity * i.unitPrice : 0), 0);

  const materialSubtotal = items
    .filter((i) => i.itemType === "MATERIAL")
    .reduce((sum, i) => sum + (i.quantity > 0 && i.unitPrice > 0 ? i.quantity * i.unitPrice : 0), 0);

  const grandTotal = laborSubtotal + materialSubtotal;

  const handleAddItem = (type: "LABOUR" | "MATERIAL") => {
    setItems([
      ...items,
      {
        itemType: type,
        description: "",
        quantity: 1,
        unit: type === "LABOUR" ? "Sum" : "Unit",
        unitPrice: 0,
        lineTotal: 0,
      },
    ]);
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const updated = [...items];
    const item = { ...updated[index], [field]: value };

    // Auto calculate line total reliably
    const qty = parseFloat(item.quantity as any) || 0;
    const price = parseFloat(item.unitPrice as any) || 0;
    item.lineTotal = qty * price;

    updated[index] = item;
    setItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const validateQuotation = () => {
    setErrorMsg("");
    if (items.length === 0) {
      setErrorMsg("Please add at least one Labour or Material item.");
      return false;
    }

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.description.trim()) {
        setErrorMsg(`Item #${i + 1} is missing a description.`);
        return false;
      }
      if (item.quantity <= 0 || isNaN(item.quantity)) {
        setErrorMsg(`Item #${i + 1} (${item.description}) must have a positive quantity.`);
        return false;
      }
      if (item.unitPrice <= 0 || isNaN(item.unitPrice)) {
        setErrorMsg(`Item #${i + 1} (${item.description}) must have a positive unit price.`);
        return false;
      }
    }
    return true;
  };

  const handleSave = (status: "DRAFT" | "SUBMITTED") => {
    if (!validateQuotation()) return;

    marketplaceStore.saveQuotation({
      projectId: job.id,
      providerId: user?.id || "",
      providerName: user?.fullName || "Account",
      providerBusinessName: user?.profileDetails?.businessName || "Registered Business",
      providerPhone: user?.phoneE164 || "",
      providerExperience: (user?.profileDetails as any)?.experience || "Contractor",
      verificationStatus: user?.profileDetails?.verificationStatus || "UNVERIFIED",
      laborSubtotal,
      materialSubtotal,
      totalAmount: grandTotal,
      estDurationDays,
      proposedStartDate,
      status,
      notes,
      items: items.map((i, idx) => ({
        ...i,
        id: `qi-${idx + 1}`,
        quotationId: existingQuote?.id || "quote-new",
        lineTotal: i.quantity * i.unitPrice,
      })),
    });

    setSuccessMsg(
      status === "SUBMITTED"
        ? "Quotation successfully submitted to client!"
        : "Draft quotation saved successfully."
    );

    setTimeout(() => {
      router.push("/provider/dashboard");
    }, 1200);
  };

  const handleWithdraw = () => {
    if (!existingQuote) return;
    marketplaceStore.withdrawQuotation(existingQuote.id, user?.id || "");
    setSuccessMsg("Quotation withdrawn.");
    setTimeout(() => {
      router.push("/provider/dashboard");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 text-slate-100 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold">
          <FileSpreadsheet className="w-4 h-4" />
          <span>Itemized Quotation Engine</span>
        </div>
        <h1 className="text-2xl font-extrabold text-white">Quotation Builder</h1>
        <p className="text-xs text-slate-400">
          Project: <strong>{job.title}</strong> • Location: {job.suburb}, {job.city}
        </p>
      </div>

      {errorMsg && (
        <div className="bg-red-950/60 border border-red-800 p-3 rounded-xl flex items-center gap-2 text-xs text-red-200">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-950/60 border border-emerald-800 p-3 rounded-xl flex items-center gap-2 text-xs text-emerald-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Quotation Form */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-6">
        {/* SECTION 1: LABOUR ITEMS */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider">
              1. Labour Items
            </h2>
            <button
              type="button"
              onClick={() => handleAddItem("LABOUR")}
              className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/30"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Labour Line</span>
            </button>
          </div>

          <div className="space-y-3">
            {items
              .map((item, index) => ({ item, index }))
              .filter(({ item }) => item.itemType === "LABOUR")
              .map(({ item, index }) => (
                <div
                  key={index}
                  className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                    <div className="sm:col-span-6">
                      <label className="text-[10px] text-slate-400 font-semibold block mb-0.5">
                        Description
                      </label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleItemChange(index, "description", e.target.value)}
                        placeholder="e.g. Trench excavation & setting out"
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white text-xs"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[10px] text-slate-400 font-semibold block mb-0.5">
                        Qty
                      </label>
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                        className="w-full px-2 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white text-xs"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[10px] text-slate-400 font-semibold block mb-0.5">
                        Price ($)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(index, "unitPrice", e.target.value)}
                        className="w-full px-2 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white text-xs"
                      />
                    </div>

                    <div className="sm:col-span-2 flex items-center justify-between pt-3 sm:pt-0">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Total</span>
                        <span className="font-bold text-amber-400 text-xs">
                          ${(item.quantity * item.unitPrice).toLocaleString()}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="text-slate-500 hover:text-red-400 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          <div className="text-right text-xs font-semibold text-slate-300 pt-1">
            Labour Subtotal: <strong className="text-amber-400 font-bold">${laborSubtotal.toLocaleString()}</strong>
          </div>
        </div>

        {/* SECTION 2: MATERIALS ITEMS */}
        <div className="space-y-3 pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider">
              2. Material Items
            </h2>
            <button
              type="button"
              onClick={() => handleAddItem("MATERIAL")}
              className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/30"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Material Line</span>
            </button>
          </div>

          <div className="space-y-3">
            {items
              .map((item, index) => ({ item, index }))
              .filter(({ item }) => item.itemType === "MATERIAL")
              .map(({ item, index }) => (
                <div
                  key={index}
                  className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                    <div className="sm:col-span-5">
                      <label className="text-[10px] text-slate-400 font-semibold block mb-0.5">
                        Description
                      </label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleItemChange(index, "description", e.target.value)}
                        placeholder="e.g. PC 42.5 Cement Bags"
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white text-xs"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[10px] text-slate-400 font-semibold block mb-0.5">
                        Qty / Unit
                      </label>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                          className="w-16 px-1.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white text-xs"
                        />
                        <input
                          type="text"
                          value={item.unit}
                          onChange={(e) => handleItemChange(index, "unit", e.target.value)}
                          placeholder="Bag/Thousand"
                          className="w-16 px-1.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white text-xs"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[10px] text-slate-400 font-semibold block mb-0.5">
                        Unit Price ($)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(index, "unitPrice", e.target.value)}
                        className="w-full px-2 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white text-xs"
                      />
                    </div>

                    <div className="sm:col-span-3 flex items-center justify-between pt-3 sm:pt-0">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Total</span>
                        <span className="font-bold text-amber-400 text-xs">
                          ${(item.quantity * item.unitPrice).toLocaleString()}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="text-slate-500 hover:text-red-400 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          <div className="text-right text-xs font-semibold text-slate-300 pt-1">
            Materials Subtotal: <strong className="text-amber-400 font-bold">${materialSubtotal.toLocaleString()}</strong>
          </div>
        </div>

        {/* SECTION 3: GRAND TOTAL & METADATA */}
        <div className="pt-4 border-t border-slate-800 space-y-4">
          <div className="bg-slate-950 p-4 rounded-xl border border-amber-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs text-slate-400">Total Calculated Quotation</p>
              <p className="text-xs text-slate-500">Labour (${laborSubtotal.toLocaleString()}) + Materials (${materialSubtotal.toLocaleString()})</p>
            </div>
            <div className="text-2xl font-extrabold text-amber-400">
              ${grandTotal.toLocaleString()} USD
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Estimated Work Duration (Days)
              </label>
              <input
                type="number"
                value={estDurationDays}
                onChange={(e) => setEstDurationDays(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Proposed Start Date
              </label>
              <input
                type="date"
                value={proposedStartDate}
                onChange={(e) => setProposedStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Quotation Notes / Terms
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Materials quote valid for 14 days. Machine compaction included..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            {existingQuote && (
              <button
                type="button"
                onClick={handleWithdraw}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 text-xs font-bold text-red-400 hover:text-white bg-red-950/40 hover:bg-red-900/60 border border-red-800 px-4 py-3 rounded-xl transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Withdraw Quotation</span>
              </button>
            )}

            <div className="w-full sm:w-auto flex items-center gap-2 justify-end">
              <button
                type="button"
                onClick={() => handleSave("DRAFT")}
                className="inline-flex items-center gap-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 px-5 py-3 rounded-xl border border-slate-700 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Save Draft</span>
              </button>

              <button
                type="button"
                onClick={() => handleSave("SUBMITTED")}
                className="inline-flex items-center gap-1.5 text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white px-6 py-3 rounded-xl shadow-md transition-all"
              >
                <Send className="w-4 h-4" />
                <span>Submit Quotation</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
