# GitHub and LinkedIn OAuth (backend)

Both providers use the shared OAuth pipeline (`OAuthStateService`, `OAuthLoginCompletionService`, `user_identities`). **No frontend** is included in this scope.

## Cost

| Provider | Sign-in / OAuth |
|----------|-----------------|
| GitHub | Free ([OAuth App](https://docs.github.com/en/apps/oauth-apps)) |
| LinkedIn | Free ([Sign In with LinkedIn using OpenID Connect](https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/sign-in-with-linkedin-v2)) |

## Environment variables

| Variable | Maps to | Description |
|----------|---------|-------------|
| `GITHUB_CLIENT_ID` | `app.auth.github.client-id` | GitHub OAuth App Client ID |
| `GITHUB_CLIENT_SECRET` | `app.auth.github.client-secret` | GitHub OAuth App Client Secret |
| `GITHUB_REDIRECT_URIS` | `app.auth.github.redirect-uris` | Callback URL(s) allowlisted in code (comma-separated) |
| `LINKEDIN_CLIENT_ID` | `app.auth.linkedin.client-id` | LinkedIn app Client ID |
| `LINKEDIN_CLIENT_SECRET` | `app.auth.linkedin.client-secret` | LinkedIn app Client Secret |
| `LINKEDIN_REDIRECT_URIS` | `app.auth.linkedin.redirect-uris` | Authorized redirect URL(s) |

Shared OAuth settings (`OAUTH_STATE_SECRET`, `OAUTH_REQUIRE_SIGNED_STATE`, `OAUTH_REQUIRE_EMAIL_VERIFIED`) apply the same as for Google — see `application.yml` under `app.auth.oauth`.

---

## Obtaining GitHub variables

Official guide: [Creating an OAuth app](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app)

### Prerequisites

- Any GitHub account (personal is fine for development).

### Step 1 — Create an OAuth App

1. Sign in to [GitHub](https://github.com).
2. Profile picture (top right) → **Settings**.
3. Left sidebar (bottom): **Developer settings**.
4. **OAuth Apps** → **New OAuth App**.

If you see “Register a new application” instead, you have no apps yet — use that button.

### Step 2 — Register the application

| Field | Example | Notes |
|-------|---------|--------|
| **Application name** | `UniVoyage Dev` | Shown to users on the consent screen |
| **Homepage URL** | `http://localhost:5173` | Your SPA origin (prod: `https://your-domain.com`) |
| **Application description** | optional | |
| **Authorization callback URL** | `http://localhost:5173/auth/github/callback` | **Must match `GITHUB_REDIRECT_URIS` exactly** |

> **Important:** A classic GitHub OAuth App supports **only one** callback URL. For multiple environments (dev + staging + prod), create separate OAuth Apps or use one callback URL per deployment.

Click **Register application**.

### Step 3 — Copy Client ID and generate Client Secret

On the app settings page:

1. **Client ID** → copy to **`GITHUB_CLIENT_ID`**.
2. Click **Generate a new client secret**.
3. Copy the secret immediately → **`GITHUB_CLIENT_SECRET`**.  
   GitHub will **not** show it again.

### Step 4 — Set `GITHUB_REDIRECT_URIS`

Must be the same URL as **Authorization callback URL** in GitHub (character-for-character: scheme, host, port, path, no trailing slash unless you use it everywhere):

```env
GITHUB_CLIENT_ID=Iv1.xxxxxxxxxxxx
GITHUB_CLIENT_SECRET=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
GITHUB_REDIRECT_URIS=http://localhost:5173/auth/github/callback
```

Production example:

```env
GITHUB_REDIRECT_URIS=https://app.univoyage.com/auth/github/callback
```

### How UniVoyage uses it

1. Browser opens `GET /api/auth/github` → redirect to GitHub.
2. GitHub redirects to **SPA** `…/auth/github/callback?code=…&state=…`.
3. SPA `POST`s `{ "code", "state" }` to `/api/auth/github/callback`.

The callback URL you register at GitHub is the **SPA route**, not `/api/auth/github/callback`.

### GitHub checklist

| # | Item |
|---|------|
| 1 | OAuth App created under Developer settings |
| 2 | Authorization callback URL = `GITHUB_REDIRECT_URIS` |
| 3 | Client ID + secret in `.env` (secret not in git) |
| 4 | Scopes are requested by the backend (`read:user user:email`) — no extra portal step |

---

## Obtaining LinkedIn variables

Official guide: [Sign In with LinkedIn using OpenID Connect](https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/sign-in-with-linkedin-v2)

### Prerequisites

- [LinkedIn Developer](https://www.linkedin.com/developers/) account.
- A LinkedIn **app** with the **Sign In with LinkedIn using OpenID Connect** product enabled.

### Step 1 — Create an app (if needed)

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/) → **My apps**.
2. **Create app** → fill company/page details (LinkedIn requires an associated LinkedIn Page for new apps).
3. Complete app verification steps LinkedIn shows in the portal.

### Step 2 — Enable “Sign In with LinkedIn using OpenID Connect”

1. Open your app → **Products** tab.
2. Find **Sign In with LinkedIn using OpenID Connect**.
3. Click **Request access** / **Add product** and wait until status is **Approved** (often instant for OIDC; can take longer for new apps).

Without this product, token/userinfo calls for `openid profile email` will fail.

### Step 3 — Configure OAuth 2.0 redirect URLs

1. Open the app → **Auth** tab (or **Settings** → **Auth** depending on UI).
2. Under **OAuth 2.0 settings**:
   - Note **Client ID** → **`LINKEDIN_CLIENT_ID`**
   - Show / copy **Client Secret** → **`LINKEDIN_CLIENT_SECRET`**
3. **Authorized redirect URLs for your app** — add the SPA callback, e.g.  
   `http://localhost:5173/auth/linkedin/callback`  
   (production: `https://app.univoyage.com/auth/linkedin/callback`)

Must match **`LINKEDIN_REDIRECT_URIS`** exactly.

### Step 4 — Set environment variables

```env
LINKEDIN_CLIENT_ID=86xxxxxxxx
LINKEDIN_CLIENT_SECRET=xxxxxxxxxxxxxxxx
LINKEDIN_REDIRECT_URIS=http://localhost:5173/auth/linkedin/callback
```

### Step 5 — Verify scopes (informational)

UniVoyage backend requests: `openid profile email` (see `LinkedInOAuthService`). These are standard for the OIDC product; you do not configure them per-field in the portal for basic sign-in.

### How UniVoyage uses it

Same pattern as GitHub:

1. `GET /api/auth/linkedin` → LinkedIn authorize.
2. Redirect to SPA `…/auth/linkedin/callback?code=…&state=…`.
3. SPA `POST`s to `/api/auth/linkedin/callback`.

### LinkedIn checklist

| # | Item |
|---|------|
| 1 | App created on LinkedIn Developers |
| 2 | Product **Sign In with LinkedIn using OpenID Connect** enabled |
| 3 | Authorized redirect URL = `LINKEDIN_REDIRECT_URIS` |
| 4 | Client ID + secret in `.env` |
| 5 | Secret not committed to git |

---

## Development vs production setup

Use **separate OAuth registrations per environment** where the provider only allows one callback URL (GitHub OAuth App) or where you want isolated secrets.

### Summary

| Item | Development | Production |
|------|-------------|------------|
| GitHub OAuth App | `UniVoyage Dev` (own app) | `UniVoyage` (own app) |
| GitHub callback | `http://localhost:5173/auth/github/callback` | `https://<your-domain>/auth/github/callback` |
| LinkedIn app | Dev app or same app with both redirect URLs | Prod app (or same app + both URLs in Auth tab) |
| LinkedIn callback | `http://localhost:5173/auth/linkedin/callback` | `https://<your-domain>/auth/linkedin/callback` |
| Secrets storage | `backend/.env` (gitignored) | CI / hosting secrets (Railway, etc.) |
| `OAUTH_STATE_SECRET` | Can default to `JWT_SECRET` locally | **Dedicated** secret, stable across deploys |
| `OAUTH_REQUIRE_SIGNED_STATE` | `true` in tests; can be `false` locally | **`true`** |
| `COOKIE_SECURE` | `false` | **`true`** |
| `COOKIE_SAMESITE` | `Lax` | `Lax` (or `None` only if cross-site + HTTPS) |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173` | Production SPA origin(s) |

### Development checklist

1. **GitHub:** Create OAuth App “UniVoyage Dev” → callback `http://localhost:5173/auth/github/callback`.
2. **LinkedIn:** App with product **Sign In with LinkedIn using OpenID Connect** → add redirect `http://localhost:5173/auth/linkedin/callback`.
3. Copy credentials into `backend/.env` (see below).
4. Run SPA on `http://localhost:5173` (Vite default) so redirect URIs match.
5. Backend on `http://localhost:8080` (or your port); frontend proxies `/api` or uses configured `BASE_URL`.
6. Ensure `JWT_SECRET` is set (required for OAuth state when `OAUTH_STATE_SECRET` is unset).

### Production checklist

1. **GitHub:** Separate production OAuth App → callback `https://<your-domain>/auth/github/callback` (HTTPS, exact path).
2. **LinkedIn:** Add production redirect URL on the same or a dedicated LinkedIn app.
3. Set all secrets in the deployment platform — **never** commit production secrets.
4. Env vars on the backend service:

```env
GITHUB_CLIENT_ID=<prod-github-client-id>
GITHUB_CLIENT_SECRET=<prod-github-secret>
GITHUB_REDIRECT_URIS=https://app.example.com/auth/github/callback

LINKEDIN_CLIENT_ID=<prod-linkedin-client-id>
LINKEDIN_CLIENT_SECRET=<prod-linkedin-secret>
LINKEDIN_REDIRECT_URIS=https://app.example.com/auth/linkedin/callback

JWT_SECRET=<long-random-secret>
OAUTH_STATE_SECRET=<long-random-secret-or-same-as-jwt>
OAUTH_REQUIRE_SIGNED_STATE=true
OAUTH_REQUIRE_EMAIL_VERIFIED=true

COOKIE_SECURE=true
COOKIE_SAMESITE=Lax
CORS_ALLOWED_ORIGINS=https://app.example.com
```

5. Deploy **frontend** and **backend** with the same public domain or correct CORS + cookie domain alignment.
6. After deploy: smoke-test `GET /api/auth/github` and `GET /api/auth/linkedin` (302 to provider), then full login from the SPA.

### Provider portal: what to register where

| Registered at provider (SPA URL) | Backend env variable |
|----------------------------------|----------------------|
| GitHub → Authorization callback URL | `GITHUB_REDIRECT_URIS` |
| LinkedIn → Authorized redirect URLs | `LINKEDIN_REDIRECT_URIS` |

The backend allowlist (`*_REDIRECT_URIS`) must list the **same** URL the browser lands on after provider redirect. Signed OAuth `state` embeds that URI when `OAUTH_REQUIRE_SIGNED_STATE=true`.

### Local `.env` example (development)

```env
# GitHub OAuth App — Developer settings → OAuth Apps → UniVoyage Dev
GITHUB_CLIENT_ID=Iv1.a1b2c3d4e5f6g7h8
GITHUB_CLIENT_SECRET=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
GITHUB_REDIRECT_URIS=http://localhost:5173/auth/github/callback

# LinkedIn — Developers → My apps → Auth
LINKEDIN_CLIENT_ID=86abcdef12
LINKEDIN_CLIENT_SECRET=WPL_AP1.xxxxxxxxxxxxxxxx
LINKEDIN_REDIRECT_URIS=http://localhost:5173/auth/linkedin/callback

# Shared (recommended for local dev)
JWT_SECRET=your-local-jwt-secret-at-least-32-chars
OAUTH_STATE_SECRET=${JWT_SECRET}
OAUTH_REQUIRE_SIGNED_STATE=true
OAUTH_REQUIRE_EMAIL_VERIFIED=true

COOKIE_SECURE=false
COOKIE_SAMESITE=Lax
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

### Notes

- **GitHub:** one callback URL per OAuth App → use two apps (dev + prod) or different deployments.
- **LinkedIn:** multiple redirect URLs are usually allowed on one app; still use separate secrets per environment if you use separate apps.
- Empty `GITHUB_CLIENT_ID` / `LINKEDIN_CLIENT_ID` → authorize endpoints throw at runtime; providers are optional until configured.
- Frontend OAuth callback pages (`/auth/github/callback`, `/auth/linkedin/callback`) are required for end-to-end login but are outside this backend-only scope.

---

## API (backend)

| Method | Path |
|--------|------|
| `GET` | `/api/auth/github` |
| `POST` | `/api/auth/github/callback` — `{ "code", "state" }` |
| `GET` | `/api/auth/linkedin` |
| `POST` | `/api/auth/linkedin/callback` — `{ "code", "state" }` |

Routes are public in `SecurityConfiguration` (`permitAll` for `/api/auth/github/**` and `/api/auth/linkedin/**`).

---

## Provider behaviour (reference)

### GitHub

- Scopes: `read:user user:email`
- Stable subject: GitHub numeric user `id` (stringified)
- Email may be **hidden** on `/user`; resolved via `/user/emails` (primary + verified, else any verified)
- Returning users without email in the API response can still log in if a `user_identities` row exists
- No duplicate `user_identities` for the same `(github, subject)`

### LinkedIn

- Scopes: `openid profile email`
- Stable subject: OIDC `sub` from `https://api.linkedin.com/v2/userinfo`
- `email` and `email_verified` may be absent on some responses ([docs](https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/sign-in-with-linkedin-v2))
- `email_verified` may be boolean or string `"true"`
- Name may appear as `given_name`/`family_name` or only `name` (split on first space)
- Missing or unverified email follows `app.auth.oauth.require-email-verified` (same as Google)

---

## Troubleshooting

| Symptom | Likely cause |
|---------|----------------|
| `redirect_uri` mismatch (GitHub) | Callback URL in OAuth App ≠ `GITHUB_REDIRECT_URIS`; typo, port, or `http` vs `https` |
| `redirect_uri` mismatch (LinkedIn) | URL not listed under Authorized redirect URLs |
| `bad_verification_code` / invalid code | Code already used (one-time), expired, or wrong client secret |
| GitHub: no email / 401 | User hid email and `/user/emails` has no verified address; first login requires a reachable email |
| LinkedIn: 401 no email | Userinfo omitted `email`; first login cannot proceed without email |
| LinkedIn: unauthorized / invalid scope | OIDC product not added to the app |
| `Invalid or expired OAuth state` | `OAUTH_STATE_SECRET` changed between authorize and callback, or tampered `state` |
| Works locally, fails in prod | Separate OAuth apps or update callback URLs and env for production domain |
