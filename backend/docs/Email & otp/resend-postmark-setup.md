# Resend & Postmark — setup za UniVoyage

Korak-po-korak za **produkciju** (Railway + Vercel). Backend već podržava oba preko HTTP API-ja — samo env varijable i DNS.

Preporuka: **Resend** za start (jednostavniji onboarding). **Postmark** ako želiš maksimalnu deliverability za transakcijsku poštu.

---

## Brzi odabir

| | **Resend** | **Postmark** |
|---|------------|--------------|
| Free tier | ~3.000 mail/mj | ~100 mail/mj (trial) |
| DX | Vrlo jednostavan | Malo više koraka (Server) |
| Transakcijska pošta | Da | Specijaliziran |
| Env | `EMAIL_PROVIDER=resend` + `RESEND_API_KEY` | `EMAIL_PROVIDER=postmark` + `POSTMARK_SERVER_TOKEN` |
| Default u `application-prod.yml` | **Da** (`resend`) | Ne |

---

## Zajednički preduvjeti

1. **Domena za slanje** — npr. `mail.tvoj-domen.com` (subdomena, ne glavni marketing domen).
2. **Railway** backend s `SPRING_PROFILES_ACTIVE=prod`.
3. **Nikad** ne commitaj API ključeve — samo Railway Variables.

---

## Opcija A — Resend (preporučeno)

### 1. Account

1. Registracija: [https://resend.com](https://resend.com)
2. **API Keys** → Create → permission **Sending access** (ili Full access za dev).
3. Kopiraj ključ: `re_...`

### 2. Domena

1. **Domains** → Add Domain → npr. `mail.univoyage.com`
2. Resend pokaže DNS zapise (DKIM CNAME + SPF TXT) — dodaj u Cloudflare / Route53 / gdje držiš DNS.
3. Čekaj **Verified** (obično minuta do sat vremena).

### 3. From adresa

Kad je domena verified:

```text
EMAIL_FROM=noreply@mail.univoyage.com
```

Do tada (samo test): Resend dopušta `onboarding@resend.dev` — **ne za produkciju**.

### 4. Railway varijable

```env
SPRING_PROFILES_ACTIVE=prod

EMAIL_PROVIDER=resend
EMAIL_FROM=noreply@mail.tvoj-domen.com
EMAIL_FROM_NAME=UniVoyage
EMAIL_PRODUCT_NAME=UniVoyage
EMAIL_REPLY_TO=support@tvoj-domen.com
RESEND_API_KEY=re_xxxxxxxxxxxxxxxx

APP_FRONTEND_RESET_URL=https://tvoja-app.vercel.app/auth/reset-password
APP_FRONTEND_VERIFY_URL=https://tvoja-app.vercel.app/auth/verify-email
```

### 5. DNS (Resend)

Tipično (točan tekst vidi u Resend dashboardu):

| Tip | Host | Vrijednost |
|-----|------|------------|
| TXT | `mail` ili root subdomene | SPF (npr. `v=spf1 include:amazonses.com ~all` — Resend koristi AWS infrastrukturu) |
| CNAME | `resend._domainkey` | DKIM iz Resenda |

Dodaj **DMARC** (monitoring):

```text
_dmarc.mail.tvoj-domen.com  TXT  "v=DMARC1; p=none; rua=mailto:dmarc@tvoj-domen.com"
```

### 6. Smoke test

1. Deploy backend.
2. `POST /api/auth/otp/request` s pravim emailom.
3. Provjeri inbox + Resend dashboard → **Emails**.
4. Log: `Email sent via Resend recipient=u***@...` (bez koda).

---

## Opcija B — Postmark

### 1. Account

1. Registracija: [https://postmarkapp.com](https://postmarkapp.com)
2. **Servers** → Create Server (npr. `UniVoyage Production`) → tip **Transactional**.
3. **API Tokens** → kopiraj **Server API token**.

### 2. Domena / sender

1. U serveru: **Sender Signatures** ili **Domains** → Add Domain `mail.tvoj-domen.com`.
2. Dodaj DKIM + Return-Path DNS zapise iz Postmarka.
3. Verify.

### 3. Railway varijable

```env
SPRING_PROFILES_ACTIVE=prod

EMAIL_PROVIDER=postmark
EMAIL_FROM=noreply@mail.tvoj-domen.com
EMAIL_FROM_NAME=UniVoyage
EMAIL_PRODUCT_NAME=UniVoyage
EMAIL_REPLY_TO=support@tvoj-domen.com
POSTMARK_SERVER_TOKEN=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

APP_FRONTEND_RESET_URL=https://tvoja-app.vercel.app/auth/reset-password
APP_FRONTEND_VERIFY_URL=https://tvoja-app.vercel.app/auth/verify-email
```

Koristi **Server token**, ne Account token.

### 4. Message stream

Backend šalje na stream **`outbound`** (Postmark default za transakcijsku poštu). Ne mijenjaj osim ako u Postmarku kreiraš custom stream.

### 5. Smoke test

Isto kao Resend — OTP request → mail → log `Email sent via Postmark`.

---

## Lokalni dev (= isti setup kao prod)

```env
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_...
EMAIL_FROM=onboarding@resend.dev
APP_FRONTEND_RESET_URL=http://localhost:5173/auth/reset-password
APP_FRONTEND_VERIFY_URL=http://localhost:5173/auth/verify-email
```

JUnit testovi (`test` profil) i dalje koriste `logging` — bez Resend mreže.

---

## Troubleshooting

| Problem | Resend | Postmark |
|---------|--------|----------|
| Startup: missing API key | Postavi `RESEND_API_KEY` | Postavi `POSTMARK_SERVER_TOKEN` |
| 403 / domain not verified | Domena mora biti Verified | Sender/Domain mora biti verified |
| Mail u spamu | DKIM/SPF/DMARC, topli domen | Isto + Postmark suppression list |
| `EMAIL_FROM` odbijen | Mora biti na verified domeni | Mora matchati signature |
| OTP 200 ali nema maila | Log `errorId=` / Resend dashboard | Activity u Postmark serveru |

---

## Prebacivanje Resend ↔ Postmark

1. Podesi DNS za novog providera (možeš imati oba privremeno).
2. Promijeni Railway:
   - `EMAIL_PROVIDER=postmark` ili `resend`
   - zamijeni secret (`RESEND_API_KEY` ↔ `POSTMARK_SERVER_TOKEN`)
3. Redeploy — **nema promjene koda**.

Puni vodič: [guide.md](guide.md) · Sve prod postavke (rate limiti, reset, verify): [email-prod-policy.md](email-prod-policy.md).
