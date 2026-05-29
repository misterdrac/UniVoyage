import { API_CONSTANTS } from "@/lib/constants";

/** Documented client storage for session (XSS-sensitive; see AUTH_REGRESSION_CHECKLIST). */
export const ALLOWED_AUTH_LOCAL_STORAGE_KEYS: ReadonlySet<string> = new Set([
  API_CONSTANTS.AUTH_TOKEN_KEY,
  API_CONSTANTS.USER_KEY,
]);

const FORBIDDEN_KEY_SUBSTRINGS = [
  "otp",
  "refresh",
  "reset",
  "verify",
  "code",
  "state",
] as const;

const FORBIDDEN_VALUE_PATTERNS = [
  /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/,
  /^\d{6}$/,
] as const;

export type TokenLeakFinding = { kind: "key" | "value"; detail: string };

/** Test helper: flags OTP/reset/refresh material outside the reviewed JWT + user cache keys. */
export function findAuthTokenLeaksInLocalStorage(): TokenLeakFinding[] {
  const findings: TokenLeakFinding[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;

    const lower = key.toLowerCase();
    if (!ALLOWED_AUTH_LOCAL_STORAGE_KEYS.has(key)) {
      if (FORBIDDEN_KEY_SUBSTRINGS.some((part) => lower.includes(part))) {
        findings.push({ kind: "key", detail: key });
      }
      continue;
    }

    if (key === API_CONSTANTS.USER_KEY) continue;

    const value = localStorage.getItem(key) ?? "";
    if (FORBIDDEN_VALUE_PATTERNS.some((re) => re.test(value))) {
      findings.push({ kind: "value", detail: key });
    }
  }

  return findings;
}
