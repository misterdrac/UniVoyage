import * as React from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VALIDATION } from "@/lib/constants";
import type { EmailActionResponse } from "@/services/api/authApi";
import { RetryAfterNotice } from "./RetryAfterNotice";

interface AuthEmailRequestFormProps {
  buttonLabel: string;
  defaultError: string;
  description: string;
  initialEmail?: string;
  requestEmail: (email: string) => Promise<EmailActionResponse>;
  onAccepted: (message: string) => void;
}

export function AuthEmailRequestForm({
  buttonLabel,
  defaultError,
  description,
  initialEmail = "",
  requestEmail,
  onAccepted,
}: AuthEmailRequestFormProps) {
  const descriptionId = React.useId();
  const statusId = React.useId();
  const [email, setEmail] = React.useState(initialEmail);
  const [error, setError] = React.useState("");
  const [retryAfterSeconds, setRetryAfterSeconds] = React.useState<
    number | undefined
  >();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const trimmedEmail = email.trim();
  const isEmailValid = VALIDATION.EMAIL_REGEX.test(trimmedEmail);
  const canSubmit = isEmailValid && !isSubmitting && !retryAfterSeconds;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    setError("");
    setRetryAfterSeconds(undefined);
    const result = await requestEmail(trimmedEmail);
    setIsSubmitting(false);

    if (result.success) {
      onAccepted(result.message || "Check your email for instructions.");
      return;
    }

    setError(result.error || defaultError);
    setRetryAfterSeconds(result.retryAfterSeconds);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="email-request-email" className="text-sm font-medium">
          Email
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="email-request-email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setError("");
              setRetryAfterSeconds(undefined);
            }}
            className="pl-10"
            aria-describedby={`${descriptionId} ${statusId}`}
            disabled={isSubmitting}
            required
          />
        </div>
        <p id={descriptionId} className="text-xs text-muted-foreground">
          {description}
        </p>
      </div>

      <div id={statusId} aria-live="polite" className="min-h-12 text-sm">
        {retryAfterSeconds ? (
          <RetryAfterNotice
            retryAfterSeconds={retryAfterSeconds}
            message="Too many attempts."
            onElapsed={() => {
              setRetryAfterSeconds(undefined);
              setError("");
            }}
          />
        ) : error ? (
          <p role="alert" className="text-center text-destructive">
            {error}
          </p>
        ) : null}
      </div>

      <Button type="submit" className="w-full" disabled={!canSubmit}>
        {isSubmitting ? "Sending..." : buttonLabel}
      </Button>
    </form>
  );
}
