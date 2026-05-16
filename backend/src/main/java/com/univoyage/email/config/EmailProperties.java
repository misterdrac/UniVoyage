package com.univoyage.email.config;

import com.univoyage.email.EmailProviderType;

import org.springframework.boot.context.properties.ConfigurationProperties;

import lombok.Getter;
import lombok.Setter;

import java.time.Duration;

@ConfigurationProperties(prefix = "app.email")
@Getter
@Setter
public class EmailProperties {

  private EmailProviderType provider = EmailProviderType.LOGGING;

  private String from = "";
  private String fromName = "UniVoyage";
  private String replyTo = "";
  private String productName = "UniVoyage";

  private boolean testConnectionOnStartup = false;

  private Retry retry = new Retry();

  private SendGrid sendgrid = new SendGrid();
  private Resend resend = new Resend();
  private Postmark postmark = new Postmark();

  @Getter
  @Setter
  public static class Retry {
    private int maxAttempts = 3;
    private Duration initialBackoff = Duration.ofSeconds(1);
    private Duration maxBackoff = Duration.ofSeconds(10);
  }

  @Getter
  @Setter
  public static class SendGrid {
    private String apiKey = "";
  }

  @Getter
  @Setter
  public static class Resend {
    private String apiKey = "";
  }

  @Getter
  @Setter
  public static class Postmark {
    private String serverToken = "";
  }
}
