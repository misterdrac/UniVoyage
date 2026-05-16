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

import java.util.Map;

@Component
@ConditionalOnProperty(prefix = "app.email", name = "provider", havingValue = "postmark")
public class PostmarkEmailProvider implements EmailProvider {

  private static final String API_URL = "https://api.postmarkapp.com/email";

  private final RestTemplate emailRestTemplate;
  private final EmailProperties emailProperties;

  public PostmarkEmailProvider(
      @Qualifier(EmailConfiguration.EMAIL_REST_TEMPLATE) RestTemplate emailRestTemplate,
      EmailProperties emailProperties) {
    this.emailRestTemplate = emailRestTemplate;
    this.emailProperties = emailProperties;
  }

  @Override
  public void send(OutboundEmailMessage message) {
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    headers.set("X-Postmark-Server-Token", emailProperties.getPostmark().getServerToken());

    Map<String, Object> body = Map.of("From",
        "%s <%s>".formatted(emailProperties.getFromName(), emailProperties.getFrom()), "To",
        message.getTo(), "Subject", message.getSubject(), "TextBody", message.getTextPlain(),
        "HtmlBody", message.getTextHtml());

    try {
      ResponseEntity<Void> response = emailRestTemplate.postForEntity(API_URL,
          new HttpEntity<>(body, headers), Void.class);
      if (!response.getStatusCode().is2xxSuccessful()) {
        throw new IllegalStateException("Postmark returned " + response.getStatusCode());
      }
    } catch (RestClientException e) {
      throw new IllegalStateException("Postmark API call failed", e);
    }
  }
}
