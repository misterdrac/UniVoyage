import type { SignInMethod } from "@/types/auth";

const LABELS: Record<string, string> = {
  password: "Email & password",
  google: "Google",
  github: "GitHub",
  linkedin: "LinkedIn",
  email_otp: "Email code",
};

export function signInMethodLabel(method?: SignInMethod | null): string {
  if (!method) return "Unknown";
  return LABELS[method] ?? method.charAt(0).toUpperCase() + method.slice(1);
}
