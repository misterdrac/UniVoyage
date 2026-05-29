package com.univoyage.auth.password;

import com.univoyage.auth.config.EmailVerificationSecurityProperties;
import com.univoyage.auth.config.PasswordResetSecurityProperties;
import com.univoyage.email.EmailDeliveryService;
import com.univoyage.email.OutboundEmailMessage;
import com.univoyage.email.config.EmailProperties;
import com.univoyage.email.template.EmailTemplateRenderer;
import com.univoyage.email.template.EmailVerificationTemplateContext;
import com.univoyage.email.template.PasswordResetTemplateContext;
import com.univoyage.email.template.RenderedEmail;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import lombok.RequiredArgsConstructor;

@Component
@Profile("!test")
@RequiredArgsConstructor
public class UserEmailNotificationService implements UserEmailNotificationPort {

  private final EmailTemplateRenderer templateRenderer;
  private final EmailDeliveryService emailDeliveryService;
  private final EmailProperties emailProperties;
  private final PasswordResetSecurityProperties passwordResetProperties;
  private final EmailVerificationSecurityProperties emailVerificationProperties;

  @Override
  public void sendPasswordReset(String normalizedEmail, String rawToken) {
    long minutes = Math.max(1, passwordResetProperties.getTtl().toMinutes());
    String link = buildLink(passwordResetProperties.getFrontendResetUrl(), rawToken);
    RenderedEmail rendered = templateRenderer.renderPasswordReset(
        new PasswordResetTemplateContext(emailProperties.getProductName(), link, minutes));
    dispatch(normalizedEmail, rendered);
  }

  @Override
  public void sendEmailVerification(String normalizedEmail, String rawToken) {
    long minutes = Math.max(1, emailVerificationProperties.getTtl().toMinutes());
    String link = buildLink(emailVerificationProperties.getFrontendVerifyUrl(), rawToken);
    RenderedEmail rendered = templateRenderer.renderEmailVerification(
        new EmailVerificationTemplateContext(emailProperties.getProductName(), link, minutes));
    dispatch(normalizedEmail, rendered);
  }

  private void dispatch(String to, RenderedEmail rendered) {
    OutboundEmailMessage message = OutboundEmailMessage.builder().to(to).subject(rendered.subject())
        .textPlain(rendered.textPlain()).textHtml(rendered.textHtml())
        .replyTo(emailProperties.getReplyTo()).build();
    emailDeliveryService.send(message);
  }

  private static String buildLink(String baseUrl, String rawToken) {
    return UriComponentsBuilder.fromUriString(baseUrl).queryParam("token", rawToken).build()
        .encode().toUriString();
  }
}
