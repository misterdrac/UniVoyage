const SENSITIVE_PATTERNS: RegExp[] = [
  /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g,
  /\b(?:refresh_token|access_token|id_token)=["']?[^\s"'&]+/gi,
  /\b(?:code|state|token)=["']?[^\s"'&]+/gi,
  /\b\d{6}\b/g,
];

function redactString(input: string): string {
  let out = input;
  for (const pattern of SENSITIVE_PATTERNS) {
    out = out.replace(pattern, "[redacted]");
  }
  return out;
}

function redactUnknown(value: unknown): unknown {
  if (typeof value === "string") return redactString(value);
  if (value instanceof Error) {
    return new Error(redactString(value.message), { cause: value.cause });
  }
  if (Array.isArray(value)) return value.map(redactUnknown);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, redactUnknown(v)]),
    );
  }
  return value;
}

function formatForLog(value: unknown): string {
  if (typeof value === "string") return redactString(value);
  if (value instanceof Error) return redactString(value.message);
  try {
    return redactString(JSON.stringify(redactUnknown(value)));
  } catch {
    return "[redacted]";
  }
}

/** Logs auth failures without OTP codes, reset tokens, or JWT material. */
export function safeAuthError(message: string, ...details: unknown[]): void {
  if (details.length === 0) {
    console.error(message);
    return;
  }
  console.error(message, ...details.map(formatForLog));
}
