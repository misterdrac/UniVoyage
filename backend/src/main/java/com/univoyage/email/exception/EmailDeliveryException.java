package com.univoyage.email.exception;

import java.util.UUID;

/**
 * Non-sensitive delivery failure surfaced to callers; details and correlation
 * id are in logs.
 */
public class EmailDeliveryException extends RuntimeException {

  private final UUID errorId;

  public EmailDeliveryException(UUID errorId, String message, Throwable cause) {
    super(message, cause);
    this.errorId = errorId;
  }

  public UUID getErrorId() {
    return errorId;
  }
}
