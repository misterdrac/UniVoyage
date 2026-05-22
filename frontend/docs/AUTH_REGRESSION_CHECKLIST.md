# Auth regression checklist

Use this document for manual QA and to understand what the Vitest **auth regression matrix** covers in CI.

## Automated (Vitest)

From `frontend/`:

```bash
npm run test:run
# OAuth-only smoke:
npm run test:e2e
# Matrix (OAuth providers, OTP, reset, verify URL hygiene):
npm run test:auth-matrix
```

| Area | Cases |
|------|--------|
| OAuth | `google`, `github`, `linkedin` — happy (code+state) and `access_denied` |
| URL hygiene | `code`, `state`, `token` removed from the address bar after the page consumes them |
| Email OTP | Request failure and verify failure — no OTP/refresh keys in `localStorage` |
| Password reset | Token read from URL, then bar cleared |
| Email verify | Token read from URL, then bar cleared |

## Manual checklist

### After redirect (OAuth / email links)

- [ ] Address bar has **no** `code`, `state`, `token`, `access_token`, or `refresh_token` once the callback/verify/reset screen finishes loading.
- [ ] Browser back does not re-submit a one-time code or reset token (URL was `replace`d).

### Keyboard

- [ ] Login dialog: Tab order reaches password toggle, submit, “Email me a sign-in code”, OAuth buttons.
- [ ] OTP (login + admin 2FA): paste full code; Backspace moves to previous box; arrows move between digits.
- [ ] Admin 2FA: first digit receives focus when the code step appears.

### Screen readers

- [ ] Login errors use `role="alert"`.
- [ ] Success/error toasts are duplicated to `#auth-live-announcer` (polite live region).
- [ ] OTP status/errors use `role="alert"` when destructive.

### Secrets (DevTools)

- [ ] No OTP, reset token, or refresh token in `console.log` / `console.debug` (auth paths use `safeAuthError` with redaction).
- [ ] `localStorage`: only reviewed keys — `authToken`, `user` (see `tokenStoragePolicy.ts`). **Not** OTP or refresh tokens.
- [ ] `sessionStorage`: `oauth_return_url` (transient) and `admin_2fa_verified_*` flags only — no raw codes.
- [ ] No auth secrets sent to analytics (none configured on auth routes today).

### Lighthouse / a11y audit (optional)

On `/` with login dialog open (`?login=1`):

```bash
npx lighthouse http://localhost:5173/?login=1 --only-categories=accessibility --chrome-flags="--headless"
```

Target: accessibility score ≥ 90; fix contrast on `text-muted-foreground` errors if flagged.

## Environment variables

See `frontend/env.example` (client) and `backend/env.example` (OAuth secrets + redirect allowlist).

| Variable | Where | Purpose |
|----------|--------|---------|
| `VITE_API_URL` | Frontend | API base (dev proxy often `/api`) |
| `GOOGLE_CLIENT_ID` / `GITHUB_*` / `LINKEDIN_*` | Backend | OAuth client credentials (never in frontend) |
| `GOOGLE_REDIRECT_URI` / `*_REDIRECT_*` | Backend | Must match provider console and route `/auth/{provider}/callback` |
| `APP_FRONTEND_RESET_URL` | Backend | Email link base → `/auth/reset-password` |
| `APP_FRONTEND_VERIFY_URL` | Backend | Email link base → `/auth/verify-email` |

Public OAuth **client IDs** are not required in the SPA; the browser only hits backend `begin` URLs.

## Content Security Policy (auth)

The SPA is built with Vite (no inline auth scripts). If you add CSP headers at the edge:

- Allow `connect-src` to your API origin.
- OAuth popups need `window.opener` postMessage — avoid `Cross-Origin-Opener-Policy: same-origin` on the callback page unless you test popups.
- Do not add `'unsafe-inline'` for scripts unless a provider widget requires it; prefer nonce/hash for any future inline snippets.

## Known client storage design

JWT in `localStorage` (`authToken`) is intentional for this app but XSS-sensitive. HttpOnly cookies are also set when the API returns them. Document any change to storage in this file and in `tokenStoragePolicy.ts`.
