# 03 — Role-Based Navigation & Permissions

## Delivery and limitations

Entry point: `/staff/permissions`. Authentication remains at `/staff/sign-in`;
the public website is unchanged. This repository did not include Prompt 14's
shell or Prompt 15's features. This is an isolated shared-shell review prototype,
not an integration with a missing signed-in application.

No real identity, records, metrics, credentials, financial values, or requests
are used. Scenario selection belongs exclusively to the design-review toolbar;
it must never ship as a staff privilege switcher. There are no backend security
claims. No Figma canvas frames were created; the review sections are implemented
as responsive application surfaces.

## Review organization

1. Shared navigation architecture: one shell and permission-derived destinations.
2. Expanded/collapsed sidebar: desktop toggle, active indicator, hover/focus tooltip.
3–10. Reception, nursing, doctor, laboratory, radiology, pharmacy, cashier, and
inventory examples: choose the corresponding review scenario.
11. Administration examples: super administrator, hospital administrator, HR.
12. Department head and management: department-scoped versus aggregate examples.
13. Permission-aware actions: authorized primary actions, disabled lab validation,
hidden administration action, and direct unauthorized access.
14. Access-denied experience: state selector or an unauthorized destination.
15. Responsive navigation: full desktop shell; tablet/mobile modal drawer.
16. Reusable navigation components: `src/permissions/components.tsx`.
17. Role/permission matrix: header's design-review link.
18. Open decisions and backend dependencies: matrix review page.

## Shared structure and variable content

`model.ts` holds proposed role scenarios and destination metadata. Permissions
are separate from the displayed role label. `allowedDestinations` derives
navigation, groups, shortcuts, search results, and workflow notifications from
the same effective permission set. Tasks contain only fictional workflow names
and demonstration identifiers; they are filtered against authorized destinations.
Every module open is rechecked against current permissions. Unknown destinations
are restricted without disclosing record details.

Reusable sidebar, group, item, tooltip, drawer, page header, dashboard layout/card,
action group, permission-aware action, restricted hint, role indicator,
authorized empty state, and access-denied components share the existing palette,
Manrope/Inter wiring, buttons, semantic CSS variables, and professional SVG icons.
Native modal dialogs handle focus trapping and Escape; focus is restored after
close, and page navigation focuses the main region.

## Interactive review

- Switch design scenario: resets to its authorized home; never changes real access.
- Collapse sidebar: inspect active indicators and keyboard/hover tooltips.
- Open search: only effective destinations appear; opening checks current access.
- Open notifications: one fictional, authorized workflow reminder; mark as read.
- Open profile: fictional identity, personal compact-spacing preference only.
- Select loading, empty, network error, or access-restricted state.
- Simulate access change while viewing a module: removes operational grants,
  clears dialogs/search, updates navigation/notifications, and denies the module.
- Restore demo access: refreshes the fictional permission set.
- Laboratory scenario: entry is permitted; validation/release remains disabled.
- Direct URL example: `/staff/permissions/module/records` is restricted under
  the initial receptionist scenario.
- Review matrix: all 13 staff scenarios, boundaries, and approval questions.

## Hospital approval and backend requirements

Approve staffing roles, individual permission grants, departments, record
assignments, visible fields, clinical exceptions, emergency access, delegated
authority, result validation/release, refunds, report scope, and aggregation
thresholds. HR reports must be staff-scoped, department-head data must be limited
to authorized departments, and administrators must not receive automatic
clinical access.

Define permission-refresh timing and reauthentication triggers, handling of
unsaved work, session expiry, password changes, session sign-out, account
provisioning, support channels, audit logging/retention, authorized search
indexes, and notification recipients.

Backend services must authorize every request and record independently. Client
visibility and disabled controls are never access enforcement. Connect Prompt 13
authentication and reconcile this prototype with the actual Prompt 14/15 shell
before production use. The patient portal remains separate and unimplemented.
