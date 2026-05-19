package com.univoyage.auth.otp;

import com.univoyage.auth.config.OtpSecurityProperties;
import com.univoyage.email.EmailDeliveryService;
import com.univoyage.email.OutboundEmailMessage;
import com.univoyage.email.config.EmailProperties;
import com.univoyage.email.template.EmailTemplateRenderer;
import com.univoyage.email.template.OtpTemplateContext;
import com.univoyage.email.template.RenderedEmail;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.time.Duration;

import lombok.RequiredArgsConstructor;

@Component
@Profile("!test")
@RequiredArgsConstructor
public class OtpEmailNotificationService implements OtpNotificationPort {

  private final EmailTemplateRenderer templateRenderer;
  private final EmailDeliveryService emailDeliveryService;
  private final EmailProperties emailProperties;
  private final OtpSecurityProperties otpSecurityProperties;

  @Override
  public void send(String normalizedEmail, EmailOtpPurpose purpose, String plainCode) {
    long minutes = Math.max(1, otpSecurityProperties.getTtl().toMinutes());
    OtpTemplateContext context = new OtpTemplateContext(emailProperties.getProductName(),
        purposeLabel(purpose), purposeAction(purpose), plainCode, minutes);
    RenderedEmail rendered = templateRenderer.renderOtp(context);
    OutboundEmailMessage message = OutboundEmailMessage.builder().to(normalizedEmail)
        .subject(rendered.subject()).textPlain(rendered.textPlain()).textHtml(rendered.textHtml())
        .replyTo(emailProperties.getReplyTo()).build();
    emailDeliveryService.send(message);
  }

  private static String purposeLabel(EmailOtpPurpose purpose) {
    return switch (purpose) {
      case LOGIN -> "Sign in";
      case REGISTER -> "Complete registration";
      case PASSWORD_RESET -> "Reset your password";
      case ADMIN_LOGIN -> "Admin verification";
    };
  }

  private static String purposeAction(EmailOtpPurpose purpose) {
    return purposeLabel(purpose).toLowerCase();
  }
}
