# 04 — Reception & Patient Operations
## Prompt 17 — Reception Dashboard

### Prompt 18 integration update

Register Patient and Complete Registration now open the integrated patient
registration preview directly at `/staff/reception/module/registration`.
Lookup-before-registration guidance is part of that page, followed by its grouped
form and review. The original Prompt 17-only entry-dialog descriptions below are
historical; see `patient-registration.md` for current behavior. The full directory,
profile, appointment manager, and queue manager remain outside scope.

Entry point: `/staff/reception`. This extends the existing Prompt 16 shared shell,
including its sidebar, header, breadcrumbs, search, notifications, profile,
permission checks, and responsive drawer. No replacement Prompt 14/15 shell,
backend, registration form, directory, patient profile, appointment manager,
or queue-management workflow is created.

The application surfaces represent the requested review organization. No Figma
canvas frames have been created:

1. Desktop default: `/staff/reception`, Content state = Ready.
2. Queue empty: Content state = Empty.
3. No appointments: Content state = No appointments (upcoming list empty).
4. Loading: skeleton summaries and lists, no populated values.
5. Error: retrieval error and Retry.
6. Search/filter empty: Content state = No search matches, or search the queue.
7. Tablet: 768px, drawer, two-column summaries, structured queue cards.
8. Mobile: 390px, stacked summaries, prominent registration, readable queue cards.
9. Reusable components: `src/reception/components.tsx`.
10. Interaction notes: review toolbar link.
11. Open decisions: review notes, below interaction documentation.

## Fictional demonstration data

Every name contains Example; IDs start with DEMO and do not define the hospital's
patient-ID convention. The illustrative date is 18 Jun 2026 and the sample
check-in time is 08:45. These are not current hospital data or operating hours.

Initial counters: 6 appointments (3 queue appointments and 3 upcoming, including
one cancelled example), 2 checked in (including one waiting), 1 waiting for
service, 4 completed registrations today. Registrations today is an independent
illustrative daily counter, not the count of incomplete queue registrations.
The queue and upcoming appointment lists intentionally do not duplicate records.
The no-appointments state empties the upcoming list; already represented
appointment visits remain in the queue.

## Interactions and scope

- Register Patient and Complete Registration open duplicate-prevention guidance.
  Find Existing Patient opens the directory concept; continuing registration
  opens the registration concept. No form or patient record is created.
- Names alone are never presented as definitive identity matching.
- Search combines with status filters and matches demo identifiers, fictional
  names, or appointment references. Clear search & filters restores all entries.
- Expected records offer Check In; registration-required records offer Complete
  Registration; attention records offer View Patient (administrative preview);
  checked-in and waiting records offer Open Queue.
- Confirm demo check-in changes Expected → Checked In, adds the sample time,
  adjusts checked-in counts, and creates a local demonstration activity. The
  confirmation explicitly says no real record was saved.
- Check-in never advances clinical status or assigns queue priority.
- Cancelled appointments never offer check-in.
- Appointment summary focuses the upcoming section; checked-in and waiting
  summaries filter the queue. Other links open authorized module concepts.
- The activity feed is illustrative and is not a formal audit log.
- State selection, role review, navigation, and access-change simulation are
  prototype-only controls. Real staff cannot self-elevate permissions.
- Permission revocation removes the dashboard and operational links; dialogs
  and patient content unmount. Session expiry hides patient data and links to
  the existing authentication page.
- Data changes exist only in component memory. Unmount/reload resets them.

## Open hospital decisions and backend dependencies

Approve patient identifiers, identity matching fields, duplicate detection and
merging, permitted demographic visibility, staff assignments, search scope,
check-in authority, queue/service routing, reception status meanings and
transitions, cancellation/missed rules, priority and emergency procedures,
summary definitions, activity visibility, departments, visit types, and hours.

Confirm server time/timezone, authorization checks on every record/action,
session expiry, permission refresh, retrieval/retry behavior, formal audit
logging, and eventual data persistence. Client visibility is not security.
No clinical records, results, prescriptions, tariffs, or financial reports are
displayed. Do not proceed automatically to Prompt 18.
