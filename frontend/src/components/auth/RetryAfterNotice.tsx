import * as React from "react";
import { Clock, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

interface RetryAfterNoticeProps {
  retryAfterSeconds?: number;
  message: string;
  variant?: "cooldown" | "lockout";
  onElapsed?: () => void;
}

function formatRetryAfter(seconds: number) {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.ceil(seconds / 60);
  return `${minutes} min`;
}

export function RetryAfterNotice({
  retryAfterSeconds,
  message,
  variant = "cooldown",
  onElapsed,
}: RetryAfterNoticeProps) {
  const [remainingSeconds, setRemainingSeconds] = React.useState(
    Math.max(0, Math.ceil(retryAfterSeconds ?? 0)),
  );
  const elapsedRef = React.useRef(false);

  React.useEffect(() => {
    const initialSeconds = Math.max(0, Math.ceil(retryAfterSeconds ?? 0));
    const until = Date.now() + initialSeconds * 1000;
    elapsedRef.current = false;
    setRemainingSeconds(initialSeconds);

    if (initialSeconds <= 0) {
      if (retryAfterSeconds !== undefined) {
        onElapsed?.();
      }
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      const nextSeconds = Math.max(0, Math.ceil((until - Date.now()) / 1000));
      setRemainingSeconds(nextSeconds);
      if (nextSeconds === 0 && !elapsedRef.current) {
        elapsedRef.current = true;
        onElapsed?.();
        window.clearInterval(intervalId);
      }
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [onElapsed, retryAfterSeconds]);

  const Icon = variant === "lockout" ? ShieldAlert : Clock;
  const hasCountdown = remainingSeconds > 0;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm",
        variant === "lockout"
          ? "border-destructive/30 bg-destructive/5 text-destructive"
          : "border-border bg-muted/40 text-muted-foreground",
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span>
        {message}
        {hasCountdown
          ? ` Try again in ${formatRetryAfter(remainingSeconds)}.`
          : ""}
      </span>
    </div>
  );
}
