package com.univoyage.email.config;

import com.univoyage.email.EmailProviderType;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Profile;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Component
@Profile("!test")
@RequiredArgsConstructor
@Log4j2
public class EmailStartupValidator {

  private final EmailProperties emailProperties;

  @Value("${spring.mail.host:}")
  private String mailHost;

  @Autowired(required = false)
  private JavaMailSender javaMailSender;

  @PostConstruct
  void validate() {
    if (emailProperties.getFrom() == null || emailProperties.getFrom().isBlank()) {
      if (emailProperties.getProvider() != EmailProviderType.LOGGING) {
        throw new IllegalStateException(
            "app.email.from must be set when provider is not logging (EMAIL_FROM).");
      }
      return;
    }

    switch (emailProperties.getProvider()) {
      case SMTP -> validateSmtp();
      case SENDGRID -> requireSecret(emailProperties.getSendgrid().getApiKey(), "SENDGRID_API_KEY");
      case RESEND -> requireSecret(emailProperties.getResend().getApiKey(), "RESEND_API_KEY");
      case POSTMARK ->
        requireSecret(emailProperties.getPostmark().getServerToken(), "POSTMARK_SERVER_TOKEN");
      case LOGGING -> {
        /* no-op */ }
    }
  }

  private void validateSmtp() {
    if (mailHost == null || mailHost.isBlank()) {
      throw new IllegalStateException(
          "app.email.provider=smtp requires spring.mail.host (SPRING_MAIL_HOST).");
    }
    if (emailProperties.isTestConnectionOnStartup()
        && javaMailSender instanceof JavaMailSenderImpl impl) {
      try {
        impl.testConnection();
        log.info("SMTP connection verified for outbound email host={}", mailHost);
      } catch (Exception e) {
        throw new IllegalStateException("SMTP test connection failed", e);
      }
    }
  }

  private static void requireSecret(String value, String envName) {
    if (value == null || value.isBlank()) {
      throw new IllegalStateException("app.email.provider requires " + envName);
    }
  }
}
