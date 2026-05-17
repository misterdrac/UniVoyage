package com.univoyage.email.provider;

import com.univoyage.email.EmailAddressMasker;
import com.univoyage.email.OutboundEmailMessage;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import lombok.extern.log4j.Log4j2;

/**
 * Development default: records dispatch without logging body, subject code, or
 * recipient beyond mask.
 */
@Component
@ConditionalOnProperty(prefix = "app.email", name = "provider", havingValue = "logging")
@Log4j2
public class LoggingEmailProvider implements EmailProvider {

  @Override
  public void send(OutboundEmailMessage message) {
    log.info("Email dispatched (logging provider) recipient={} subjectLength={}",
        EmailAddressMasker.mask(message.getTo()), message.getSubject().length());
  }
}
