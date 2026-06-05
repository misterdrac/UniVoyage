import { APP_VERSION_LABEL } from "@/config/version";
import { cn } from "@/lib/utils";

/** Displays app semver (e.g. v1.0.1) — single source from package.json. */
export function PageFooterVersion({ className }: { className?: string }) {
  return (
    <p
      className={cn(
        "text-xs sm:text-sm font-medium text-muted-foreground tabular-nums",
        className,
      )}
      aria-label={`Application version ${APP_VERSION_LABEL}`}
    >
      {APP_VERSION_LABEL}
    </p>
  );
}
