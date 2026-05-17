# Email & link-auth — policy (dev = prod)

Sve što ide preko emaila: **slanje** (OTP, reset, verify), **password reset**, **email verification**.  
**Isti defaulti** u `application.yml` za lokalni dev i Railway — razlikuju se samo env vrijednosti (URL, `EMAIL_FROM`, ključ).

- OTP kodovi: [otp-prod-policy.md](otp-prod-policy.md)  
- Resend / Postmark / DNS: [resend-postmark-setup.md](resend-postmark-setup.md)  
- Puni vodič: [guide.md](guide.md)

---

## Minimum env (dev i prod — ista imena)

**Lokalno** (`backend/.env`):

```env
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_...
EMAIL_FROM=onboarding@resend.dev
APP_FRONTEND_RESET_URL=http://localhost:5173/auth/reset-password
APP_FRONTEND_VERIFY_URL=http://localhost:5173/auth/verify-email
```

**Railway** (+ `SPRING_PROFILES_ACTIVE=prod`, verified `EMAIL_FROM`, HTTPS frontend URL-ovi).

`EMAIL_PROVIDER` default je **`resend`**. `logging` samo u **`test`** profilu (JUnit).

---

## 1. Outbound email (slanje)

| Postavka | Prod default | Env |
|----------|--------------|-----|
| Provider | `resend` | `EMAIL_PROVIDER` |
| From | *(obavezno)* | `EMAIL_FROM` |
| From name | `UniVoyage` | `EMAIL_FROM_NAME` |
| Reply-To | prazno | `EMAIL_REPLY_TO` |
| Product name (šabloni) | `UniVoyage` | `EMAIL_PRODUCT_NAME` |
| Retry pokušaji | 3 | `EMAIL_RETRY_MAX_ATTEMPTS` |
| Retry početni backoff | 1 s | `EMAIL_RETRY_INITIAL_BACKOFF` |
| Retry max backoff | 10 s | `EMAIL_RETRY_MAX_BACKOFF` |
| SMTP test na startu | off | `EMAIL_TEST_CONNECTION` |

**Secrets (jedan provider):**

| Provider | Env |
|----------|-----|
| Resend (default) | `RESEND_API_KEY` |
| Postmark | `POSTMARK_SERVER_TOKEN` |
| SendGrid | `SENDGRID_API_KEY` |

Setup korak-po-korak: [resend-postmark-setup.md](resend-postmark-setup.md).

---

## 2. Password reset (link u mailu)

| Pravilo | Default (dev = prod) |
|---------|----------------------|
| Token TTL | 1 h |
| Pogrešni submit po tokenu | 5 |
| Forgot po emailu / 15 min | 3 |
| Forgot po IP / 15 min | 15 |
| Reset submit po IP / 15 min | 20 |
| Revoke sesija nakon reset-a | on |

| Env | Property |
|-----|----------|
| `PASSWORD_RESET_TTL` | `ttl` |
| `PASSWORD_RESET_MAX_ATTEMPTS` | `max-attempts-per-token` |
| `PASSWORD_RESET_FORGOT_EMAIL_MAX` | `forgot-email-max-attempts` |
| `PASSWORD_RESET_FORGOT_EMAIL_WINDOW` | `forgot-email-window` |
| `PASSWORD_RESET_FORGOT_IP_MAX` | `forgot-ip-max-attempts` |
| `PASSWORD_RESET_FORGOT_IP_WINDOW` | `forgot-ip-window` |
| `PASSWORD_RESET_SUBMIT_IP_MAX` | `reset-ip-max-attempts` |
| `PASSWORD_RESET_SUBMIT_IP_WINDOW` | `reset-ip-window` |
| `APP_FRONTEND_RESET_URL` | `frontend-reset-url` |
| `PASSWORD_RESET_REVOKE_SESSIONS` | `revoke-sessions-on-reset` |

API: `POST /api/auth/password/forgot`, `POST /api/auth/password/reset`.

---

## 3. Email verification (link u mailu)

| Pravilo | Default (dev = prod) |
|---------|----------------------|
| Token TTL | 24 h |
| Pogrešni confirm po tokenu | 5 |
| Request po emailu / 15 min | 3 |
| Request po IP / 15 min | 15 |
| Confirm po IP / 15 min | 20 |

| Env | Property |
|-----|----------|
| `EMAIL_VERIFICATION_TTL` | `ttl` |
| `EMAIL_VERIFICATION_MAX_ATTEMPTS` | `max-attempts-per-token` |
| `EMAIL_VERIFICATION_REQUEST_EMAIL_MAX` | `request-email-max-attempts` |
| `EMAIL_VERIFICATION_REQUEST_EMAIL_WINDOW` | `request-email-window` |
| `EMAIL_VERIFICATION_REQUEST_IP_MAX` | `request-ip-max-attempts` |
| `EMAIL_VERIFICATION_REQUEST_IP_WINDOW` | `request-ip-window` |
| `EMAIL_VERIFICATION_CONFIRM_IP_MAX` | `confirm-ip-max-attempts` |
| `EMAIL_VERIFICATION_CONFIRM_IP_WINDOW` | `confirm-ip-window` |
| `APP_FRONTEND_VERIFY_URL` | `frontend-verify-url` |

API: `POST /api/auth/email/verification/request`, `POST /api/auth/email/verification/confirm`.

---

## 4. OTP (kratki kod u mailu)

Ne dupliciramo ovdje — vidi [otp-prod-policy.md](otp-prod-policy.md).  
Isti Railway servis, isti `EMAIL_FROM` / provider.

---

## Jedan pogled — defaulti (svugdje isto)

| Flow | Default |
|------|---------|
| Slanje | `resend`; obavezan `EMAIL_FROM` + API key (`logging` samo u testovima) |
| OTP | vidi [otp-prod-policy.md](otp-prod-policy.md) |
| Password reset | forgot 3/email, 15/IP; reset submit 20/IP |
| Email verify | request 3/email, 15/IP; confirm 20/IP |

---

## Strože pod napadom (primjer)

```env
PASSWORD_RESET_FORGOT_EMAIL_MAX=2
PASSWORD_RESET_FORGOT_IP_MAX=10
EMAIL_VERIFICATION_REQUEST_EMAIL_MAX=2
EMAIL_RETRY_MAX_ATTEMPTS=5
```

Za OTP: [otp-prod-policy.md](otp-prod-policy.md) → preset „Još strože”.

---

## Smoke test

1. OTP request → mail s kodom.  
2. Password forgot → mail s linkom `?token=`.  
3. Email verification request → mail s linkom.  
4. Log: `Email sent via Resend` — bez plaintext tokena/koda.  
5. Startup s `EMAIL_PROVIDER=logging` izvan `test` profila → **fail** (namjerno).
