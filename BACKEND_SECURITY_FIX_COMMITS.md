# Backend security fixes — plan commitova (3)

**Branch:** `feature/security-authentication`  
**Sve naredbe iz roota** (`UniVoyage/`).  
**Redoslijed 1 → 3** — svaki commit gradi na prethodnom.

Prije početka:

```powershell
git status
```

Pre-commit hook ponovno stagea samo datoteke iz **trenutnog** commita. Nakon svakog `git add` provjeri:

```powershell
git diff --cached --name-only
```

---

## Commit 1 — JWT filter: precizni public pathovi (bez `contains`)

**Što:** `PublicApiRequestMatcher` usklađen sa `SecurityConfiguration`; `/api/admin/destinations` više ne preskače JWT; `POST /api/destinations` s cookie + CSRF radi; constant-time CSRF usporedba.

```powershell
git add backend/src/main/java/com/univoyage/auth/security/PublicApiRequestMatcher.java backend/src/main/java/com/univoyage/auth/security/JwtAuthenticationFilter.java backend/src/test/java/com/univoyage/auth/security/PublicApiRequestMatcherTest.java

git diff --cached --name-only

git commit -m "fix(security): align JWT filter skip paths with SecurityConfiguration" -m "- Add PublicApiRequestMatcher with AntPathMatcher (no path.contains false positives)" -m "- Process JWT and CSRF for admin routes and authenticated POST /api/destinations" -m "- Compare CSRF secrets with MessageDigest.isEqual"
```

---

## Commit 2 — Quiz: IP rate limit (Gemini cost protection)

**Što:** Javni `POST /api/quiz/recommend` ograničen po IP-u (default 10/min); 429 + `Retry-After`.

```powershell
git add backend/src/main/java/com/univoyage/quiz/config/QuizLimitProperties.java backend/src/main/java/com/univoyage/quiz/security/QuizIpRateLimiter.java backend/src/main/java/com/univoyage/quiz/controller/QuizController.java backend/src/main/resources/application.yml backend/src/test/java/com/univoyage/quiz/controller/QuizRateLimitIntegrationTest.java

git diff --cached --name-only

git commit -m "fix(security): rate-limit public quiz recommendations by IP" -m "- Add app.quiz ip-max-attempts and ip-window configuration" -m "- Return 429 with Retry-After when limit exceeded" -m "- Add QuizRateLimitIntegrationTest"
```

---

## Commit 3 — API: generičke 500 poruke + testovi

**Što:** `IllegalStateException` i profil update ne cure interne poruke u JSON; trip currency testovi očekuju generičku poruku.

```powershell
git add backend/src/main/java/com/univoyage/exception/GlobalExceptionHandler.java backend/src/main/java/com/univoyage/user/controller/UserController.java backend/src/test/java/com/univoyage/trip/controller/TripControllerCurrencyIntegrationTest.java backend/src/test/java/com/univoyage/trip/controller/TripControllerCurrencyWebMvcTest.java

git diff --cached --name-only

git commit -m "fix(security): stop leaking internal errors in API responses" -m "- Log IllegalStateException server-side and return generic 500 body" -m "- Hide profile update exception details from clients" -m "- Update trip currency integration tests for generic error message"
```

---

## Nakon svih commitova

```powershell
git status
git log -3 --oneline
```

**Provjera:**

```powershell
cd backend
.\mvnw.cmd test
```

Ručno (Docker workflow):

1. `cd backend` → `npm run dev` — admin API s JWT radi; `GET /api/destinations` javan.
2. `POST /api/quiz/recommend` 11× brzo → 11. zahtjev **429**.
3. Health: http://localhost:8080/actuator/health

---

## Mapiranje

| Commit | Fix |
|--------|-----|
| 1 | JWT filter bypass (`/api/admin/destinations`, POST destinations) |
| 2 | Quiz Gemini abuse (rate limit) |
| 3 | Info disclosure (GlobalExceptionHandler, UserController) |
