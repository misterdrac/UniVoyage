package com.univoyage.email;

import com.univoyage.auth.otp.EmailOtpPurpose;
import com.univoyage.auth.otp.OtpEmailNotificationService;
import com.univoyage.auth.config.OtpSecurityProperties;
import com.univoyage.email.config.EmailProperties;
import com.univoyage.email.provider.CapturingEmailProvider;
import com.univoyage.email.template.EmailTemplateRenderer;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.Duration;

import static org.assertj.core.api.Assertions.assertThat;

class OtpEmailDeliveryIntegrationTest {

  private final CapturingEmailProvider capturing = new CapturingEmailProvider();
  private OtpEmailNotificationService notificationService;

  @BeforeEach
  void setUp() {
    capturing.clear();
    EmailProperties emailProperties = new EmailProperties();
    emailProperties.setProductName("UniVoyage");
    OtpSecurityProperties otp = new OtpSecurityProperties();
    otp.setTtl(Duration.ofMinutes(10));
    EmailDeliveryService delivery = new EmailDeliveryService(capturing, emailProperties);
    notificationService = new OtpEmailNotificationService(new EmailTemplateRenderer(), delivery,
        emailProperties, otp);
  }

  @Test
  @DisplayName("OTP notification renders and sends without exposing code in provider logs")
  void otpSendUsesTemplate() {
    notificationService.send("user@example.com", EmailOtpPurpose.LOGIN, "918273");

    assertThat(capturing.getSent()).hasSize(1);
    OutboundEmailMessage msg = capturing.getSent().get(0);
    assertThat(msg.getTo()).isEqualTo("user@example.com");
    assertThat(msg.getSubject()).contains("Sign in");
    assertThat(msg.getTextPlain()).contains("918273");
    assertThat(msg.getTextHtml()).contains("918273");
  }
}
