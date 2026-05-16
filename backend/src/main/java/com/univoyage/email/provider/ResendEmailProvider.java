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
@ConditionalOnProperty(prefix = "app.email", name = "provider", havingValue = "resend")
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

    String from = "%s <%s>".formatted(emailProperties.getFromName(), emailProperties.getFrom());
    Map<String, Object> body = Map.of("from", from, "to", List.of(message.getTo()), "subject",
        message.getSubject(), "html", message.getTextHtml(), "text", message.getTextPlain());

    try {
      ResponseEntity<Void> response = emailRestTemplate.postForEntity(API_URL,
          new HttpEntity<>(body, headers), Void.class);
      if (!response.getStatusCode().is2xxSuccessful()) {
        throw new IllegalStateException("Resend returned " + response.getStatusCode());
      }
    } catch (RestClientException e) {
      throw new IllegalStateException("Resend API call failed", e);
    }
  }
}
