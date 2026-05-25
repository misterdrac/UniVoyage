package com.univoyage.auth.otp;

import com.univoyage.auth.dto.AuthPayload;

import java.time.Duration;

public sealed interface OtpVerifyOutcome {

  record Success(AuthPayload auth) implements OtpVerifyOutcome {
  }

  record InvalidCode(int attemptsRemaining) implements OtpVerifyOutcome {
  }

  record NoActiveChallenge() implements OtpVerifyOutcome {
  }

  record Expired() implements OtpVerifyOutcome {
  }

  record AlreadyConsumed() implements OtpVerifyOutcome {
  }

  record Locked(Duration retryAfter) implements OtpVerifyOutcome {
  }

  /**
   * Valid code but account cannot be completed (e.g. REGISTER without
   * auto-provision).
   */
  record CannotCompleteSignIn() implements OtpVerifyOutcome {
  }
}
