package com.univoyage.email;

import com.univoyage.email.config.EmailProperties;
import com.univoyage.email.exception.EmailDeliveryException;
import com.univoyage.email.provider.EmailProvider;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Log4j2
public class EmailDeliveryService {

  private final EmailProvider emailProvider;
  private final EmailProperties emailProperties;

  /**
   * Sends with bounded retries. On failure throws {@link EmailDeliveryException}
   * with a correlation id.
   */
  public void send(OutboundEmailMessage message) {
    int maxAttempts = Math.max(1, emailProperties.getRetry().getMaxAttempts());
    long backoffMs = emailProperties.getRetry().getInitialBackoff().toMillis();
    long maxBackoffMs = emailProperties.getRetry().getMaxBackoff().toMillis();

    UUID errorId = UUID.randomUUID();
    RuntimeException lastFailure = null;

    for (int attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        emailProvider.send(message);
        if (attempt > 1) {
          log.info("Email delivery succeeded after retry attempt={} recipient={}", attempt,
              EmailAddressMasker.mask(message.getTo()));
        }
        return;
      } catch (RuntimeException e) {
        lastFailure = e;
        log.warn(
            "Email delivery attempt failed errorId={} attempt={}/{} recipient={} provider={} reason={}",
            errorId, attempt, maxAttempts, EmailAddressMasker.mask(message.getTo()),
            emailProperties.getProvider(), EmailFailures.summarize(e));
        if (!EmailFailures.isRetryable(e)) {
          break;
        }
        if (attempt < maxAttempts) {
          sleep(backoffMs);
          backoffMs = Math.min(backoffMs * 2, maxBackoffMs);
        }
      }
    }

    throw new EmailDeliveryException(errorId, "Outbound email delivery failed", lastFailure);
  }

  private static void sleep(long millis) {
    try {
      Thread.sleep(millis);
    } catch (InterruptedException ie) {
      Thread.currentThread().interrupt();
      throw new EmailDeliveryException(UUID.randomUUID(), "Email delivery interrupted", ie);
    }
  }
}
