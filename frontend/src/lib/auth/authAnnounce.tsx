const ANNOUNCER_ID = "auth-live-announcer";

export function announceAuth(message: string): void {
  const el = document.getElementById(ANNOUNCER_ID);
  if (!el) return;
  el.textContent = "";
  window.requestAnimationFrame(() => {
    el.textContent = message;
  });
}

/** Screen-reader region for auth toasts and inline errors (complements Sonner). */
export function AuthLiveAnnouncer() {
  return (
    <div
      id={ANNOUNCER_ID}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    />
  );
}
