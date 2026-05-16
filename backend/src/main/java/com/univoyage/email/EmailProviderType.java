package com.univoyage.email;

/**
 * Outbound email transport implementations selectable via
 * {@code app.email.provider}.
 */
public enum EmailProviderType {
  LOGGING, SMTP, SENDGRID, RESEND, POSTMARK
}
