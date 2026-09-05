# KuvakaHub Chinhoyi Pilot Operational Checklist & Procedures

## 1. Pre-Pilot Setup & Technical Verification
- [x] **Supabase Database & Migrations Applied**:
  - `20260905000000_phase1_schema.sql` (Base tables, RLS policies, security-invoker views)
  - `20260905000001_phase4_schema.sql` (Payment records, disputes, reviews)
  - `20260905000002_phase5_pilot_hardening.sql` (Performance indexes, feedback table, analytics, idempotency)
- [x] **Private Storage Buckets Configured**:
  - `provider-evidence` (Private read/write RLS)
  - `inspector-evidence` (Private RLS — strictly invisible to providers)
- [x] **Verified Admin & Inspector Seeded**:
  - Platform Admin account configured
  - Verified Independent Site Inspector account registered and verified (`Eng. Farai Nyamapfene`)
- [x] **Mobile Responsiveness Audited**:
  - Form layouts, side-by-side evidence views, and payment trackers verified at 360px, 390px, and 412px viewports.
- [x] **Production Build Clean**:
  - `npx tsc --noEmit` and `npm run build` passing with zero errors across all 29 app routes.

---

## 2. Pilot Launch Procedure (Chinhoyi Focus)
1. **Onboard First 5 Chinhoyi Service Providers**:
   - Register local builders, masons, and plumbers in Chinhoyi.
   - Admin verifies credentials via `/admin/dashboard` ($\text{UNVERIFIED} \rightarrow \text{VERIFIED}$).
2. **Onboard Diaspora Clients**:
   - Share invitation links with Zimbabwean diaspora clients in UK/SA/US.
3. **Publish Real Construction Jobs**:
   - Post residential foundation, tubing, walling, or roof sheeting jobs in Hunyani, Orange Groove, or Cold Stream.
4. **Monitor Marketplace Funnel**:
   - Track zero-quotation projects via Admin operations dashboard.
   - Monitor inspection assignments when providers submit milestone progress.
   - Dispatch independent site inspector for physical verification.

---

## 3. During-Pilot Monitoring & Operations
- [ ] Monitor unassigned inspection queue at `/admin/inspections`.
- [ ] Monitor payment dispute queue at `/admin/payment-disputes`.
- [ ] Monitor user feedback logs submitted via "Send Feedback".
- [ ] Verify image compression and video playback on low-bandwidth mobile data.

---

## 4. Post-Pilot Assessment
- [ ] Calculate conversion rate: Posted Jobs $\rightarrow$ Quotations $\rightarrow$ Active Projects $\rightarrow$ Completed Projects.
- [ ] Conduct user feedback interviews with Diaspora Clients and Chinhoyi Builders.
- [ ] Prioritize Phase 6 features based on pilot feedback.
