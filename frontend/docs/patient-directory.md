# 04 — Reception & Patient Operations
## Prompt 19 — Patient Directory

Entry: `/staff/reception/module/directory`. The sidebar, Reception Dashboard's
Find Patient action, and authorized global destination search open this same
directory inside the existing shared shell. Register Patient and Register New
Patient open Prompt 18's existing-patient check, never a second form.

This is a frontend design prototype with fixed fictional fixtures, not backend
search, live counts, approved identity policy, or newly created Figma canvas frames.
No complete Patient Profile, Appointment Management, or Queue Management is built.

## Design review organization

1. Desktop Default: entry route, shell Content state = Ready.
2. Search Results: search `Hana`, `DEMO-EX-101`, or dummy phone `0000000101`.
3. Filters Applied: Filters → registration start/end dates → Apply Filters.
4. Sorting and Pagination: sortable ID/name/date headers, pages 1–3, row size.
5. No Search Results: search an unmatched value or select No search matches.
6. Empty Dataset: Content state = Empty dataset.
7. Loading: Content state = Loading, or submit a search.
8. Error: Content state = Network error; Retry preserves terms and filters.
9. Permission Restricted: Content state = Access restricted or simulated revocation.
10. Tablet: 768px structured two-column patient cards, explicit sort selector.
11. Mobile: 390px single-column cards and bottom filter sheet.
12. Reusable Components: `src/patient-directory/components.tsx`.
13. Interaction Flow: page's expandable notes and the contract below.
14. Open Decisions: page notes and backend requirements below.

## Shared structure and content

The directory reuses ORHIMS primitives, semantic palette, fonts, SVG icons,
native-dialog focus/Escape behavior, registration identity fixtures, and
permission-denied states. One additional line filter icon extends the existing
icon library. The shared dialog accepts an optional class for the mobile sheet;
existing dialogs retain their behavior.

`DirectoryPatient` extends Prompt 18's `PatientMatch`. Its three existing examples
retain the same name, ID, masked phone, birth information, and sample locality.
Twenty additional clearly fictional records demonstrate pagination (23 total).
Every name contains Example, every ID begins DEMO-EX, and all dates are sample
values. Dummy phone tokens are not real contact numbers or a hospital format.
Known dates, unknown birth information, estimated ages, missing contacts, similar
names, and a long name are intentionally represented.

Columns: patient ID, patient name, age/date of birth, masked phone, registration
date, and View Patient. Birth dates are not converted into guessed ages; estimated
ages explicitly use the illustrative 18 Jun 2026 reference date.

Record status and sex/classification columns are omitted because no approved
permanent demographic status/category model exists. Queue waiting, appointment
status, clinical encounters, and departments are never patient-record statuses
or filters. No clinical details, delete, merge, or unsupported correction actions
are exposed.

## Search, filters, sort, and pagination contract

- Search is deliberate: Search button or Enter. Typing does not search on every
  keystroke. A pending-text message distinguishes edited input from applied results.
- Field scope can be all approved example fields, ID, name, or phone. Example
  matching is case-insensitive substring matching. Phone lookup strips simple
  formatting characters and searches dummy tokens; displayed contacts stay masked.
- Global search remains the existing authorized destination-search preview.
  Directory search is clearly labeled as focused patient lookup.
- Search and Clear Search retain active date filters. Search scopes do not alter
  filters. Filter application/removal retains the submitted query.
- Only inclusive registration start/end date bounds are provided. Pending panel
  edits are not applied until Apply Filters. Cancel discards only filter-panel
  edits; Reset dates changes pending dates. The end cannot precede the start.
- Individual chips remove only their boundary. Clear all filters removes both
  dates, never the query. The count represents active date boundaries.
- Search, filter changes, sorting, and row-size changes reset to page 1.
- Default order: registration date descending, patient ID ascending as a stable
  tie-breaker. Only ID, name, and registration date are sortable. Sorting is
  explicit through accessible table buttons or the responsive sort selector.
- Default size: 10 rows, with 5/10/20 choices. This is a design decision, not a
  hospital policy. Previous/next are disabled at boundaries; range and totals
  are explicitly labeled sample records.
- Query, filters, sorting, and size survive recoverable request errors. Retry
  restores the demonstration with the same configuration.
- Loading replaces rows and numeric counts with skeletons/loading labels.
- No matching results is different from an empty dataset and service failure.
  Clear Search, Adjust Filters, and permitted registration are available.
- View Patient opens the selected record's identity preview, with the same ID,
  name, birth context, masked contact, registration date, and sample residence.
  Closing returns to the current directory results. The full profile is not built.
- Similar names and shared phones never confirm identity. The registration entry
  reiterates checking spellings/identifiers and reuses Prompt 18's unfiltered
  existing-patient search before any new record preview.

The brief requests a foundation for large datasets; the sample is intentionally
small and its known total comes only from the local fixture array. A future API
without a total must omit totals/numbered pages and use server cursor availability.
No hospital totals are invented.

## Permissions, accessibility, and recovery

Directory access requires the configured directory grant. Registration actions
require a separate registration grant. Unauthorized direct opens use the existing
Access restricted page. Permission revocation/session expiry unmount the directory
and any identifying modal content. Actual record/field scope must be enforced
independently by the server.

Rows are not clickable; View Patient is the predictable primary button. Sortable
headers use `aria-sort` and explicit accessible names. Counts have a polite
announcement region. Inputs have persistent labels, clear focus states, and
associated help/errors. Modal filters restore focus, trap keyboard navigation
natively, and close on Escape. Mobile rows expose all important identifying
fields without horizontal table scrolling.

All state is memory-only. Module navigation/unmount resets query/filter state.
No query is logged, placed in a URL, persisted to local storage, or transmitted.
New memory-only registration success examples do not populate a persistent
directory. No offline cache or automatic synchronization is claimed.

## Open hospital and backend decisions

Approve identity attributes, patient-ID format, masking/phone-search policy,
field-level and record-level permissions, registration date/calendar/timezone
rules, multilingual collation, category/status necessity, correction authority,
duplicate investigation workflow, and restricted merging/removal policies.

The backend must authorize queries and opens, apply scope before computing
counts, validate filters, support stable sort and pagination/cursors, handle
errors and retry limits, and define permission/session refresh behavior.
Do not implement clinical prioritization as demographic directory ordering.
Stop at Prompt 19.
