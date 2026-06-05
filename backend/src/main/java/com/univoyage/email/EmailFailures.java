package com.univoyage.email;

import org.springframework.web.client.HttpStatusCodeException;

/** Compact failure messages for email delivery logs (no full stack traces). */
public final class EmailFailures {

  private static final int MAX_REASON_LENGTH = 320;

  private EmailFailures() {
  }

  public static boolean isRetryable(Throwable failure) {
    Throwable current = failure;
    while (current != null) {
      if (current instanceof HttpStatusCodeException http) {
        return !http.getStatusCode().is4xxClientError();
      }
      current = current.getCause();
    }
    return true;
  }

  public static String summarize(Throwable failure) {
    if (failure == null) {
      return "unknown";
    }
    Throwable root = failure;
    while (root.getCause() != null) {
      root = root.getCause();
    }
    String message = root.getMessage();
    if (message == null || message.isBlank()) {
      return root.getClass().getSimpleName();
    }
    String normalized = message.replaceAll("\\s+", " ").trim();
    if (normalized.length() <= MAX_REASON_LENGTH) {
      return normalized;
    }
    return normalized.substring(0, MAX_REASON_LENGTH - 3) + "...";
  }
}
