# 03 — Staff Authentication

Implemented as React design previews, not Figma canvas frames. No Figma file or separate ORHIMS component catalog was supplied. The existing hospital brand mark, navy/teal semantic variables, Manrope/Inter wiring, button styling, radius, and Icon component are reused.

## A. Primary Desktop Login
`/staff/sign-in` — primary presentation, designed for 1440 × 900 and 1280 laptop viewports. `/` opens the same design for preview. Public hospital pages remain at their existing routes.

## B. Form Interaction States
`/staff/authentication/states` — select Default, Focused input, Password visible, or Required fields. Focus is real keyboard focus, not a painted approximation. There are no preset credentials.

## C. Authentication Error and Loading States
Select Authentication failure or Loading. Error copy is non-enumerating. Loading disables the form and actions without a full-screen overlay. Primary submission reports that authentication is not connected; it never sends credentials.

## D. Password Recovery
Forgot password opens a recovery panel. Primary recovery reports an unavailable service. Only the explicitly labeled state preview demonstrates generic confirmation; no delivery is claimed.

## E. Session and Access States
Select Session expired or Access restricted. Both provide a return to sign-in; neither exposes protected information.

## F. Responsive Variants
1440 and 1280 use two regions. 768 replaces the identity area with a compact brand header. 390 uses a single-column form, full-width action, and unchanged comfortable input targets. Secondary artwork is removed.

## G. Reusable Components and Variants
`src/auth/StaffAuthComponents.tsx`: StaffSignInPanel, StaffIdentifierInput, PasswordInput, InlineValidation, AuthAlert, AuthenticationButton, AuthVariant.

Native accessible elements are the minimal extension because the repository contains no packaged form primitives. New lock and eye icons extend the existing 1.6-stroke icon family. The abstract workflow is CSS geometry composed with existing icons, not a new logo.

## H. Open Decisions
- Identity provider, permitted staff identifiers, and account provisioning.
- Recovery eligibility, delivery channels, and administrator support.
- Password policy, MFA, retry limits, and account lockout.
- Session expiration and role-based backend authorization.
- Shared workstation and remembered-device policy: no remember-device checkbox until approved.
- Approved ORHIMS internal wordmark and any separate product typography/spacing tokens.

This design implements no real authentication, authorization, account recovery, persistent credential storage, or security certification. Credentials are held only in component state, cleared when changing flows, and never logged or transmitted. No dashboard or protected workspace is included.
