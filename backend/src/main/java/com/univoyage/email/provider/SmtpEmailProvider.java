package com.univoyage.email.provider;

import com.univoyage.email.EmailAddressMasker;
import com.univoyage.email.OutboundEmailMessage;
import com.univoyage.email.config.EmailProperties;

import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Component
@ConditionalOnProperty(prefix = "app.email", name = "provider", havingValue = "smtp")
@ConditionalOnBean(JavaMailSender.class)
@RequiredArgsConstructor
@Log4j2
public class SmtpEmailProvider implements EmailProvider {

  private final JavaMailSender mailSender;
  private final EmailProperties emailProperties;

  @Override
  public void send(OutboundEmailMessage message) {
    try {
      MimeMessage mime = mailSender.createMimeMessage();
      MimeMessageHelper helper = new MimeMessageHelper(mime, true, "UTF-8");
      helper.setFrom(formatFrom());
      helper.setTo(message.getTo());
      helper.setSubject(message.getSubject());
      helper.setText(message.getTextPlain(), message.getTextHtml());
      String replyTo = message.replyToOrNull();
      if (replyTo != null) {
        helper.setReplyTo(replyTo);
      } else if (emailProperties.getReplyTo() != null && !emailProperties.getReplyTo().isBlank()) {
        helper.setReplyTo(emailProperties.getReplyTo().trim());
      }
      mailSender.send(mime);
      log.info("Email sent via SMTP recipient={}", EmailAddressMasker.mask(message.getTo()));
    } catch (Exception e) {
      throw new IllegalStateException("SMTP send failed", e);
    }
  }

  private String formatFrom() {
    String address = emailProperties.getFrom().trim();
    String name = emailProperties.getFromName();
    if (name == null || name.isBlank()) {
      return address;
    }
    return "%s <%s>".formatted(name.trim(), address);
  }
}
