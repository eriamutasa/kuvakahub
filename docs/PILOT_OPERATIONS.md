# KuvakaHub Pilot Operations & Governance Guide

This document defines daily governance, bug classification, feedback protocols, change control, and backup/recovery procedures for the Chinhoyi MVP pilot.

---

## 1. Bug Priority & Defect Classification System
During the pilot, any reported defect or user issue must be classified into one of five severity levels:

| Priority | Classification | Response Target | Resolution Protocol |
| :--- | :--- | :--- | :--- |
| **P0** | **Critical Security / Data Loss / State Corruption** | Immediate (< 2 hours) | Hotfix deployed immediately; pilot paused if necessary. |
| **P1** | **Workflow Blocker** (User cannot submit quote/inspection/approval) | High (< 12 hours) | Dedicated resolution before next operational step. |
| **P2** | **Significant Usability Defect** | Medium (< 48 hours) | Batched into scheduled patch release. |
| **P3** | **Minor UX / Copy Issue** | Low (Weekly) | Queued for maintenance sprint. |
| **P4** | **Feature Request / Non-Essential Idea** | Backlog | Logged in backlog; strictly prohibited during Phase 5 pilot. |

---

## 2. Pilot KPI Funnel Measurement
Admin tracks the following privacy-safe funnel metrics:

$$\text{Funnel}: \text{PROJECT\_POSTED} \rightarrow \text{QUOTATION\_SUBMITTED} \rightarrow \text{PROVIDER\_SELECTED} \rightarrow \text{PROJECT\_ACTIVATED} \rightarrow \text{INSPECTION\_COMPLETED} \rightarrow \text{MILESTONE\_APPROVED} \rightarrow \text{PROJECT\_COMPLETED}$$

- **Marketplace Liquidity Metric**: $\ge 2\text{ to }3$ itemized quotations per published project.
- **Verification Accuracy Metric**: % of site visits resulting in `VERIFIED` vs `NEEDS_ATTENTION`.
- **Payment Transparency Metric**: % of approved milestones with completed off-platform payment declarations.

---

## 3. Pilot User Interview Questions

### Client Interview
1. Was posting your project in Chinhoyi straightforward?
2. Did comparing itemized quotations give you confidence in market prices?
3. Did seeing independent inspector photos increase your trust compared to builder photos alone?
4. Was recording off-platform payments clear?

### Provider Interview
1. Was receiving project notifications in Chinhoyi convenient?
2. Was creating itemized labor vs material quotes simple on your smartphone?
3. Did uploading milestone progress photos on mobile data work smoothly?
4. Did KuvakaHub verification help build your credibility with diaspora clients?

### Inspector Interview
1. Was accepting site visit assignments easy on mobile?
2. Did reviewing builder evidence before site visits save you time on site?
3. Was uploading independent site photos and logging reports practical on mobile?

---

## 4. Change Control & Migration Protocol
To maintain production database stability during pilot mode:
1. **No manual production schema edits**: All database changes must be written to a new timestamped migration file in `supabase/migrations/`.
2. **Never overwrite historical migrations**: Previous migration files (`20260905000000`, `20260905000001`, `20260905000002`) remain immutable.
3. **Pre-deployment verification**: Every change must pass `npx tsc --noEmit` and `npm run build` locally before deploying.

---

## 5. Backup & Disaster Recovery Procedures
- **Database Backups**: Automated daily point-in-time recovery (PITR) enabled via Supabase Cloud.
- **Storage Backups**: Storage objects in `provider-evidence` and `inspector-evidence` backed up via object store mirroring.
- **Credentials & Access Control**: Access keys stored securely in environment variables; `SUPABASE_SERVICE_ROLE_KEY` strictly guarded server-side.
