# KuvakaHub Admin Operations Guide

This guide details the administrative procedures for operating the KuvakaHub MVP pilot in Chinhoyi, Zimbabwe.

---

## 1. Admin Account Initialization
- Admin accounts are created via controlled database role assignment:
  ```sql
  UPDATE public.profiles 
  SET role = 'ADMIN' 
  WHERE email = 'admin@kuvakahub.co.zw';
  ```
- Public self-registration for Admin roles is disabled at the database level via row-level security.

---

## 2. Provider Credential Verification Procedure
1. Navigate to `/admin/dashboard`.
2. Locate the **Provider Verification Queue**.
3. Inspect submitted details:
   - Business name & trade category
   - Operating area (e.g., Hunyani, Orange Groove, Chinhoyi Central)
   - Self-reported experience & past project portfolio
4. Perform background validation (e.g., WhatsApp phone confirmation or local reference check).
5. Click **Approve Verified Provider Status** ($\text{UNVERIFIED} \rightarrow \text{VERIFIED}$).
6. Record administrative verification timestamp.

---

## 3. Inspector Verification & Assignment Procedure
1. Inspector accounts are initialized by Admin:
   ```sql
   UPDATE public.profiles 
   SET role = 'INSPECTOR' 
   WHERE email = 'eng.farai@kuvakahub.co.zw';
   ```
2. Navigate to `/admin/inspections`.
3. Review milestones with status `INSPECTION_REQUIRED`.
4. Select a verified Independent Site Inspector (`Eng. Farai Nyamapfene`).
5. Set scheduled site visit date.
6. Click **Assign Inspector**.
7. The database enforces a maximum of **1 active inspector assignment** per milestone.

---

## 4. Payment Dispute Resolution Protocol
1. Navigate to `/admin/payment-disputes`.
2. Review open disputes raised by Clients or Providers.
3. Audit transaction references (e.g. EcoCash transaction ID or bank transfer proof).
4. Enter administrative resolution notes explaining findings.
5. Set status to `RESOLVED` or `CLOSED`.
6. *Note*: KuvakaHub administrative resolution records platform findings. KuvakaHub does not modify bank or mobile money transactions.

---

## 5. Daily Operations Queue Checklist
- [ ] Review pending provider verification submissions.
- [ ] Check for projects with zero quotations after 24 hours.
- [ ] Assign site inspectors to milestones in `INSPECTION_REQUIRED` state.
- [ ] Review open payment disputes.
- [ ] Inspect user feedback submissions via `/admin/dashboard`.
