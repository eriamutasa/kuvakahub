# KuvakaHub Pilot Operational Incident Log

This document records all operational incidents, defects, and security findings identified during live pilot operations in Chinhoyi.

---

## Severity Levels
- **P0**: Critical security breach, data loss, or payment state corruption.
- **P1**: Workflow blocker (User cannot complete quote, inspection, or milestone approval).
- **P2**: Significant usability or mobile layout defect.
- **P3**: Minor UX or copy issue.
- **P4**: Feature request (deferred post-pilot).

---

## Live Pilot Incident Records

| Incident ID | Date/Time (UTC) | Severity | Role Affected | Workflow | Description | Expected Behavior | Observed Behavior | Status & Resolution |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `INC-20260905-01` | 2026-09-05T18:10:00Z | P2 | PROVIDER | Quote Builder | Mobile keyboard covered "Submit Quote" button at 360px width. | Form should remain scrollable with sticky action bar. | Button obscured until scroll. | **RESOLVED**: Form padding adjusted for mobile viewports. |
| `INC-20260905-02` | 2026-09-05T18:12:00Z | P3 | CLIENT | Milestone Detail | "Return for Correction" button copy lacked explicit feedback prompt. | Clear prompt asking for required action. | Generic text box. | **RESOLVED**: Updated prompt text to request specific remediation steps. |

---

## Log Instructions
When recording a new incident:
1. Assign a unique `INC-YYYYMMDD-XX` identifier.
2. Record exact timestamp, affected user role, and workflow path.
3. Classify severity according to P0–P4 guidelines.
4. Detail expected vs. observed behavior without including passwords, API keys, or private evidence signed URLs.
5. Log resolution details and date of patch deployment.
