# Email Setup Checklist (Ticket #287)

Local dev and production setup for Resend email auth (OTP, password reset, email verification).

---

## Local Dev

### Prerequisites

- Java 17+, PostgreSQL running, branch `feature/security-authentication` checked out
- `backend/.env` exists (copy from `backend/env.example` if needed)
- DB + JWT already configured in `.env`

### Email env vars (add to `backend/.env`)

```
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_YOUR_DEV_KEY
EMAIL_FROM=onboarding@resend.dev
EMAIL_FROM_NAME=UniVoyage
EMAIL_PRODUCT_NAME=UniVoyage
APP_FRONTEND_RESET_URL=http://localhost:5173/auth/reset-password
APP_FRONTEND_VERIFY_URL=http://localhost:5173/auth/verify-email
```

> `onboarding@resend.dev` is Resend's sandbox — delivers only to the Resend account owner.

### Start & verify

```bash
cd backend && mvn spring-boot:run
```

- No startup exceptions
- Flyway applies V20 (OTP table) and V21 (password reset + email_verified)
- Log shows "Email sent via Resend" on OTP request

### Smoke tests

| Feature | Endpoint | Expected |
|---------|----------|----------|
| OTP request | `POST /api/auth/otp/request` `{"email":"...","purpose":"LOGIN"}` | 200, email arrives |
| OTP verify | `POST /api/auth/otp/verify` `{"email":"...","purpose":"LOGIN","code":"..."}` | 200 + cookies |
| Password forgot | `POST /api/auth/password/forgot` `{"email":"..."}` | 200, email with `?token=` link |
| Password reset | `POST /api/auth/password/reset` `{"token":"...","newPassword":"..."}` | 200 |
| Email verification | `POST /api/auth/email/verification/request` (authenticated) | 200, email sent |
| Verify confirm | `POST /api/auth/email/verification/confirm` `{"token":"..."}` | 200 |

---

## Production (Railway)

### Railway env vars

```
SPRING_PROFILES_ACTIVE=prod
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_PROD_KEY
EMAIL_FROM=onboarding@resend.dev
EMAIL_FROM_NAME=UniVoyage
EMAIL_PRODUCT_NAME=UniVoyage
APP_FRONTEND_RESET_URL=https://YOUR-APP.vercel.app/auth/reset-password
APP_FRONTEND_VERIFY_URL=https://YOUR-APP.vercel.app/auth/verify-email
CORS_ALLOWED_ORIGINS=https://YOUR-APP.vercel.app
COOKIE_SECURE=true
COOKIE_SAMESITE=None
```

Replace `YOUR-APP.vercel.app` with actual Vercel domain.

### Custom domain (when available)

1. Resend dashboard → Domains → add `mail.yourdomain.com`
2. Add DNS records (DKIM + SPF) at registrar
3. Wait for Verified status
4. Update `EMAIL_FROM=noreply@mail.yourdomain.com`
5. Create a separate production API key

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `requires RESEND_API_KEY` | Add to `.env` / Railway |
| `EMAIL_FROM must be set` | Set `EMAIL_FROM` |
| `logging is only allowed with test` | Remove `EMAIL_PROVIDER=logging` |
| No email received | Check Resend dashboard, spam, verified domain (prod) |
| Reset returns 400 | Token expired (1h TTL) or already used |
| 429 Too Many Requests | Wait for `Retry-After` header |

---

## Docs reference

- `backend/docs/Email & otp/guide.md` — full architecture + runbook
- `backend/docs/Email & otp/resend-postmark-setup.md` — provider setup
- `backend/docs/Email & otp/email-prod-policy.md` — env/config mapping
- `backend/docs/Email & otp/otp-prod-policy.md` — rate limits + defaults
