package com.univoyage.email.template;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class EmailTemplateRendererTest {

  private final EmailTemplateRenderer renderer = new EmailTemplateRenderer();

  @Test
  @DisplayName("renders OTP templates with fixture context")
  void rendersOtpFromFixture() {
    OtpTemplateContext context = new OtpTemplateContext("UniVoyage Test", "Sign in", "sign in",
        "739201", 10);

    RenderedEmail email = renderer.renderOtp(context);

    assertThat(email.subject()).contains("UniVoyage Test").contains("Sign in");
    assertThat(email.textPlain()).contains("739201").contains("10 minutes");
    assertThat(email.textHtml()).contains("739201").contains("sign in");
  }

  @Test
  @DisplayName("HTML escapes special characters in code")
  void htmlEscapesCode() {
    OtpTemplateContext context = new OtpTemplateContext("App", "Login", "log in", "12<3>&", 5);

    RenderedEmail email = renderer.renderOtp(context);

    assertThat(email.textPlain()).contains("12<3>&");
    assertThat(email.textHtml()).contains("12&lt;3&gt;&amp;");
    assertThat(email.textHtml()).doesNotContain("12<3>");
  }
}
