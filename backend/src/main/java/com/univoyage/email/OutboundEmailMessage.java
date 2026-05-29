package com.univoyage.email;

import lombok.Builder;
import lombok.Getter;

/**
 * Provider-agnostic outbound message (OTP today; password reset / verification
 * later).
 */
@Getter
@Builder
public class OutboundEmailMessage {

  private final String to;
  private final String subject;
  private final String textPlain;
  private final String textHtml;
  private final String replyTo;

  public String replyToOrNull() {
    return (replyTo == null || replyTo.isBlank()) ? null : replyTo.trim();
  }
}
