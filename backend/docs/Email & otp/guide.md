# Email & OTP — complete guide

Single reference for **email OTP authentication**, **outbound email (production)**, **SMTP**, and **email templates** in UniVoyage.

Session after successful OTP verify matches password login — see [auth-session-management.md](../auth-session-management.md).

---

## Table of contents

### Overview
- [Architecture](#architecture)
- [Environment at a glance](#environment-at-a-glance)

### Part I — OTP authentication
- [What OTP does](#what-otp-does)
- [HTTP API](#http-api)
- [End-to-end flows](#end-to-end-flows)
- [Purposes and product rules](#purposes-and-product-rules)
- [Database model](#database-model)
- [OTP security model](#otp-security-model)
- [Rate limiting and lockout](#rate-limiting-and-lockout)
- [OTP configuration](#otp-configuration)
- [OTP production deployment](#otp-production-deployment)
- [Frontend integration](#frontend-integration)
- [OTP monitoring and alerts](#otp-monitoring-and-alerts)
- [OTP troubleshooting](#otp-troubleshooting)
- [OTP source files](#otp-source-files)

### Part II — Outbound email (production)
- [Email architecture](#email-architecture)
- [Choosing a provider](#choosing-a-provider)
- [Email configuration reference](#email-configuration-reference)
- [Provider setup](#provider-setup)
- [SMTP transport](#smtp-transport)
- [DNS: SPF, DKIM, DMARC](#dns-spf-dkim-dmarc)
- [Retries and failures](#retries-and-failures)
- [Startup validation](#startup-validation)
- [Email production deployment checklist](#email-production-deployment-checklist)
- [Secrets and compliance](#secrets-and-compliance)
- [Email monitoring](#email-monitoring)
- [Email troubleshooting](#email-troubleshooting)
- [Email testing](#email-testing)
- [Email source files](#email-source-files)

### Part III — Email template design
- [Design principles](#design-principles)
- [Template file structure](#template-file-structure)
- [Rendering pipeline](#rendering-pipeline)
- [Template variables reference](#template-variables-reference)
- [Shared layout (layout.html)](#shared-layout-layouthtml)
- [OTP email templates](#otp-email-templates)
- [Plain text vs HTML](#plain-text-vs-html)
- [Branding and visual system](#branding-and-visual-system)
- [Accessibility and email clients](#accessibility-and-email-clients)
- [Security in templates](#security-in-templates)
- [Adding a new mail type](#adding-a-new-mail-type)
- [Preview and local testing](#preview-and-local-testing)
- [Template release checklist](#template-release-checklist)

---

## Architecture

```text
EmailOtpController
    → EmailOtpChallengeService (hash, TTL, lockout, rate limits)
        → OtpEmailNotificationService
            → EmailTemplateRenderer (classpath templates)
            → EmailDeliveryService (retry, errorId)
                → EmailProvider (logging | smtp | sendgrid | resend | postmark)
```

## Environment at a glance

| Concern | Key variables |
|---------|----------------|
| OTP policy | `app.auth.otp.*` |
| Email provider | `EMAIL_PROVIDER`, `EMAIL_FROM`, API keys |
| Production cookies | `COOKIE_SECURE=true` |
| Dev (no mail) | `EMAIL_PROVIDER=logging` |
| Tests | `@ActiveProfiles("test")` → `TestOtpNotificationPort` |

Legacy `OTP_MAIL_*` env vars map to `EMAIL_*` via `application.yml`.

---

# Part I — OTP authentication

## What OTP does

OTP lets users sign in (or verify email) **without a password** for that step:

1. Client requests a **6-digit code** for an email + purpose.
2. Backend stores a **BCrypt hash** of the code (never plaintext).
3. Backend sends the code via the outbound email stack.
4. Client submits the code; on success the backend issues the **same session** as password login (access JWT, CSRF cookie, refresh token).

OTP is **not** a second factor on top of password login in the current design — it is an alternative authentication path.

---

## HTTP API

All routes are **public** (`permitAll` in `SecurityConfiguration`). Base path: `/api/auth/otp`.

### `POST /api/auth/otp/request`

Creates a new challenge or resends on an existing active challenge (subject to cooldown).

**Request body:**

```json
{
  "email": "user@example.com",
  "purpose": "LOGIN"
}
```

| Field | Type | Values |
|-------|------|--------|
| `email` | string | Valid email; normalized to lowercase trim |
| `purpose` | enum | `LOGIN`, `REGISTER`, `PASSWORD_RESET` |

**Success `200` — always the same body (anti-enumeration):**

```json
{
  "success": true,
  "data": {
    "message": "If this email can receive messages, a verification code has been sent."
  }
}
```

**Rate limit `429`:**

- Header: `Retry-After: <seconds>`
- Body: generic “too many attempts” message

**Important:** `200` does **not** guarantee that email was delivered. Delivery failures are logged server-side; the client must not infer mailbox existence from status codes.

---

### `POST /api/auth/otp/resend`

Alias of `/request` for UX that exposes a separate “Resend code” button. Same validation, rate limits, and response shape.

---

### `POST /api/auth/otp/verify`

Validates the code and opens a session.

**Request body:**

```json
{
  "email": "user@example.com",
  "purpose": "LOGIN",
  "code": "482910"
}
```

**Success `200`:**

Same `AuthPayload` as `POST /api/auth/login` (user DTO, access token, CSRF token) plus auth cookies written by `AuthCookieWriter` and refresh token via `RefreshTokenService`.

**Failure `400`:**

Generic message only:

```text
Invalid or expired verification code.
```

Covers: wrong code, expired challenge, no active challenge, already consumed, user cannot complete sign-in (e.g. REGISTER without account when auto-register is off).

**Failure `429`:**

Too many verify attempts (per IP/email) or challenge locked after repeated wrong codes. `Retry-After` when applicable.

---

## End-to-end flows

### Happy path — sign in

```text
Client                         Backend                              DB / Email
  |  POST /request {LOGIN}          |                                    |
  |------------------------------>| invalidate prior active row        |
  |                               | INSERT challenge (otp_hash, …)     |
  |                               | dispatchCode → email stack         |
  |                               |----------------------------------->| send
  |  200 uniform message            |                                    |
  |<------------------------------|                                    |
  |  POST /verify {code}            |                                    |
  |------------------------------>| BCrypt match, consumed_at set      |
  |                               | load user, issue JWT + cookies     |
  |  200 AuthPayload + Set-Cookie   |                                    |
  |<------------------------------|                                    |
```

### Resend on same challenge

If an active challenge exists and cooldown has passed and `resend_count < max_resends`:

- Same row updated: new hash, new `expires_at`, `resend_count++`, `next_resend_at` advanced.
- New code emailed.

If cooldown not met → `429` with `Retry-After` until `next_resend_at`.

If max resends exhausted → `200` (same anti-enumeration message) but **no new email** (`ResendExhausted` outcome).

### New request supersedes old

A new `/request` for the same `(email, purpose)` **invalidates** the previous active row (`invalidated_at`) and creates a fresh challenge.

---

## Purposes and product rules

| Purpose | `purposeLabel` in email | User must exist? | Typical product flow |
|---------|-------------------------|------------------|----------------------|
| `LOGIN` | Sign in | Yes | Email-only login |
| `REGISTER` | Complete registration | Optional | Verify email before/after signup |
| `PASSWORD_RESET` | Reset your password | Yes | Step before “set new password” UI |

### Auto-register (`app.auth.otp.auto-register-on-verify`)

| Value | Behaviour on `REGISTER` + verify |
|-------|----------------------------------|
| `false` (default) | Unknown email → `400` after code consumed |
| `true` | Creates user with `auto-register-country-code` (default `MT`), random password hash |

**Production recommendation:** keep `false` unless product explicitly wants passwordless registration. Prefer explicit registration + `REGISTER` OTP to confirm email only.

### PASSWORD_RESET

OTP verify **only** proves mailbox control. A separate “set new password” endpoint/flow must still be implemented if not already wired. OTP success alone does not change the password hash today unless you add that step in the product layer.

---

## Database model

**Table:** `email_otp_challenges`  
**Migration:** `V20__create_email_otp_challenges.sql`

| Column | Role |
|--------|------|
| `id` | Primary key |
| `email` | Normalized address |
| `purpose` | `LOGIN` / `REGISTER` / `PASSWORD_RESET` |
| `otp_hash` | BCrypt hash of 6-digit code |
| `expires_at` | Challenge TTL from last send |
| `attempt_count` | Wrong verify attempts on this challenge |
| `max_attempts` | Lock threshold (default 5) |
| `resend_count` | Resends used |
| `max_resends` | Resend cap (default 3) |
| `next_resend_at` | Earliest next resend |
| `last_sent_at` | Last email dispatch |
| `consumed_at` | Set on successful verify |
| `locked_until` | Temporary lock after max wrong attempts |
| `invalidated_at` | Superseded by newer request |
| `created_at` | Row creation |

**Constraint:** partial unique index — at most one **active** challenge per `LOWER(email)` + `purpose` where `consumed_at IS NULL` AND `invalidated_at IS NULL`.

### What is never stored

- Plaintext OTP
- Full email in application logs (masked as `u***@example.com`)

---

## OTP security model

### Code generation and storage

- **6 digits**, cryptographically suitable random (`OtpCodeGenerator`).
- Stored as **BCrypt** via shared `PasswordEncoder` (`OtpHasher`).
- Plaintext exists only in memory for the duration of `dispatchCode`.

### Logging rules (mandatory for ops)

| Allowed | Forbidden |
|---------|-----------|
| `purpose=LOGIN` | OTP code in any log line |
| `recipient=u***@example.com` | Full email in INFO/DEBUG |
| `errorId=<uuid>` on delivery failure | SMTP/API response bodies with PII |

### Anti-enumeration

| Endpoint | Behaviour |
|----------|-----------|
| `/request` | Always `200` + same JSON message |
| `/verify` | Generic `400` for wrong/expired/missing user |
| Email delivery failure | Still `200` on request; log `errorId` |

Attackers cannot distinguish “unknown email” from “known email” using HTTP status on request.

### Session parity

Successful verify uses the same components as password login:

- `JwtService.generateForUser`
- `AuthCookieWriter`
- `RefreshTokenService`

Apply the same production cookie settings: `COOKIE_SECURE=true`, appropriate `SameSite`, HTTPS termination.

### Threat considerations

| Threat | Mitigation |
|--------|------------|
| Brute force 6-digit code | Per-challenge attempt cap + lock; per-email/IP verify rate limits; short TTL (10 min) |
| Email bombing | Per-email/IP request limits; resend cooldown; max resends |
| Credential stuffing via OTP | Same rate limits; monitor spikes |
| User enumeration | Uniform responses (see above) |
| DB leak | Only bcrypt hashes |

**6-digit space:** 10⁶ combinations — policy must keep TTL short and attempts low. Do not increase code length without updating templates and client UX.

---

## Rate limiting and lockout

Two layers: **HTTP rate limiters** (in-memory per deployment) and **per-challenge** counters (in DB).

### HTTP limiters (defaults)

Configured under `app.auth.otp` in `application.yml`.

| Limiter | Scope | Default cap | Window |
|---------|-------|-------------|--------|
| Request | Client IP | 20 | 15 min |
| Request | Email | 5 | 15 min |
| Verify | Client IP | 30 | 15 min |
| Verify | Email | 10 | 15 min |

On exceed → **429** + `Retry-After`.

**Production note:** in-memory limiters reset per instance. Behind multiple replicas, effective limit is roughly `N × cap`. For strict global limits, plan Redis or API gateway throttling later.

### Per-challenge lockout

| Setting | Default |
|---------|---------|
| Max wrong verify attempts | 5 |
| Lock duration | 15 min |
| Challenge TTL | 10 min |
| Resend cooldown | 60 s |
| Max resends per challenge | 3 |

When locked, verify returns `429` until `locked_until` passes.

---

## OTP configuration

### OTP policy (`app.auth.otp`)

| Property | Env override pattern | Default | Description |
|----------|----------------------|---------|-------------|
| `ttl` | — | `PT10M` | Code validity after each send |
| `resend-cooldown` | — | `PT60S` | Minimum gap between resends |
| `max-resends-per-challenge` | — | `3` | Resends per challenge row |
| `max-verify-attempts-per-challenge` | — | `5` | Wrong codes before lock |
| `verify-lock-duration` | — | `PT15M` | Lock duration |
| `request-email-max-attempts` | — | `5` | Per-email request cap |
| `request-email-window` | — | `PT15M` | Request window |
| `request-ip-max-attempts` | — | `20` | Per-IP request cap |
| `request-ip-window` | — | `PT15M` | Request window |
| `verify-email-max-attempts` | — | `10` | Per-email verify cap |
| `verify-email-window` | — | `PT15M` | Verify window |
| `verify-ip-max-attempts` | — | `30` | Per-IP verify cap |
| `verify-ip-window` | — | `PT15M` | Verify window |
| `auto-register-on-verify` | — | `false` | Create user on REGISTER verify |
| `auto-register-country-code` | — | `MT` | ISO country for auto-register |

Override in `application-prod.yml` or environment-specific config — do not relax limits in production without review.

### Email (delivery)

OTP does not configure SMTP directly. See [email-production-guide.md](email-production-guide.md):

- `EMAIL_PROVIDER`, `EMAIL_FROM`, API keys, retries

---

## OTP production deployment

### Pre-flight checklist

- [ ] `EMAIL_PROVIDER` is a real provider (`sendgrid`, `resend`, `postmark`, or `smtp`) — not `logging`
- [ ] `EMAIL_FROM` on a verified domain with SPF/DKIM/DMARC
- [ ] Provider API key in secrets manager (not in git)
- [ ] `COOKIE_SECURE=true` behind HTTPS
- [ ] JWT secret length and rotation policy documented
- [ ] Rate limits reviewed for expected traffic
- [ ] `auto-register-on-verify` explicitly set for product intent
- [ ] Log aggregation can search `OTP delivery failed errorId=`
- [ ] Frontend handles `429` with `Retry-After` countdown

### Recommended production `.env` fragment

```env
# Email (pick one provider — see email-production-guide.md)
EMAIL_PROVIDER=sendgrid
EMAIL_FROM=noreply@mail.univoyage.com
EMAIL_FROM_NAME=UniVoyage
EMAIL_PRODUCT_NAME=UniVoyage
EMAIL_REPLY_TO=support@univoyage.com
SENDGRID_API_KEY=<from-secrets-manager>

EMAIL_RETRY_MAX_ATTEMPTS=3
EMAIL_RETRY_INITIAL_BACKOFF=PT1S
EMAIL_RETRY_MAX_BACKOFF=PT10S

# Auth cookies
COOKIE_SECURE=true
COOKIE_SAMESITE=Lax

# OTP — tighten if under abuse (example)
# OTP_REQUEST_EMAIL_MAX_ATTEMPTS=3
```

Map env names to Spring properties via your deployment tool or `application-prod.yml`.

### Staging

Use a **sandbox** or separate provider subaccount. Use real DNS on a staging subdomain (e.g. `mail.staging.univoyage.com`) so deliverability tests are meaningful.

### Database migrations

Ensure `V20__create_email_otp_challenges.sql` ran before enabling OTP in production. No runtime DDL.

---

## Frontend integration

### Request code

```http
POST /api/auth/otp/request
Content-Type: application/json

{"email":"user@example.com","purpose":"LOGIN"}
```

- Show the **same** success copy regardless of outcome.
- On `429`, read `Retry-After` and disable the button until elapsed.

### Verify code

```http
POST /api/auth/otp/verify
Content-Type: application/json

{"email":"user@example.com","purpose":"LOGIN","code":"123456"}
```

- Use 6-digit input; strip spaces client-side.
- On `400`, show generic “invalid or expired” — do not say “wrong code” vs “expired” unless product insists (weakens anti-enumeration slightly).
- On `200`, store tokens/cookies per existing login flow.

### Resend UX

Call `/resend` or `/request` — behaviour is identical. Respect cooldown from `429`.

### CORS and cookies

Same rules as password login: credentials mode if using cookies; CSRF header from login response.

---

## OTP monitoring and alerts

### Log patterns to watch

| Pattern | Meaning |
|---------|---------|
| `OTP delivery failed errorId=` | Email failed after retries — user may not receive code |
| `OTP challenge created` | Normal issuance (no code in log) |
| Spike in `429` on `/otp/*` | Abuse or aggressive client |
| Many `OTP delivery failed` with same `errorId` | Transient provider outage |

### Suggested alerts

1. **Error rate:** `OTP delivery failed` > N per 5 min in production.
2. **Provider health:** HTTP 5xx from SendGrid/Resend/Postmark dashboards.
3. **Bounce/complaint rate** at email provider (domain reputation).

### Correlating incidents

1. User reports “no code” → search logs by time + masked email pattern.
2. Find `errorId` in `OTP delivery failed` line.
3. Cross-check provider dashboard for rejected/bounced message to same domain.

There is **no** dead-letter queue in v1 — recovery is retry + ops follow-up.

---

## OTP troubleshooting

| Symptom | Likely cause | Action |
|---------|--------------|--------|
| Always `200` but no email | `EMAIL_PROVIDER=logging` | Set real provider; redeploy |
| Always `200` but no email | Delivery failure | Search `errorId=`; fix provider/key/domain |
| Startup crash | Missing `EMAIL_FROM` or API key | Set env; see `EmailStartupValidator` |
| `429` on request | IP/email rate limit | Wait `Retry-After`; review limits |
| `429` on verify | Challenge locked or verify limit | Wait lockout; request new code |
| `400` after one good verify | Code consumed | Request new code |
| `400` REGISTER, new user | `auto-register-on-verify=false` | Enable flag or register user first |
| Code “invalid” immediately | Clock skew rare; usually wrong code or expired | Check TTL; server time NTP |
| Works on one pod, flaky cluster | In-memory rate limits differ per instance | Consider gateway limits |
| Mail in spam | DNS/reputation | SPF/DKIM/DMARC; see email guide |

---

## OTP source files

| Path | Role |
|------|------|
| `auth/controller/EmailOtpController.java` | HTTP API, rate limit gates |
| `auth/service/EmailOtpChallengeService.java` | Core logic, dispatch, verify |
| `auth/model/EmailOtpChallenge.java` | JPA entity |
| `auth/repository/EmailOtpChallengeRepository.java` | Active challenge queries |
| `auth/otp/OtpEmailNotificationService.java` | Email bridge |
| `auth/otp/OtpCodeGenerator.java` | 6-digit generation |
| `auth/otp/OtpHasher.java` | BCrypt hashing |
| `auth/config/OtpSecurityProperties.java` | Policy binding |
| `auth/security/Otp*RateLimiter.java` | HTTP rate limits |
| `db/migration/V20__create_email_otp_challenges.sql` | Schema |

Tests: `EmailOtpControllerIntegrationTest`, `EmailOtpRateLimitIntegrationTest`, `EmailOtpChallengeServiceTest`.

---

# Part II — Outbound email (production)

## Email architecture

Outbound email is **not** tied to OTP implementation details. Any feature (OTP today, password reset tomorrow) renders templates and calls one service.

```text
Feature adapter (e.g. OtpEmailNotificationService)
    → EmailTemplateRenderer
    → OutboundEmailMessage (to, subject, textPlain, textHtml, replyTo)
    → EmailDeliveryService
        → retry loop (exponential backoff)
        → EmailProvider (single active bean per config)
```

### Switching providers

Change **one** setting — no code changes for OTP:

```env
EMAIL_PROVIDER=sendgrid   # or resend | postmark | smtp | logging
```

Spring activates exactly one `EmailProvider` implementation via `@ConditionalOnProperty`.

| Provider | Class | When to use |
|----------|-------|-------------|
| `logging` | `LoggingEmailProvider` | Local dev; default |
| `smtp` | `SmtpEmailProvider` | Any SMTP relay (SendGrid SMTP, SES, etc.) |
| `sendgrid` | `SendGridEmailProvider` | SendGrid HTTP API |
| `resend` | `ResendEmailProvider` | Resend HTTP API |
| `postmark` | `PostmarkEmailProvider` | Postmark HTTP API |

### From address

`EmailProperties` supplies `from`, `from-name`, optional `reply-to`. Providers set:

- **SMTP:** `MimeMessage` From + Reply-To
- **API providers:** JSON `from` / `reply_to` fields

`EMAIL_FROM` must match the domain you authenticated at the provider.

---

## Choosing a provider

| Criterion | SendGrid | Resend | Postmark | SMTP |
|-----------|----------|--------|----------|------|
| Setup complexity | Low | Low | Low | Medium |
| HTTP API | Yes | Yes | Yes | No (Spring Mail) |
| Typical production use | High volume | Modern apps | Deliverability focus | Legacy / unified SMTP creds |
| Connection test on startup | API call implicit | API call implicit | API call implicit | `EMAIL_TEST_CONNECTION=true` |

**Recommendation:** use **HTTP API** (`sendgrid`, `resend`, or `postmark`) in production for clearer errors and no SMTP port/firewall issues. Use `smtp` when your platform only exposes SMTP or you already standardize on one SMTP user.

**Do not use** personal Gmail/Outlook for production OTP — rate limits, poor reputation, and ToS risk.

---

## Email configuration reference

All settings live under `app.email` in `application.yml` (overridable via env).

### Core

| Env variable | Property | Default | Required when |
|--------------|----------|---------|---------------|
| `EMAIL_PROVIDER` | `provider` | `logging` | Always |
| `EMAIL_FROM` | `from` | — | Any provider except `logging` |
| `EMAIL_FROM_NAME` | `from-name` | `UniVoyage` | Optional |
| `EMAIL_REPLY_TO` | `reply-to` | — | Optional |
| `EMAIL_PRODUCT_NAME` | `product-name` | `UniVoyage` | Templates |
| `EMAIL_TEST_CONNECTION` | `test-connection-on-startup` | `false` | SMTP: recommended on first deploy |

Legacy fallbacks: `OTP_MAIL_FROM` → `EMAIL_FROM`, `OTP_MAIL_FROM_NAME` → `EMAIL_FROM_NAME`, etc.

### Retry policy

| Env variable | Default | Description |
|--------------|---------|-------------|
| `EMAIL_RETRY_MAX_ATTEMPTS` | `3` | Total send attempts |
| `EMAIL_RETRY_INITIAL_BACKOFF` | `PT1S` | First wait after failure |
| `EMAIL_RETRY_MAX_BACKOFF` | `PT10S` | Cap on backoff doubling |

Backoff doubles each retry: 1s → 2s → 4s (capped at 10s).

### Provider secrets

| Provider | Env variable | Property path |
|----------|--------------|---------------|
| SendGrid | `SENDGRID_API_KEY` | `app.email.sendgrid.api-key` |
| Resend | `RESEND_API_KEY` | `app.email.resend.api-key` |
| Postmark | `POSTMARK_SERVER_TOKEN` | `app.email.postmark.server-token` |
| SMTP | `SPRING_MAIL_PASSWORD` | Spring Mail standard |

---

## Provider setup

### SendGrid (HTTP API)

1. Create API key with **Mail Send** permission only (least privilege).
2. Authenticate domain: Settings → Sender Authentication → Domain Authentication.
3. Add DNS records SendGrid provides (CNAME for DKIM, etc.).
4. Verify domain shows “Valid”.

```env
EMAIL_PROVIDER=sendgrid
EMAIL_FROM=noreply@mail.univoyage.com
EMAIL_FROM_NAME=UniVoyage
SENDGRID_API_KEY=SG.xxxxxxxxxxxx
```

Implementation: `POST https://api.sendgrid.com/v3/mail/send` with multipart alternative plain + HTML.

---

### Resend (HTTP API)

1. Add and verify domain in Resend dashboard.
2. Create API key.

```env
EMAIL_PROVIDER=resend
EMAIL_FROM=noreply@mail.univoyage.com
RESEND_API_KEY=re_xxxxxxxxxxxx
```

Implementation: `POST https://api.resend.com/emails`.

---

### Postmark (HTTP API)

1. Create **Server** (transactional stream).
2. Add **Sender Signature** or **Domain** with DKIM.
3. Copy **Server API token**.

```env
EMAIL_PROVIDER=postmark
EMAIL_FROM=noreply@mail.univoyage.com
POSTMARK_SERVER_TOKEN=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

Implementation: `POST https://api.postmarkapp.com/email`.

---

### Logging (development)

```env
EMAIL_PROVIDER=logging
```

Logs at INFO:

```text
Email dispatch (logging provider) recipient=u***@example.com subject=Your UniVoyage Sign in code
```

No network I/O. **Never** use in production unless you accept that users receive no mail.

---

## SMTP transport

Activate with `EMAIL_PROVIDER=smtp` and standard Spring Mail properties.

### Security defaults (code)

| Setting | Value |
|---------|--------|
| Transport | **STARTTLS required** on port **587** |
| Auth | SMTP AUTH enabled |
| Timeouts | 10s connect / read / write |
| Content | `multipart/alternative` — plain + HTML |
| HTML | User-controlled template values escaped |

### Environment variables

| Variable | Description |
|----------|-------------|
| `SPRING_MAIL_HOST` | SMTP hostname (**required**) |
| `SPRING_MAIL_PORT` | Usually `587` |
| `SPRING_MAIL_USERNAME` | SMTP user or `apikey` (SendGrid) |
| `SPRING_MAIL_PASSWORD` | Password or API key |
| `SPRING_MAIL_SSL_TRUST` | Optional: pin trust to host |
| `EMAIL_TEST_CONNECTION` | `true` → `JavaMailSender.testConnection()` on startup |

### Example: SendGrid via SMTP

```env
EMAIL_PROVIDER=smtp
SPRING_MAIL_HOST=smtp.sendgrid.net
SPRING_MAIL_PORT=587
SPRING_MAIL_USERNAME=apikey
SPRING_MAIL_PASSWORD=SG.xxxxxxxxxxxx
EMAIL_FROM=noreply@mail.univoyage.com
EMAIL_FROM_NAME=UniVoyage
SPRING_MAIL_SSL_TRUST=smtp.sendgrid.net
EMAIL_TEST_CONNECTION=true
```

### Port 465 (implicit TLS)

Prefer **587 + STARTTLS**. If the provider requires 465:

```yaml
spring:
  mail:
    port: 465
    properties:
      mail.smtp.ssl.enable: true
      mail.smtp.starttls.enable: false
```

### Gmail (development only)

Use an [App Password](https://support.google.com/accounts/answer/185833), not your account password.

```env
EMAIL_PROVIDER=smtp
SPRING_MAIL_HOST=smtp.gmail.com
SPRING_MAIL_PORT=587
SPRING_MAIL_USERNAME=you@gmail.com
SPRING_MAIL_PASSWORD=xxxx-xxxx-xxxx-xxxx
EMAIL_FROM=you@gmail.com
```

---

## DNS: SPF, DKIM, DMARC

Correct DNS is the difference between inbox and spam folder.

### Recommended domain layout

| Purpose | Example |
|---------|---------|
| App / API | `api.univoyage.com` |
| Marketing | `univoyage.com` |
| **Transactional mail** | `mail.univoyage.com` |
| From address | `noreply@mail.univoyage.com` |

Use a **dedicated subdomain** for transactional mail so OTP reputation does not affect marketing domains.

### SPF

TXT record on the mail subdomain (or root if provider instructs):

```text
v=spf1 include:sendgrid.net ~all
```

Replace `include:` with your provider’s SPF include (Resend/Postmark docs list exact values).

### DKIM

Provider gives CNAME or TXT records — add exactly as shown. Wait for verification (up to 48h, usually minutes).

### DMARC

Start with monitoring:

```text
v=DMARC1; p=none; rua=mailto:dmarc-reports@univoyage.com; pct=100
```

After stable deliverability, tighten to `p=quarantine` or `p=reject`.

### Alignment checklist

- [ ] `EMAIL_FROM` domain matches authenticated DKIM domain
- [ ] SPF passes for sending IP/API
- [ ] DMARC alignment (From domain = DKIM d= domain)
- [ ] No typo in `EMAIL_FROM` (common deploy mistake)

### Safe defaults in docs / runbooks

Document for every new environment:

1. Which subdomain sends mail
2. Where DNS is managed (Cloudflare, Route53, …)
3. Which provider dashboard shows verification status
4. Who receives DMARC aggregate reports

---

## Retries and failures

### Retry flow

1. `EmailProvider.send(message)` throws `RuntimeException`.
2. `EmailDeliveryService` logs **WARN** with `errorId`, attempt number, masked recipient, provider name — **not** message body or OTP.
3. Sleep (backoff), retry until `max-attempts`.
4. Final failure → `EmailDeliveryException` with same `errorId`.

### OTP interaction

`EmailOtpChallengeService.dispatchCode` catches `EmailDeliveryException`:

- Logs: `OTP delivery failed errorId=<uuid> purpose=… recipient=m***@…`
- Does **not** rethrow — `/request` still returned `200` earlier

Users may believe a code was sent when delivery failed. Monitor `OTP delivery failed` in production.

### Dead letter

**v1:** no persistent DLQ. Ops uses `errorId` in logs + provider dashboard.  
**Future:** queue failed messages (SQS, DB table) if product requires guaranteed delivery.

---

## Startup validation

`EmailStartupValidator` runs `@PostConstruct` (non-test profiles):

| Provider | Validation |
|----------|------------|
| `logging` | `EMAIL_FROM` optional |
| `smtp` | Requires `spring.mail.host`; optional `testConnection()` if `EMAIL_TEST_CONNECTION=true` |
| `sendgrid` | Requires non-blank `SENDGRID_API_KEY` |
| `resend` | Requires `RESEND_API_KEY` |
| `postmark` | Requires `POSTMARK_SERVER_TOKEN` |
| All non-logging | Requires `EMAIL_FROM` |

**Fail-fast** on misconfiguration prevents silent “no mail” in prod.

---

## Email production deployment checklist

### Before first deploy

- [ ] Domain/subdomain created for transactional mail
- [ ] SPF + DKIM + DMARC records published and verified in provider UI
- [ ] `EMAIL_PROVIDER` set to API or SMTP (not `logging`)
- [ ] `EMAIL_FROM` on verified domain
- [ ] API key / SMTP password in secrets manager
- [ ] `EMAIL_FROM_NAME` and `EMAIL_PRODUCT_NAME` match product branding
- [ ] `EMAIL_REPLY_TO` points to real support inbox (optional but recommended)
- [ ] For SMTP: `EMAIL_TEST_CONNECTION=true` on first deploy, then can disable
- [ ] Firewall allows outbound 587 (SMTP) or HTTPS (API providers)
- [ ] Staging sent test message to Gmail + Outlook + one corporate domain

### After deploy

- [ ] Send test OTP in staging → production smoke test
- [ ] Confirm message in inbox (not spam)
- [ ] Search logs: no 6-digit codes in plaintext
- [ ] Provider dashboard: delivery/bounce metrics baseline
- [ ] Alert on `OTP delivery failed` rate

### Rollback

If email breaks after deploy:

1. Check startup logs for `IllegalStateException` from `EmailStartupValidator`.
2. Verify API key not rotated without app update.
3. Temporarily cannot rollback to `logging` in prod without user impact — fix forward.

---

## Secrets and compliance

| Rule | Detail |
|------|--------|
| Never commit | `SENDGRID_API_KEY`, `SPRING_MAIL_PASSWORD`, etc. |
| Rotate keys | Provider dashboard → update secret → rolling restart |
| Least privilege | API keys: send-only scopes |
| Logs | No full email bodies in production DEBUG |
| GDPR | OTP email is transactional; document in privacy policy |
| Retention | Provider may retain message metadata per their policy |

---

## Email monitoring

### Application logs

| Level | Message | Action |
|-------|---------|--------|
| WARN | `Email delivery attempt failed errorId=` | Transient; may recover on retry |
| ERROR | `OTP delivery failed errorId=` | User did not get code |
| INFO | `Email sent via SMTP` / API success | Normal |

### Provider dashboards

Track weekly:

- Delivery rate
- Bounce rate (hard bounces → remove bad addresses in product DB)
- Spam complaints
- Domain reputation score (if offered)

### Alert thresholds (starting point)

- `OTP delivery failed` > 10 in 5 minutes
- Bounce rate > 5% on OTP stream
- Provider API 5xx spike

---

## Email troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| App won’t start | Missing `EMAIL_FROM` or API key | Set env vars |
| App won’t start | SMTP test connection failed | Credentials, host, firewall |
| 200 OTP but no mail | `logging` provider | Change `EMAIL_PROVIDER` |
| 200 OTP but no mail | Delivery failed | Log `errorId`; check provider |
| Mail in spam | DNS / reputation | SPF/DKIM/DMARC; warm domain |
| `553 Sender not allowed` | From ≠ verified domain | Fix `EMAIL_FROM` |
| Timeout on send | Network / wrong port | 587 vs 465; security groups |
| API 401 | Bad or revoked key | Rotate key in secrets |
| HTML broken | Template edit error | See template design guide |
| Duplicate emails | Client double-submit | Debounce request button |

---

## Email testing

| Test class | Proves |
|------------|--------|
| `EmailTemplateRendererTest` | Variables substituted; HTML escaped |
| `SmtpEmailProviderTest` | GreenMail receives multipart message |
| `EmailDeliveryServiceTest` | Retries; final `errorId` |
| `OtpEmailDeliveryIntegrationTest` | OTP path renders subject/body |
| `EmailOtp*IntegrationTest` | Full HTTP flow with `TestOtpNotificationPort` |

Test profile (`application-test.yml`):

```yaml
app:
  email:
    provider: logging
```

`TestOtpNotificationPort` captures last code per email+purpose — **no network**.

Run email tests:

```bash
cd backend
mvn test -Dtest="com.univoyage.email.**"
```

---

## Email source files

```
src/main/java/com/univoyage/email/
  EmailDeliveryService.java
  OutboundEmailMessage.java
  EmailAddressMasker.java
  EmailProviderType.java
  exception/EmailDeliveryException.java
  config/EmailProperties.java
  config/EmailConfiguration.java      # RestTemplate for API providers
  config/EmailStartupValidator.java
  template/EmailTemplateRenderer.java
  provider/EmailProvider.java
  provider/LoggingEmailProvider.java
  provider/SmtpEmailProvider.java
  provider/SendGridEmailProvider.java
  provider/ResendEmailProvider.java
  provider/PostmarkEmailProvider.java

src/main/java/com/univoyage/auth/otp/
  OtpEmailNotificationService.java    # OTP adapter

src/main/resources/templates/email/
  layout.html, otp-subject.txt, otp-body.txt, otp-body.html
```

---

# Part III — Email template design

## Design principles

| Principle | Rationale |
|-----------|-----------|
| **One shared HTML shell** | Consistent header/card/footer; OTP and reset only swap inner body |
| **Always multipart** | Every send includes `text/plain` + `text/html` for accessibility and spam score |
| **Inline CSS only** | Many clients strip `<style>` blocks; use `style=""` on elements |
| **System font stack** | No web fonts — faster load, fewer client quirks |
| **Single clear CTA** | OTP: the code itself is the action; reset mail: one button link later |
| **No PII in logs** | Templates never logged; codes never logged |
| **Short subject lines** | Mobile preview; include product name + intent |

---

## Template file structure

All templates live on the classpath:

```text
backend/src/main/resources/templates/email/
├── layout.html          # Outer HTML document; placeholder {{body}}
├── otp-subject.txt      # Subject line for OTP
├── otp-body.txt         # Plain-text OTP body
├── otp-body.html        # HTML fragment (injected into layout)
└── (future)
    ├── reset-subject.txt
    ├── reset-body.txt
    └── reset-body.html
```

**Do not** embed full HTML documents in `otp-body.html` — only the inner card content. The layout supplies `<html>`, `<head>`, and outer padding.

---

## Rendering pipeline

```text
OtpTemplateContext
    → EmailTemplateRenderer.renderOtp()
        1. Load templates (cached in memory after first read)
        2. Build variable maps (plain vs HTML)
        3. Replace {{key}} in subject, plain body, HTML fragment
        4. Inject HTML fragment into layout as {{body}}
        5. Return RenderedEmail(subject, textPlain, textHtml)
```

Implementation: `com.univoyage.email.template.EmailTemplateRenderer`.

Substitution is simple `{{variable}}` string replace — not a full templating engine. **Variable names must match exactly.**

---

## Template variables reference

### OTP (`OtpTemplateContext`)

| Variable | Source | Example | In subject | In plain | In HTML |
|----------|--------|---------|------------|----------|---------|
| `productName` | `app.email.product-name` | `UniVoyage` | ✓ | ✓ | ✓ (escaped) |
| `purposeLabel` | Purpose enum | `Sign in` | ✓ | ✓ | ✓ |
| `purposeAction` | Lowercase label | `sign in` | — | — | ✓ (sentence) |
| `code` | Generated 6 digits | `482910` | — | ✓ | ✓ (large display) |
| `minutesToExpire` | `app.auth.otp.ttl` | `10` | — | ✓ | ✓ |

### Purpose → copy mapping (code)

| `EmailOtpPurpose` | `purposeLabel` | `purposeAction` |
|-------------------|----------------|-----------------|
| `LOGIN` | Sign in | sign in |
| `REGISTER` | Complete registration | complete registration |
| `PASSWORD_RESET` | Reset your password | reset your password |

To change wording, edit `OtpEmailNotificationService.purposeLabel()` / `purposeAction()` **or** make templates purpose-agnostic and rely only on `{{purposeLabel}}`.

### Layout-only

| Variable | Set by | Description |
|----------|--------|-------------|
| `body` | Renderer | Rendered inner HTML fragment |

---

## Shared layout (`layout.html`)

Current structure:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="… background #f6f7f9; padding 24px …">
  <div style="max-width:480px; margin:0 auto; background:#fff; border-radius:12px; padding:32px; border:1px solid #e5e7eb;">
{{body}}
  </div>
</body>
</html>
```

Exact styles are in `layout.html` — edit there for global chrome changes.

### Layout responsibilities

| Element | Purpose |
|---------|---------|
| `lang="en"` | Screen readers; change if i18n added |
| Viewport meta | Mobile scaling |
| Outer `#f6f7f9` background | Subtle frame in clients that support body bg |
| Inner white card | Content focus, 480px max width |
| `{{body}}` | **Only** injection point for per-mail content |

### What not to put in layout

- OTP code (belongs in `otp-body.*`)
- Purpose-specific legal text (put in body or footer snippet per mail type)
- Images hosted on unstable URLs (use CDN with HTTPS)

---

## OTP email templates

### Subject — `otp-subject.txt`

```text
Your {{productName}} {{purposeLabel}} code
```

Example output: `Your UniVoyage Sign in code`

**Guidelines:**

- Under ~60 characters when possible
- No emoji in v1 (inconsistent rendering)
- Product name first for recognition in inbox list

---

### Plain text — `otp-body.txt`

```text
Your {{productName}} verification code

Purpose: {{purposeLabel}}
Code: {{code}}

This code expires in {{minutesToExpire}} minutes. Do not share it with anyone.
If you did not request this email, you can ignore it.
```

**Guidelines:**

- Code on its own line for easy copy-paste on mobile
- Expiry stated in full minutes (matches `ttl` config)
- Standard “ignore if not you” line for abuse clarity

---

### HTML fragment — `otp-body.html`

Current design (inline styles):

| Block | Style intent |
|-------|----------------|
| Product label | 14px, gray `#6b7280` |
| Title | 22px, “Verification code” |
| Instruction | Body gray `#374151`, includes `{{purposeAction}}` |
| **Code block** | 32px, bold, letter-spacing 6px, centered, `#f3f4f6` background, 8px radius |
| Footer | 13px muted, security warning |

```html
<p style="…">{{productName}}</p>
<h1 style="…">Verification code</h1>
<p>… Use this code to {{purposeAction}}. … <strong>{{minutesToExpire}} minutes</strong>.</p>
<p style="font-size:32px; …">{{code}}</p>
<p style="…">Never share this code. …</p>
```

**Design intent:** code is the visual hero — users scan one large number.

---

## Plain text vs HTML

| Aspect | Plain | HTML |
|--------|-------|------|
| Escaping | None (plain text) | `& < > "` escaped via `escapeHtml()` |
| Structure | Newlines | `<p>`, `<h1>` sparingly |
| Code display | `Code: 123456` | Large padded block |
| Testing | `EmailTemplateRendererTest` | Same + visual check in client |

Both versions **must** convey the same facts: product, purpose, code, expiry, ignore-if-not-you.

---

## Branding and visual system

Current palette (align frontend marketing when possible):

| Token | Hex | Usage |
|-------|-----|--------|
| Page background | `#f6f7f9` | Outer body |
| Card background | `#ffffff` | Inner card |
| Card border | `#e5e7eb` | 1px border |
| Text primary | `#111111` | Headings (in layout body) |
| Text secondary | `#374151` | Body copy |
| Text muted | `#6b7280` | Labels, footer |
| Code surface | `#f3f4f6` | OTP code background |

### Typography

```css
font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
line-height: 1.5;
```

No custom font files in email.

### Spacing

- Card padding: `32px`
- Section margin bottom: `16px`–`24px`
- Code block padding: `16px`

### Logo (future)

If adding a logo:

- Hosted on HTTPS CDN you control
- `alt="UniVoyage"` + width/height attributes
- Max height ~40px in header above `{{body}}`
- Add to `layout.html`, not per-mail body

### `EMAIL_PRODUCT_NAME`

Set per environment:

```env
EMAIL_PRODUCT_NAME=UniVoyage
```

Used in subject and body — keep in sync with app display name.

---

## Accessibility and clients

| Guideline | Implementation |
|-----------|----------------|
| Language | `lang="en"` on `<html>` |
| Contrast | Gray text ≥ `#6b7280` on white (check WCAG if changing) |
| Not color-only | Code shown as digits + label “Verification code” |
| Plain-text fallback | Required; never HTML-only |
| Touch targets | N/A for OTP (no button); future buttons min 44px height |
| Screen readers | Meaningful `<h1>`; avoid “click here” |

### Client testing matrix (manual)

Before major template release, send test mail and open in:

- [ ] Gmail (web + mobile app)
- [ ] Apple Mail (iOS)
- [ ] Outlook (web or desktop)
- [ ] One Android client (Gmail app)

Watch for: broken padding, clipped code block, dark mode inversion (some clients force colors).

---

## Security in templates

| Rule | Detail |
|------|--------|
| HTML escape | All dynamic values in HTML path use `EmailTemplateRenderer.escapeHtml()` |
| No raw user input in templates | Email address is not rendered in body |
| Code in HTML | Escaped like any string (digits safe) |
| No JavaScript | Never `<script>`, external CSS, or forms |
| Links | When adding reset links, use HTTPS only; full URL from config |
| Logging | Never log rendered body or `{{code}}` |

If product name were ever user-supplied (it is not today), escaping prevents XSS in HTML viewers that execute inline content.

---

## Adding a new mail type

Example: **password reset link** (future).

### 1. Add template files

```text
reset-subject.txt
reset-body.txt
reset-body.html
```

### 2. Add context record

```java
public record ResetTemplateContext(
    String productName,
    String resetLink,
    long minutesToExpire) {}
```

### 3. Extend renderer

```java
public RenderedEmail renderPasswordReset(ResetTemplateContext context) {
  // load reset-* paths
  // apply variables
  // wrap HTML in layout via {{body}}
}
```

### 4. Add notification adapter

```java
@Component
public class PasswordResetEmailService {
  public void send(String email, String token) {
    String link = baseUrl + "/reset?token=" + token;
    RenderedEmail rendered = renderer.renderPasswordReset(...);
    emailDeliveryService.send(OutboundEmailMessage.builder()...);
  }
}
```

**Do not** add provider-specific code — only `EmailDeliveryService.send`.

### 5. Tests

- Unit: `EmailTemplateRendererTest` with fixture context
- Integration: capturing provider asserts subject contains “password” and body contains link host (not token in logs)

### 6. Design doc update

Add section to this file describing new variables and preview screenshots.

---

## Preview and local testing

### Unit test (fastest)

```java
OtpTemplateContext ctx = new OtpTemplateContext(
    "UniVoyage", "Sign in", "sign in", "918273", 10);
RenderedEmail email = renderer.renderOtp(ctx);
// assert subject, plain contains code, HTML contains escaped values
```

See `EmailTemplateRendererTest`.

### Integration with capturing provider

`OtpEmailDeliveryIntegrationTest` sends through `CapturingEmailProvider` — inspect `subject`, `textPlain`, `textHtml` without SMTP.

### SMTP / real inbox

```env
EMAIL_PROVIDER=smtp
# … Spring Mail vars
```

Trigger `POST /api/auth/otp/request` in dev — **do not** log response body containing codes.

### Temporary HTML preview (developer workflow)

1. Run test that writes `rendered.textHtml()` to `target/email-preview.html`
2. Open in browser

(Optional: add a dev-only endpoint behind profile — not recommended for production.)

---

## Template release checklist

- [ ] Plain and HTML content match (same code, expiry, purpose)
- [ ] New copy reviewed for en-only grammar (or i18n plan documented)
- [ ] HTML variables escaped; plain uses raw values appropriately
- [ ] Subject line length reasonable on mobile
- [ ] `layout.html` unchanged or regression-tested across mail types
- [ ] `EmailTemplateRendererTest` updated
- [ ] Visual check in Gmail + one other client
- [ ] No OTP/code in log statements added during development
- [ ] `EMAIL_PRODUCT_NAME` documented if default branding changes

---

## Quick reference — current file contents

**`otp-subject.txt`**

```text
Your {{productName}} {{purposeLabel}} code
```

**`otp-body.txt`** — see [Plain text](#plain-text--otp-bodytxt) above.

**`otp-body.html`** — see [HTML fragment](#html-fragment--otp-bodyhtml) above.

**`layout.html`** — gray page, white 480px card, `{{body}}` center.

For code-level changes, edit files under `src/main/resources/templates/email/` and `EmailTemplateRenderer.java` paths/constants if filenames change.