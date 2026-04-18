# Member Login Page Notes

Last Updated: 2026-04-18

## Scope

- Page: `login.html`
- Purpose: Unified authentication entry page (`/api/member-auth/login`) for both paid members and free/preferred customers, with a ColorBends background and glass-style panel.

## Recent Update (2026-04-18) - Text Field Intro Animation Stability (Autofocus Interference Fix)

- Removed immediate/auto-delayed focus handoff that was colliding with login intro reveal motion.
- Kept intro scheduler and BFCache replay behavior intact.
- Result:
  - username/password fields now preserve their intended reveal presentation
  - login panel no longer shows a premature focus state while intro animation is still resolving.

### Files Affected

- `login.html`
- `Claude_Notes/member-login-page.md`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`

### Validation

- Visual check captured from `http://localhost:3000/login.html` after intro timing:
  - fields render in neutral state without premature focus styling.

## Recent Update (2026-04-16) - ColorBends Background Race Fix After Intro Timing Change

- Fixed background regression introduced by earlier intro scheduling hardening:
  - root cause: `runLoginIntroAnimation()` can execute before module script registers `window.startColorBendsIntro`
  - result before fix: shader intro uniforms stayed at pre-intro state on some loads.
- Added pending-intro handshake:
  - if ColorBends intro function is not ready, login intro now sets `window.__loginPendingColorBendsIntro = true`
  - module init consumes the pending flag and immediately starts ColorBends intro once registered.
- Result:
  - background animation behavior is restored while keeping single-pass login intro scheduling.

### Files Affected

- `login.html`
- `Claude_Notes/member-login-page.md`

### Validation

- Parsed plain inline scripts successfully in `login.html` (`2` blocks).

## Recent Update (2026-04-16) - Startup Intro Hiccup Fix (Store -> Login Flow)

- Fixed login intro animation jitter seen after redirecting from `store.html`:
  - removed delayed intro trigger (`setTimeout` path)
  - added one-shot intro scheduler to prevent duplicate execution on normal first load
  - limited `pageshow` intro rerun to BFCache restores only (`event.persisted === true`).
- Result:
  - login panel no longer appears, disappears, then replays intro on normal navigation
  - first-load transition is now single-pass and stable.

### Files Affected

- `login.html`
- `Claude_Notes/member-login-page.md`

### Validation

- Parsed plain inline scripts successfully in `login.html` (`2` blocks).

## Recent Update (2026-04-16) - Preferred Registration Link Added Under Login Panel

- Added a new inline CTA row directly below the login card:
  - copy: `Don't have an account? Register as a Preferred Account`
  - link target: `/store-register.html`.
- Added runtime URL handling to preserve valid store attribution when present:
  - reads `?store=` from `login.html`
  - normalizes aliases and unattributed codes through existing store-code normalization
  - appends normalized `store` to the preferred registration URL.

### Files Affected

- `login.html`
- `Claude_Notes/member-login-page.md`

### Validation

- Parsed plain inline scripts successfully in `login.html` (`2` blocks).

## Recent Update (2026-04-16) - Member Password Setup UI Restyled to Store/Register Theme

- Updated `password-setup.html` from the legacy dark/glass panel to the newer white store/register style language.
- Kept all existing setup behavior unchanged:
  - token validation endpoint
  - setup-link recovery redirect handling
  - free-account redirect to `store-password-setup.html`
  - password submission flow to `/api/member-auth/setup-password`.
- Visual alignment updates:
  - Inter typography, white page shell, neutral gray fields, blue primary CTA.

### Files Affected

- `password-setup.html`
- `Claude_Notes/member-login-page.md`

### Validation

- Inline script parse check passed for `password-setup.html`.

## Recent Update (2026-04-07) - Member + Free Account Merge

- Removed split behavior that previously blocked free/preferred accounts on `login.html`.
- Login now accepts both account audiences and routes by account type after auth:
  - paid/member -> `/index.html`
  - free/preferred -> `/store-dashboard.html` (store code retained when available).
- Added store-code alias normalization in login redirect routing (`CHG-7X42` to `CHG-ZERO`) for legacy referral links.
- `store-login.html` is now a compatibility redirect to `/login.html` (with `?store=` pass-through).
- Storefront shared helper now points free-login links to the unified login route.

## Recent Update (2026-04-07) - Login CTA Loading State

- Added an inline spinner animation to the `Login` button.
- Busy state now shows `Logging In...` beside the spinner while the login request is processing.
- Updated busy handler to set `aria-busy` and wait cursor for clearer feedback/accessibility.

## Latest State

| Area | Current Implementation |
| --- | --- |
| Theme direction | Dark / black background |
| Background engine | Three.js ColorBends shader |
| Dependency | `three` installed via npm; imported from `/node_modules/three/build/three.module.js` |
| Customization | `colorBendsConfig` object in `login.html` |
| Pointer interaction | Global `window` pointer listeners |
| Mobile aspect behavior | Portrait-safe shader aspect mapping to prevent squeezed background |
| Mobile viewport sync | Background host is viewport-fixed; shader resizes via `visualViewport` listeners |
| Resize policy | Shader space locked to fixed `1920x1080`; canvas displayed via `object-fit: cover` |
| Brand asset | `/brand_assets/Logos/L&D White Icon.png` |
| Heading behavior | Rotating inspirational phrases every `4200ms` |
| Heading fonts | `font-body` (Inter), `font-alt` (Space Grotesk), `font-display` |
| Heading stability | Fixed heading row height + no-wrap phrase rendering to prevent panel shifts |
| CTA copy | `Login` (`Logging In...` while busy) |
| CTA loading indicator | Spinner + label swap during async auth submit |
| Login audience | Unified for paid member + free/preferred accounts |
| Post-auth routing | Paid -> `/index.html`; Free -> `/store-dashboard.html` |
| Auth source panel | Removed |
| Panel stability | Reserved error slot (`min-h-[4.25rem]`) prevents height snapping when error text appears |
| Panel palette | Cyan/ice accents (purple panel accents removed) |
| Button glow | Removed for flatter glassmorphism tone |
| CTA button style | Solid white button with dark text, white hover/focus treatment |
| Label color | `Username or Email` and `Password` labels set to pure white |
| Input palette | Inputs use translucent glass fill with soft frosted borders and themed placeholders |
| Placeholder tone | Placeholder text updated to grayish-white (`text-white/60`) |
| Footer legal copy | Bottom-center legal text with underlined links for Terms and Privacy, plus copyright line |
| Subtitle color | `Sign in to access your dashboard` set to pure white |
| Load-in motion | Apple-style first-load blur/fade for page, then staggered upward blur/fade reveal for panel elements and footer |

## Active ColorBends Config

- `rotation: 0`
- `speed: 0.15`
- `colors: ["#ff0000", "#00ff00", "#0000ff"]`
- `transparent: true`
- `autoRotate: 0.3`
- `scale: 1.8`
- `frequency: 1`
- `warpStrength: 1`
- `mouseInfluence: 0.1`
- `parallax: 0.1`
- `noise: 0.05`

## Changes Made In This Session

- Swapped panel logo to the L&D white icon asset.
- Replaced static `Member Login` heading with rotating inspirational phrases.
- Added heading font variation across phrases.
- Shortened long phrase to `Next Level Starts Now.` and fixed heading row height to prevent resizing on rotation.
- Corrected `Username or Email` label capitalization.
- Changed button copy from `Sign In` to `Login`.
- Removed auth-source info block from the panel.
- Reserved error message layout space so panel height stays stable when errors appear/disappear.
- Recolored panel accents from purple to cyan/ice and removed login button glow styling.
- Recolored input fields to match panel glass palette and removed out-of-place dark/purple bias.
- Updated the `Login` CTA to a solid white button for a cleaner contrast against the glass panel.
- Updated static field labels (`Username or Email`, `Password`) to pure white as requested.
- Updated input placeholders to a grayish-white tone for better visual consistency on the glass panel.
- Added bottom-centered legal footer text with underlined, hyperlinked `Terms of Service` and `Privacy Policy`, plus `© 2026 LD Premiere`.
- Updated subtitle copy `Sign in to access your dashboard` to pure white.
- Added a loading spinner animation to the `Login` CTA and connected it to auth busy-state handling.
- Added first-load entrance motion: page-level blur/fade in, followed by staggered upward blur/fade reveals for card, header block, form, and footer.
- Added `prefers-reduced-motion` fallback so entrance animations are disabled when reduced motion is requested.
- Refined intro implementation to be JS-triggered (`intro-run` class) so the entrance animation reliably plays on full page load and BFCache restore.
- Added black-screen-first background reveal: ColorBends host now fades from black to full background when panel intro begins.
- Added intro-time ColorBends uniform interpolation so shader parameters smoothly ramp to final values (`speed`, `scale`, `frequency`, `warpStrength`, `mouseInfluence`, `parallax`, `noise`, `autoRotate`).
- Increased intro start scale to `5` so the background begins heavily zoomed and then settles back to the configured resting scale during the animation.
- Synced ColorBends parameter intro start to the same runtime trigger as panel intro (`window.startColorBendsIntro`) so scale animation starts exactly when the panel sequence begins.

## Files Affected

- `login.html`
- `store-login.html`
- `storefront-shared.js`
- `store-dashboard.html`
- `store-password-setup.html`
- `password-setup.html`
- `Claude_Notes/member-login-page.md`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`

## Validation

- Inline script parse check passed for `login.html`.
- `node --check storefront-shared.js` passed.
- No screenshots captured for this pass per user instruction.

## Update (2026-04-15) - No-Attribution Store Query Handling

### Changes
- Added guard in login path to treat `REGISTRATIONLOCKED`/`REGISTRATION-LOCKED` as no-attribution.
- Unified login redirect bridge (`store-login.html`) now drops these values instead of forwarding them to `login.html`.

### Result
- Cleaner login URLs for no-attribution traffic.
- Default no-attribution path works with no `?store=` query.

