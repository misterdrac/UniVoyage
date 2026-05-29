package com.univoyage.auth.otp;

import java.time.Duration;

public sealed interface OtpRequestOutcome {

  record Accepted() implements OtpRequestOutcome {
  }

  /** Service-level resend cooldown (distinct from HTTP rate limit). */
  record ResendCooldown(Duration retryAfter) implements OtpRequestOutcome {
  }

  record ResendExhausted() implements OtpRequestOutcome {
  }
}
