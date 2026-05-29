# OTP — policy (dev = prod)

Isti OTP defaulti u `application.yml` za lokalni dev i Railway.  
Sve vrijednosti se mogu promijeniti jednom `OTP_*` env varijablom — nema promjene koda.

Puni vodič: [guide.md](guide.md) · Outbound + reset + verify: [email-prod-policy.md](email-prod-policy.md) · Provider: [resend-postmark-setup.md](resend-postmark-setup.md)

---

## Defaulti (dev = prod)

| Pravilo | Default |
|---------|---------|
| Kod vrijedi | 10 min |
| Pauza između resendova | 90 s |
| Max resendova po challengeu | 2 |
| Pogrešni kodovi prije locka | 5 |
| Lock nakon previše pogrešaka | 30 min |
| Request po emailu / 15 min | 3 |
| Request po IP / 15 min | 15 |
| Verify po emailu / 15 min | 5 |
| Verify po IP / 15 min | 20 |
| Auto-registracija na REGISTER verify | off |

HTTP limiter → **429** + `Retry-After`. Per-challenge lock → **429** na verify.

---

## Env (opcionalno — defaulti već u application.yml)

Nije potrebno ništa postaviti osim ako overrideaš. Primjer:

```env
OTP_TTL=PT10M
OTP_RESEND_COOLDOWN=PT90S
OTP_MAX_RESENDS=2
OTP_MAX_VERIFY_ATTEMPTS=5
OTP_VERIFY_LOCK_DURATION=PT30M
OTP_REQUEST_EMAIL_MAX=3
OTP_REQUEST_EMAIL_WINDOW=PT15M
OTP_REQUEST_IP_MAX=15
OTP_REQUEST_IP_WINDOW=PT15M
OTP_VERIFY_EMAIL_MAX=5
OTP_VERIFY_EMAIL_WINDOW=PT15M
OTP_VERIFY_IP_MAX=20
OTP_VERIFY_IP_WINDOW=PT15M
OTP_AUTO_REGISTER_ON_VERIFY=false
```

---

## Brzi presetovi

### Još strože (npr. pod napadom)

```env
OTP_RESEND_COOLDOWN=PT120S
OTP_MAX_RESENDS=1
OTP_MAX_VERIFY_ATTEMPTS=3
OTP_VERIFY_LOCK_DURATION=PT1H
OTP_REQUEST_EMAIL_MAX=2
OTP_REQUEST_IP_MAX=10
OTP_VERIFY_EMAIL_MAX=3
OTP_VERIFY_IP_MAX=15
```

### Blago (veći promet / manje support tiketa)

```env
OTP_RESEND_COOLDOWN=PT60S
OTP_MAX_RESENDS=3
OTP_REQUEST_EMAIL_MAX=5
OTP_VERIFY_EMAIL_MAX=8
```

### Auto-registracija putem OTP-a (samo ako produkt to traži)

```env
OTP_AUTO_REGISTER_ON_VERIFY=true
OTP_AUTO_REGISTER_COUNTRY_CODE=MT
```

Korisnik se kreira tek nakon uspješnog REGISTER verify-a, ne na request.

---

## Env varijable — referenca

| Env | Property | Prod default |
|-----|----------|--------------|
| `OTP_TTL` | `ttl` | `PT10M` |
| `OTP_RESEND_COOLDOWN` | `resend-cooldown` | `PT90S` |
| `OTP_MAX_RESENDS` | `max-resends-per-challenge` | `2` |
| `OTP_MAX_VERIFY_ATTEMPTS` | `max-verify-attempts-per-challenge` | `5` |
| `OTP_VERIFY_LOCK_DURATION` | `verify-lock-duration` | `PT30M` |
| `OTP_REQUEST_EMAIL_MAX` | `request-email-max-attempts` | `3` |
| `OTP_REQUEST_EMAIL_WINDOW` | `request-email-window` | `PT15M` |
| `OTP_REQUEST_IP_MAX` | `request-ip-max-attempts` | `15` |
| `OTP_REQUEST_IP_WINDOW` | `request-ip-window` | `PT15M` |
| `OTP_VERIFY_EMAIL_MAX` | `verify-email-max-attempts` | `5` |
| `OTP_VERIFY_EMAIL_WINDOW` | `verify-email-window` | `PT15M` |
| `OTP_VERIFY_IP_MAX` | `verify-ip-max-attempts` | `20` |
| `OTP_VERIFY_IP_WINDOW` | `verify-ip-window` | `PT15M` |
| `OTP_AUTO_REGISTER_ON_VERIFY` | `auto-register-on-verify` | `false` |
| `OTP_AUTO_REGISTER_COUNTRY_CODE` | `auto-register-country-code` | `MT` |

Vrijednosti trajanja koriste ISO-8601: `PT10M`, `PT90S`, `PT1H`.

---

## Frontend

- Na **429** čitaj header `Retry-After` (sekunde) i onemogući gumb do isteka.
- Na **request** uvijek prikaži istu poruku uspjeha (anti-enumeration).
- Na **verify** generička poruka za 400: „Invalid or expired verification code.”

---

## Više instanci (Railway scale)

Rate limiteri su **in-memory po instanci**. Ako imaš N replika, efektivni limit je otprilike `N × cap`. Za globalni limit kasnije: API gateway ili Redis.

---

## Smoke test nakon deploya

1. `POST /api/auth/otp/request` → 200, mail stigne.
2. Četiri brza resenda → četvrti ili peti može vratiti **429** (cooldown / email cap).
3. 5+ pogrešnih kodova na verify → **429** lock.
4. Logovi: nema plaintext OTP-a; `OTP delivery failed errorId=` samo ako email padne.
