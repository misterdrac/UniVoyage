# Security Operations Runbook

> UniVoyage backend — authentication, secrets, monitoring, and incident response.

---

## 1. Key Inventory

| Secret | Env Variable | Storage | Purpose |
|--------|-------------|---------|---------|
| JWT signing key | `JWT_SECRET` | Railway env / local `.env` | Signs all access + refresh tokens |
| OAuth state secret | `OAUTH_STATE_SECRET` | Railway env (defaults to `JWT_SECRET`) | HMAC-signs OAuth `state` parameter |
| Resend API key | `RESEND_API_KEY` | Railway env / local `.env` | Sends transactional email (OTP, reset, verify) |
| Google OAuth client secret | `GOOGLE_CLIENT_SECRET` | Railway env | Google OAuth 2.0 token exchange |
| GitHub OAuth client secret | `GITHUB_CLIENT_SECRET` | Railway env | GitHub OAuth token exchange |
| LinkedIn OAuth client secret | `LINKEDIN_CLIENT_SECRET` | Railway env | LinkedIn OAuth token exchange |
| Database password | `DB_PASSWORD` | Railway env / local `.env` | PostgreSQL authentication |
| Cookie domain | `COOKIE_DOMAIN` | Railway env | Scopes auth cookies to domain |

**Rules:**
- Never commit secrets to git — `.env` is in `.gitignore`
- Use separate keys for dev and production
- Production keys are stored exclusively in Railway environment variables

---

## 2. Provider Dashboards

| Provider | URL | What to check |
|----------|-----|---------------|
| Resend | https://resend.com/emails | Delivery status, bounces, complaints |
| Resend Domains | https://resend.com/domains | DNS verification, DKIM/SPF status |
| Google Cloud Console | https://console.cloud.google.com/apis/credentials | OAuth consent screen, client IDs |
| GitHub Developer Settings | https://github.com/settings/apps | OAuth App credentials, callback URLs |
| LinkedIn Developer Portal | https://www.linkedin.com/developers/apps | OAuth App, authorized redirect URLs |
| Railway | https://railway.app | Backend deployment, env vars, logs |
| Vercel | https://vercel.com | Frontend deployment |

---

## 3. Rotation Procedures

### JWT_SECRET rotation

1. Generate a new 256-bit+ random secret: `openssl rand -base64 64`
2. Set new value in Railway env: `JWT_SECRET=<new-value>`
3. Redeploy backend
4. **Impact:** All existing access and refresh tokens become invalid. Users must re-login.
5. **Rollback:** Revert to old secret in Railway and redeploy.

### RESEND_API_KEY rotation

1. Go to https://resend.com/api-keys → Create new key (Sending access)
2. Update `RESEND_API_KEY` in Railway
3. Redeploy backend
4. Delete the old key in Resend dashboard
5. **Impact:** Brief window (~seconds) where emails may fail during deploy. No user-facing auth disruption.

### OAuth client secret rotation (Google/GitHub/LinkedIn)

1. Go to the respective provider dashboard
2. Generate new client secret
3. Update the corresponding env var in Railway (`GOOGLE_CLIENT_SECRET`, etc.)
4. Redeploy backend
5. Delete/revoke old secret in provider dashboard
6. **Impact:** In-flight OAuth flows using old secret will fail. Users retry and succeed.

### Database password rotation

1. Update password in PostgreSQL
2. Update `DB_PASSWORD` (and `SPRING_DATASOURCE_PASSWORD` if set) in Railway
3. Redeploy backend
4. **Impact:** Connection pool refreshes on restart. Brief downtime during deploy.

---

## 4. Incident Response

### Reading security event logs

Security events are written to `logs/security-events.jsonl` as structured JSON. Each line contains:

```json
{
  "timestamp": "2026-05-19T14:30:00.000Z",
  "eventType": "AUTH_LOGIN_FAILED",
  "result": "FAILURE",
  "userId": null,
  "email": "a***@example.com",
  "ip": "192.168.1.100",
  "method": "password",
  "detail": null
}
```

**Event types:**
- `AUTH_LOGIN_SUCCESS` / `AUTH_LOGIN_FAILED` — Password login
- `AUTH_LOGOUT` — User logout
- `AUTH_OTP_REQUESTED` / `AUTH_OTP_VERIFIED` / `AUTH_OTP_FAILED` — OTP flows
- `AUTH_OAUTH_SUCCESS` / `AUTH_OAUTH_FAILED` — OAuth callbacks
- `AUTH_PASSWORD_RESET_REQUESTED` / `AUTH_PASSWORD_RESET_COMPLETED` — Password reset
- `AUTH_2FA_CHALLENGED` / `AUTH_2FA_VERIFIED` / `AUTH_2FA_FAILED` — Admin 2FA
- `AUTH_RATE_LIMITED` — Any rate limit trigger (429)

### Common attack patterns

| Pattern | Log signature | Response |
|---------|--------------|----------|
| Credential stuffing | Many `AUTH_LOGIN_FAILED` from same IP | Rate limiter blocks at 60/min per IP; monitor for distributed attacks |
| OTP brute force | Many `AUTH_OTP_FAILED` for same email | Challenge locks after 5 wrong attempts for 30min |
| Password reset abuse | Many `AUTH_PASSWORD_RESET_REQUESTED` for same email | Rate limited to 3/15min per email |
| Admin 2FA attack | Many `AUTH_2FA_FAILED` for admin emails | Locks after 5 attempts; CMS audit log records failures |
| OAuth state tampering | `AUTH_OAUTH_FAILED` with "Invalid state" detail | Signed state parameter prevents CSRF |

### Lockout thresholds

| Flow | Lockout trigger | Duration |
|------|----------------|----------|
| Password login (per user) | 5 failed attempts | 15 minutes |
| Password login (per IP) | 60 attempts/minute | Window resets after 1 minute |
| OTP verify (per challenge) | 5 wrong codes | 30 minutes |
| Admin 2FA verify (per IP) | 10 attempts | 15 minute window |
| Admin 2FA challenge (per email) | 3 requests | 15 minute window |

---

## 5. Rate Limit Reference

### Login & Session

| Limiter | Default | Env Override | Scope |
|---------|---------|-------------|-------|
| Login IP | 60 req / 1 min | `app.auth.login.ip-max-attempts`, `ip-window` | Per client IP |
| Refresh IP | 120 req / 1 min | `app.auth.login.refresh-ip-max-attempts` | Per client IP |
| Account lockout | 5 fails / lock 15min | `max-failed-attempts`, `lock-duration` | Per user |

### OTP

| Limiter | Default | Env Override | Scope |
|---------|---------|-------------|-------|
| OTP request (IP) | 15 / 15 min | `OTP_REQUEST_IP_MAX`, `OTP_REQUEST_IP_WINDOW` | Per IP |
| OTP request (email) | 3 / 15 min | `OTP_REQUEST_EMAIL_MAX`, `OTP_REQUEST_EMAIL_WINDOW` | Per email |
| OTP verify (IP) | 20 / 15 min | `OTP_VERIFY_IP_MAX`, `OTP_VERIFY_IP_WINDOW` | Per IP |
| OTP verify (email) | 5 / 15 min | `OTP_VERIFY_EMAIL_MAX`, `OTP_VERIFY_EMAIL_WINDOW` | Per email |
| OTP challenge lock | 5 wrong codes | `OTP_MAX_VERIFY_ATTEMPTS` | Per challenge |

### Password Reset

| Limiter | Default | Env Override | Scope |
|---------|---------|-------------|-------|
| Forgot (IP) | 15 / 15 min | `PASSWORD_RESET_FORGOT_IP_MAX` | Per IP |
| Forgot (email) | 3 / 15 min | `PASSWORD_RESET_FORGOT_EMAIL_MAX` | Per email |
| Reset submit (IP) | 20 / 15 min | `PASSWORD_RESET_SUBMIT_IP_MAX` | Per IP |

### Email Verification

| Limiter | Default | Env Override | Scope |
|---------|---------|-------------|-------|
| Request (IP) | 15 / 15 min | `EMAIL_VERIFICATION_REQUEST_IP_MAX` | Per IP |
| Request (email) | 3 / 15 min | `EMAIL_VERIFICATION_REQUEST_EMAIL_MAX` | Per email |
| Confirm (IP) | 20 / 15 min | `EMAIL_VERIFICATION_CONFIRM_IP_MAX` | Per IP |

### Admin 2FA

| Limiter | Default | Env Override | Scope |
|---------|---------|-------------|-------|
| Challenge (IP) | 5 / 15 min | `ADMIN_2FA_CHALLENGE_IP_MAX` | Per IP |
| Challenge (email) | 3 / 15 min | `ADMIN_2FA_CHALLENGE_EMAIL_MAX` | Per email |
| Verify (IP) | 10 / 15 min | `ADMIN_2FA_VERIFY_IP_MAX` | Per IP |
| Verify (email) | 5 / 15 min | `ADMIN_2FA_VERIFY_EMAIL_MAX` | Per email |

### OAuth

| Limiter | Default | Env Override | Scope |
|---------|---------|-------------|-------|
| Callback (IP) | 60 / 1 min | `app.auth.oauth.callback-ip-max-attempts` | Per IP, shared across all providers |

---

## 6. Monitoring Checklist

### What to alert on

- **Rate limit spikes**: Sudden increase in `AUTH_RATE_LIMITED` events from a single IP or across many IPs (distributed attack)
- **Login failure bursts**: > 20 `AUTH_LOGIN_FAILED` in 5 minutes from same IP
- **Admin 2FA failures**: Any `AUTH_2FA_FAILED` events (small user set, should be rare)
- **OAuth failures**: Repeated `AUTH_OAUTH_FAILED` with "Invalid state" (possible CSRF)
- **Email delivery failures**: Check Resend dashboard for bounce rate > 5%
- **Application errors**: 5xx responses from auth endpoints (check application logs)

### Health checks

- `GET /actuator/health` — returns 200 when backend is healthy (only endpoint exposed)
- Database connectivity is validated by Hikari pool
- Email provider connectivity can be tested with `EMAIL_TEST_CONNECTION=true` (startup check)

### Log locations

| Log | Path | Retention |
|-----|------|-----------|
| Application | `logs/univoyage.log` | 30 days, 50MB/file |
| Security events | `logs/security-events.jsonl` | 90 days, 50MB/file |
| Railway logs | Railway dashboard → Deployments → Logs | Per Railway plan |

---

## 7. CORS / Cookie Configuration

### Production vs Development

| Setting | Development | Production |
|---------|-------------|------------|
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173,http://127.0.0.1:5173` | `https://your-app.vercel.app` (required — no fallback) |
| `COOKIE_SECURE` | `false` | `true` |
| `COOKIE_SAMESITE` | `Lax` | `None` |
| `COOKIE_DOMAIN` | (unset — localhost) | `.your-domain.com` |
| `SPRING_PROFILES_ACTIVE` | (unset — default) | `prod` |

### Adding a new allowed origin

1. Update `CORS_ALLOWED_ORIGINS` in Railway (comma-separated list)
2. Redeploy backend
3. No code changes needed — `CorsFilterConfig` reads from config

### Cookie details

| Cookie | Purpose | HttpOnly | Secure | SameSite | Max-Age |
|--------|---------|----------|--------|----------|---------|
| `auth_token` | JWT access token | Yes | Configurable | Configurable | Session (JWT TTL) |
| `csrf_token` | CSRF double-submit token | No (JS reads) | Configurable | Configurable | Session |
| `refresh_token` | Refresh token | Yes | Configurable | Configurable | 7 days (default) |

### SecurityFilterChain path rules

| Path Pattern | Rule | Notes |
|-------------|------|-------|
| `/api/auth/2fa/**` | `hasAnyRole(ADMIN, HEAD_ADMIN)` | Authenticated admin only |
| `/api/admin/**` | `hasAnyRole(ADMIN, HEAD_ADMIN)` + 2FA filter | Requires `tfa=true` in JWT |
| `/api/auth/login`, `/register`, `/refresh` | `permitAll` | Public auth endpoints |
| `/api/auth/otp/**` | `permitAll` | Public OTP endpoints |
| `/api/auth/password/**` | `permitAll` | Public password reset |
| `/api/auth/email/verification/**` | `permitAll` | Public email verification |
| `/api/auth/google`, `/github`, `/linkedin` | `permitAll` | OAuth redirects |
| `/api/auth/*/callback` | `permitAll` | OAuth callbacks |
| `/actuator/health` | `permitAll` | Health check only |
| All other actuator | `denyAll` | Blocked in production |
| Everything else | `authenticated` | Requires valid JWT |

### CSRF protection

- Double-submit cookie pattern: JWT contains embedded `csrf` claim
- `JwtAuthenticationFilter` validates `X-CSRF-TOKEN` header matches JWT's `csrf` claim
- Enforced on `POST`, `PUT`, `DELETE`, `PATCH` methods
- Bypassed for unauthenticated endpoints (login, register, refresh, OAuth callbacks)
