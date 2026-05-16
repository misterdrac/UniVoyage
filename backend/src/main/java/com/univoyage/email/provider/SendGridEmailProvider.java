package com.univoyage.email.provider;

import com.univoyage.email.OutboundEmailMessage;
import com.univoyage.email.config.EmailProperties;

import com.univoyage.email.config.EmailConfiguration;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Component
@ConditionalOnProperty(prefix = "app.email", name = "provider", havingValue = "sendgrid")
public class SendGridEmailProvider implements EmailProvider {

  private static final String API_URL = "https://api.sendgrid.com/v3/mail/send";

  private final RestTemplate emailRestTemplate;
  private final EmailProperties emailProperties;

  public SendGridEmailProvider(
      @Qualifier(EmailConfiguration.EMAIL_REST_TEMPLATE) RestTemplate emailRestTemplate,
      EmailProperties emailProperties) {
    this.emailRestTemplate = emailRestTemplate;
    this.emailProperties = emailProperties;
  }

  @Override
  public void send(OutboundEmailMessage message) {
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    headers.setBearerAuth(emailProperties.getSendgrid().getApiKey());

    Map<String, Object> body = Map.of("personalizations",
        List.of(Map.of("to", List.of(Map.of("email", message.getTo())))), "from",
        Map.of("email", emailProperties.getFrom(), "name", emailProperties.getFromName()),
        "subject", message.getSubject(), "content",
        List.of(Map.of("type", "text/plain", "value", message.getTextPlain()),
            Map.of("type", "text/html", "value", message.getTextHtml())));

    try {
      ResponseEntity<Void> response = emailRestTemplate.postForEntity(API_URL,
          new HttpEntity<>(body, headers), Void.class);
      if (!response.getStatusCode().is2xxSuccessful()) {
        throw new IllegalStateException("SendGrid returned " + response.getStatusCode());
      }
    } catch (RestClientException e) {
      throw new IllegalStateException("SendGrid API call failed", e);
    }
  }
}
