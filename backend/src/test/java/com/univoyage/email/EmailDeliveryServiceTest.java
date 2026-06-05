package com.univoyage.email;

import com.univoyage.email.config.EmailProperties;
import com.univoyage.email.exception.EmailDeliveryException;
import com.univoyage.email.provider.EmailProvider;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.client.HttpClientErrorException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class EmailDeliveryServiceTest {

  @Test
  @DisplayName("failure throws EmailDeliveryException with error id after retries")
  void failureExposesErrorId() {
    EmailProperties props = new EmailProperties();
    props.getRetry().setMaxAttempts(2);
    props.getRetry().setInitialBackoff(java.time.Duration.ofMillis(1));
    props.getRetry().setMaxBackoff(java.time.Duration.ofMillis(2));

    EmailProvider failing = message -> {
      throw new IllegalStateException("provider down");
    };
    EmailDeliveryService service = new EmailDeliveryService(failing, props);

    assertThatThrownBy(() -> service.send(OutboundEmailMessage.builder().to("user@example.com")
        .subject("Test").textPlain("body").textHtml("<p>body</p>").build()))
        .isInstanceOf(EmailDeliveryException.class)
        .satisfies(ex -> assertThat(((EmailDeliveryException) ex).getErrorId()).isNotNull());
  }

  @Test
  @DisplayName("4xx provider errors are not retried")
  void clientErrorDoesNotRetry() {
    EmailProperties props = new EmailProperties();
    props.getRetry().setMaxAttempts(3);
    props.getRetry().setInitialBackoff(java.time.Duration.ofMillis(1));
    props.getRetry().setMaxBackoff(java.time.Duration.ofMillis(2));

    final int[] attempts = {0};
    EmailProvider failing = message -> {
      attempts[0]++;
      throw new IllegalStateException("Resend API call failed",
          HttpClientErrorException.create(HttpStatus.FORBIDDEN, "Forbidden", null, null, null));
    };
    EmailDeliveryService service = new EmailDeliveryService(failing, props);

    assertThatThrownBy(() -> service.send(OutboundEmailMessage.builder().to("user@example.com")
        .subject("Test").textPlain("body").textHtml("<p>body</p>").build()))
        .isInstanceOf(EmailDeliveryException.class);

    assertThat(attempts[0]).isEqualTo(1);
  }
}
