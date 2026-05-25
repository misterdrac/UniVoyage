package com.univoyage.email.provider;

import com.univoyage.email.EmailAddressMasker;
import com.univoyage.email.OutboundEmailMessage;
import com.univoyage.email.config.EmailConfiguration;
import com.univoyage.email.config.EmailProperties;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import lombok.extern.log4j.Log4j2;

@Component
@ConditionalOnProperty(prefix = "app.email", name = "provider", havingValue = "resend")
@Log4j2
public class ResendEmailProvider implements EmailProvider {

  private static final String API_URL = "https://api.resend.com/emails";

  private final RestTemplate emailRestTemplate;
  private final EmailProperties emailProperties;

  public ResendEmailProvider(
      @Qualifier(EmailConfiguration.EMAIL_REST_TEMPLATE) RestTemplate emailRestTemplate,
      EmailProperties emailProperties) {
    this.emailRestTemplate = emailRestTemplate;
    this.emailProperties = emailProperties;
  }

  @Override
  public void send(OutboundEmailMessage message) {
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    headers.setBearerAuth(emailProperties.getResend().getApiKey());

    Map<String, Object> body = new HashMap<>();
    body.put("from", formatFrom());
    body.put("to", List.of(message.getTo()));
    body.put("subject", message.getSubject());
    body.put("html", message.getTextHtml());
    body.put("text", message.getTextPlain());
    String replyTo = message.replyToOrNull();
    if (replyTo == null && emailProperties.getReplyTo() != null
        && !emailProperties.getReplyTo().isBlank()) {
      replyTo = emailProperties.getReplyTo().trim();
    }
    if (replyTo != null) {
      body.put("reply_to", replyTo);
    }

    try {
      ResponseEntity<Void> response = emailRestTemplate.postForEntity(API_URL,
          new HttpEntity<>(body, headers), Void.class);
      if (!response.getStatusCode().is2xxSuccessful()) {
        throw new IllegalStateException("Resend returned " + response.getStatusCode());
      }
      log.info("Email sent via Resend recipient={}", EmailAddressMasker.mask(message.getTo()));
    } catch (RestClientException e) {
      throw new IllegalStateException("Resend API call failed", e);
    }
  }

  private String formatFrom() {
    return "%s <%s>".formatted(emailProperties.getFromName(), emailProperties.getFrom());
  }
}
