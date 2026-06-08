/** Dispatched when an admin API returns 403 due to missing JWT tfa claim. */
export const ADMIN_TWO_FACTOR_REQUIRED_EVENT = "univoyage:admin-2fa-required";

export function dispatchAdminTwoFactorRequired() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(ADMIN_TWO_FACTOR_REQUIRED_EVENT));
}

export function isAdminRole(role: string | undefined): boolean {
  return role === "ADMIN" || role === "HEAD_ADMIN";
}

export function isAdminTwoFactorVerified(
  user:
    | {
        role: string;
        twoFactorVerified?: boolean;
      }
    | null
    | undefined,
): boolean {
  if (!user || !isAdminRole(user.role)) return false;
  return user.twoFactorVerified === true;
}
