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
import java.util.Map;

import lombok.extern.log4j.Log4j2;

@Component
@ConditionalOnProperty(prefix = "app.email", name = "provider", havingValue = "postmark")
@Log4j2
public class PostmarkEmailProvider implements EmailProvider {

  private static final String API_URL = "https://api.postmarkapp.com/email";
  private static final String MESSAGE_STREAM = "outbound";

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

    Map<String, Object> body = new HashMap<>();
    body.put("From", formatFrom());
    body.put("To", message.getTo());
    body.put("Subject", message.getSubject());
    body.put("TextBody", message.getTextPlain());
    body.put("HtmlBody", message.getTextHtml());
    body.put("MessageStream", MESSAGE_STREAM);
    String replyTo = message.replyToOrNull();
    if (replyTo == null && emailProperties.getReplyTo() != null
        && !emailProperties.getReplyTo().isBlank()) {
      replyTo = emailProperties.getReplyTo().trim();
    }
    if (replyTo != null) {
      body.put("ReplyTo", replyTo);
    }

    try {
      ResponseEntity<Void> response = emailRestTemplate.postForEntity(API_URL,
          new HttpEntity<>(body, headers), Void.class);
      if (!response.getStatusCode().is2xxSuccessful()) {
        throw new IllegalStateException("Postmark returned " + response.getStatusCode());
      }
      log.info("Email sent via Postmark recipient={}", EmailAddressMasker.mask(message.getTo()));
    } catch (RestClientException e) {
      throw new IllegalStateException("Postmark API call failed", e);
    }
  }

  private String formatFrom() {
    return "%s <%s>".formatted(emailProperties.getFromName(), emailProperties.getFrom());
  }
}
