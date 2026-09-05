"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { feedbackStore, FeedbackCategory } from "@/lib/feedback-store";
import { analytics } from "@/lib/analytics";
import { MessageSquarePlus, CheckCircle2, X } from "lucide-react";

export function SendFeedbackButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState<FeedbackCategory>("CONFUSING");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const { user } = useAuth();
  const pathname = usePathname();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    feedbackStore.submitFeedback({
      userId: user?.id,
      userRole: user?.role || "GUEST",
      category,
      message: message.trim(),
      pageContext: pathname,
    });

    analytics.trackEvent("FEEDBACK_SUBMITTED", user?.id, user?.role, { category, page: pathname });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setIsOpen(false);
      setMessage("");
    }, 1500);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-amber-400 px-3 py-1.5 rounded-lg border border-slate-700 transition-all shadow-sm"
        title="Send Pilot Feedback"
      >
        <MessageSquarePlus className="w-3.5 h-3.5 text-amber-400" />
        <span>Send Feedback</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl relative">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2">
              <MessageSquarePlus className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-extrabold text-white">Send Pilot Feedback</h3>
            </div>
            <p className="text-xs text-slate-300">
              Help us improve KuvakaHub for Chinhoyi clients and service providers.
            </p>

            {isSuccess ? (
              <div className="bg-emerald-500/10 border border-emerald-500/40 p-4 rounded-xl text-emerald-300 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Thank you! Your feedback has been sent to Admin.</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Feedback Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as FeedbackCategory)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="CONFUSING">Something is confusing</option>
                    <option value="BROKEN">Something isn't working</option>
                    <option value="FEATURE_SUGGESTION">Feature suggestion</option>
                    <option value="OTHER">Other feedback</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Message</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Tell us what happened or what could be improved..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shadow-md"
                  >
                    Submit Feedback
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
