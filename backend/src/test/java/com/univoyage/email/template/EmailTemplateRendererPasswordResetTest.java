package com.univoyage.email.template;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class EmailTemplateRendererPasswordResetTest {

  private final EmailTemplateRenderer renderer = new EmailTemplateRenderer();

  @Test
  void rendersPasswordResetWithoutLeakingUnescapedHtml() {
    RenderedEmail email = renderer.renderPasswordReset(
        new PasswordResetTemplateContext("UniVoyage", "https://app.test/reset?token=abc", 60));

    assertThat(email.subject()).contains("UniVoyage");
    assertThat(email.textPlain()).contains("https://app.test/reset?token=abc");
    assertThat(email.textHtml()).contains("Reset password");
    assertThat(email.textHtml()).doesNotContain("{{resetLink}}");
  }
}
