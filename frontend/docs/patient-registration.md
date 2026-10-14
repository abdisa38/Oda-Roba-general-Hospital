# 04 — Reception & Patient Operations
## Prompt 18 — Patient Registration

### Prompt 19 integration update

The directory is now implemented at `/staff/reception/module/directory` and
reuses this registration workflow. Its fixed identity fixtures share the existing
Prompt 18 examples; registration successes remain memory-only and do not create
persistent directory entries. Earlier references below to a directory concept
surface describe the Prompt 18 delivery state. The full Patient Profile is still
not built. See `patient-directory.md` for current directory behavior.

Entry point: `/staff/reception/module/registration`. The existing Prompt 16/17
shell is reused, including the sidebar, header, authorized search, notifications,
profile, responsive drawer, and access-denied pattern.

Register Patient on the dashboard now opens the existing-patient check directly,
without a preceding dialog. Sidebar/global-search registration destinations also
open the workflow. The directory remains a concept surface, with a Register
Patient entry point; no full directory or profile has been built.

## Review organization

The requested review frames are represented as interactive application states,
not newly created Figma canvas frames:

1. Registration entry and existing-patient check: initial page.
2. Search results: search `Hana`, `DEMO-EX-101`, or fictional phone token `0000000101`.
3. No match: search `Mira Example`, or use Search scenario → No matches.
4. Possible duplicate: review the Hana search candidates, or use Submission
   outcome → Possible duplicate after entering a different fictional name.
5–7. Patient/contact/emergency information: Continue to New Registration.
8. Field validation/error summary: Review Registration with a missing primary
   name, invalid email/phone, impossible date, or future illustrative date.
9. Review before submission: correct the fields and Review Registration.
10. Success: Submission outcome → Illustrative success; Register Patient.
11. Recovery: Submission failed, Connection unavailable, or Loading preview.
12. Session expired/permission denied: corresponding submission outcome or the
   existing shell controls. The shell's access-change simulation removes access.
13. Responsive: 1440, 1280, 768, 390 widths.
14. Reusable components: `src/registration/components.tsx`.
15. Interaction flow: check → grouped form → review → explicit local result.
16. Open decisions/backend dependencies: the page's expandable notes.

## Data collection and validation

Only a primary/given name is always required in this proposed model; it supports
single-name conventions. Additional/family names are optional. Hospital approval
must confirm the naming model and mandatory fields.

Birth information can remain unknown/not provided. If staff explicitly choose a
known birth date or age, that chosen value must be entered. Date uses an explicit
YYYY-MM-DD format. The demonstration disallows dates after its illustrative
18 Jun 2026 registration date; the production rule and server time need approval.
Age is a non-negative integer in completed years, labeled estimated or reported
as of the sample date, never treated as a verified date of birth. Switching modes
clears the inactive date/age so contradictory values cannot be submitted.
The validation function also detects conflicting date and age payloads.

Phone/email/address/emergency contact are optional. Phone syntax is deliberately
permissive: digits, spaces, +, parentheses, dots, and hyphens, with at least one
digit. No Ethiopian prefix, unconfirmed length, or region hierarchy is imposed.
This is illustrative syntax validation, not an approved hospital phone policy.
Backend/configured validation must replace or refine it.

Sex/classification, photographs, government identification, preferred-contact
choices, clinical history, and additional sensitive details are omitted pending
approved need. Emergency contacts remain distinct from the patient.

## Identity and duplicates

Search uses fixed fictional fixtures only; none is automatically selected.
Results show illustrative IDs, names, birth information, and masked contacts.
Review reveals only administrative sample identity context. An explicit
multi-attribute verification acknowledgment is required before demonstrating
selection of an existing record. The approved evidence is an open decision.

No search results never guarantees absence of duplicates. A simple fictional
name-prefix candidate example can trigger comparison during form review;
Submission outcome → Possible duplicate simulates a late server-side response.
Neither represents an implemented matching service or definitive algorithm.

Comparison preserves the new draft, presents candidate identifying information,
offers review/return actions, and requires a proposed acknowledgment before
continuing a distinct new-patient preview. Editing the draft invalidates its
acknowledgment. This is not approved receptionist override authority.
No automatic or receptionist record merge exists.

## Review, recovery, navigation, and privacy

Review groups patient information, contacts, and emergency contact with Edit
actions that return focus to the section. Validation errors have associated
messages and an actionable, focused summary. Modal dialogs use the existing
native-dialog focus/Escape behavior.
The success section announces its illustrative result as a status. Step changes
focus the content region; section edits focus the first input in that section.

If registration is granted without patient-directory/lookup permission, this
prototype shows a restricted-lookup explanation and no identifying matches.
The hospital must define a safe verification workflow for that configuration.

Submission has a busy state and disables repeat submission. Failure and
connection-unavailable outcomes preserve the entire draft in this open component.
Retry repeats the selected scenario; choose Illustrative success to demonstrate
recovery. Loading preview can be stopped, returning to review without saving.

Cancel/internal navigation prompts before discarding a changed draft. Page
unload receives a browser-native unsaved-change warning. Internal staff history
navigation is guarded. Drafts are not stored locally, included in URLs, logged,
transmitted, or synchronized offline. They reset on unmount/reload.

Session-expiry/permission-denial submission examples clear and hide the draft;
shell expiry or access revocation unmounts and hides the workflow. Reauthentication
or access restoration does not recover a draft. The hospital must decide safe
recovery and handling of unsaved data before production.

## Success and identifiers

Success is explicitly illustrative. The wording says the record exists in this
demonstration only and nothing was sent or saved to a hospital system.
`DEMO-NEW-001` is a memory-only example identifier, not the hospital's patient-ID
format. The View Patient Record summary shows the same assigned identifier.
Register Another Patient resets the workflow; no full profile is created.

No check-in, appointment, completed encounter, diagnosis, order, prescription,
invoice, or downstream transaction is automatically created.

## Backend and hospital decisions

Approve required demographics, naming conventions, birth/age rules and provenance,
date/calendar/timezone handling, identity attributes and verification evidence,
phone formats, masked-field visibility, staff/department/record permissions,
duplicate thresholds, late-duplicate handling and override authority, separate
merging policy, identifier format, audit logging, retention, session expiry,
permission refresh, and unsaved-data recovery.

Backend services must independently authorize each search and submission, validate
all submitted fields, recheck duplicates transactionally, enforce idempotency,
issue persistent identifiers, and handle retries without accidental duplicates.
Frontend visibility/validation is not a security or integrity guarantee.
No backend or offline capability is connected. Stop at Prompt 18.
