package com.univoyage.email.template;

import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.util.StreamUtils;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

@Component
public class EmailTemplateRenderer {

  private static final String LAYOUT_PATH = "templates/email/layout.html";
  private static final String OTP_SUBJECT_PATH = "templates/email/otp-subject.txt";
  private static final String OTP_BODY_TEXT_PATH = "templates/email/otp-body.txt";
  private static final String OTP_BODY_HTML_PATH = "templates/email/otp-body.html";
  private static final String PASSWORD_RESET_SUBJECT_PATH = "templates/email/password-reset-subject.txt";
  private static final String PASSWORD_RESET_BODY_TEXT_PATH = "templates/email/password-reset-body.txt";
  private static final String PASSWORD_RESET_BODY_HTML_PATH = "templates/email/password-reset-body.html";
  private static final String EMAIL_VERIFY_SUBJECT_PATH = "templates/email/email-verify-subject.txt";
  private static final String EMAIL_VERIFY_BODY_TEXT_PATH = "templates/email/email-verify-body.txt";
  private static final String EMAIL_VERIFY_BODY_HTML_PATH = "templates/email/email-verify-body.html";

  private volatile String layoutTemplate;
  private volatile String otpSubjectTemplate;
  private volatile String otpBodyTextTemplate;
  private volatile String otpBodyHtmlTemplate;
  private volatile String passwordResetSubjectTemplate;
  private volatile String passwordResetBodyTextTemplate;
  private volatile String passwordResetBodyHtmlTemplate;
  private volatile String emailVerifySubjectTemplate;
  private volatile String emailVerifyBodyTextTemplate;
  private volatile String emailVerifyBodyHtmlTemplate;

  public RenderedEmail renderOtp(OtpTemplateContext context) {
    Map<String, String> plainVars = toPlainVariables(context);
    Map<String, String> htmlVars = toHtmlVariables(context);
    String subject = apply(load(OTP_SUBJECT_PATH, otpSubjectTemplate, t -> otpSubjectTemplate = t),
        plainVars).trim();
    String textPlain = apply(
        load(OTP_BODY_TEXT_PATH, otpBodyTextTemplate, t -> otpBodyTextTemplate = t), plainVars)
        .trim();
    String innerHtml = apply(
        load(OTP_BODY_HTML_PATH, otpBodyHtmlTemplate, t -> otpBodyHtmlTemplate = t), htmlVars);
    Map<String, String> layoutVars = new HashMap<>(htmlVars);
    layoutVars.put("body", innerHtml);
    String textHtml = apply(load(LAYOUT_PATH, layoutTemplate, t -> layoutTemplate = t), layoutVars);
    return new RenderedEmail(subject, textPlain, textHtml);
  }

  public RenderedEmail renderPasswordReset(PasswordResetTemplateContext context) {
    Map<String, String> plainVars = passwordResetPlainVars(context);
    Map<String, String> htmlVars = passwordResetHtmlVars(context);
    String subject = apply(load(PASSWORD_RESET_SUBJECT_PATH, passwordResetSubjectTemplate,
        t -> passwordResetSubjectTemplate = t), plainVars).trim();
    String textPlain = apply(load(PASSWORD_RESET_BODY_TEXT_PATH, passwordResetBodyTextTemplate,
        t -> passwordResetBodyTextTemplate = t), plainVars).trim();
    String innerHtml = apply(load(PASSWORD_RESET_BODY_HTML_PATH, passwordResetBodyHtmlTemplate,
        t -> passwordResetBodyHtmlTemplate = t), htmlVars);
    Map<String, String> layoutVars = new HashMap<>(htmlVars);
    layoutVars.put("body", innerHtml);
    String textHtml = apply(load(LAYOUT_PATH, layoutTemplate, t -> layoutTemplate = t), layoutVars);
    return new RenderedEmail(subject, textPlain, textHtml);
  }

  public RenderedEmail renderEmailVerification(EmailVerificationTemplateContext context) {
    Map<String, String> plainVars = emailVerifyPlainVars(context);
    Map<String, String> htmlVars = emailVerifyHtmlVars(context);
    String subject = apply(load(EMAIL_VERIFY_SUBJECT_PATH, emailVerifySubjectTemplate,
        t -> emailVerifySubjectTemplate = t), plainVars).trim();
    String textPlain = apply(load(EMAIL_VERIFY_BODY_TEXT_PATH, emailVerifyBodyTextTemplate,
        t -> emailVerifyBodyTextTemplate = t), plainVars).trim();
    String innerHtml = apply(load(EMAIL_VERIFY_BODY_HTML_PATH, emailVerifyBodyHtmlTemplate,
        t -> emailVerifyBodyHtmlTemplate = t), htmlVars);
    Map<String, String> layoutVars = new HashMap<>(htmlVars);
    layoutVars.put("body", innerHtml);
    String textHtml = apply(load(LAYOUT_PATH, layoutTemplate, t -> layoutTemplate = t), layoutVars);
    return new RenderedEmail(subject, textPlain, textHtml);
  }

  private static Map<String, String> passwordResetPlainVars(PasswordResetTemplateContext context) {
    Map<String, String> vars = new HashMap<>();
    vars.put("productName", context.productName());
    vars.put("resetLink", context.resetLink());
    vars.put("minutesToExpire", String.valueOf(context.minutesToExpire()));
    return vars;
  }

  private static Map<String, String> passwordResetHtmlVars(PasswordResetTemplateContext context) {
    Map<String, String> vars = new HashMap<>();
    vars.put("productName", escapeHtml(context.productName()));
    vars.put("resetLink", escapeHtml(context.resetLink()));
    vars.put("minutesToExpire", String.valueOf(context.minutesToExpire()));
    return vars;
  }

  private static Map<String, String> emailVerifyPlainVars(
      EmailVerificationTemplateContext context) {
    Map<String, String> vars = new HashMap<>();
    vars.put("productName", context.productName());
    vars.put("verifyLink", context.verifyLink());
    vars.put("minutesToExpire", String.valueOf(context.minutesToExpire()));
    return vars;
  }

  private static Map<String, String> emailVerifyHtmlVars(EmailVerificationTemplateContext context) {
    Map<String, String> vars = new HashMap<>();
    vars.put("productName", escapeHtml(context.productName()));
    vars.put("verifyLink", escapeHtml(context.verifyLink()));
    vars.put("minutesToExpire", String.valueOf(context.minutesToExpire()));
    return vars;
  }

  private static Map<String, String> toPlainVariables(OtpTemplateContext context) {
    Map<String, String> vars = new HashMap<>();
    vars.put("productName", context.productName());
    vars.put("purposeLabel", context.purposeLabel());
    vars.put("purposeAction", context.purposeAction());
    vars.put("code", context.code());
    vars.put("minutesToExpire", String.valueOf(context.minutesToExpire()));
    return vars;
  }

  private static Map<String, String> toHtmlVariables(OtpTemplateContext context) {
    Map<String, String> vars = new HashMap<>();
    vars.put("productName", escapeHtml(context.productName()));
    vars.put("purposeLabel", escapeHtml(context.purposeLabel()));
    vars.put("purposeAction", escapeHtml(context.purposeAction()));
    vars.put("code", escapeHtml(context.code()));
    vars.put("minutesToExpire", String.valueOf(context.minutesToExpire()));
    return vars;
  }

  static String escapeHtml(String raw) {
    if (raw == null) {
      return "";
    }
    return raw.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"",
        "&quot;");
  }

  private static String apply(String template, Map<String, String> variables) {
    String result = template;
    for (Map.Entry<String, String> entry : variables.entrySet()) {
      result = result.replace("{{" + entry.getKey() + "}}", entry.getValue());
    }
    return result;
  }

  private static String load(String path, String cached,
      java.util.function.Consumer<String> cacheSetter) {
    if (cached != null) {
      return cached;
    }
    try {
      String loaded = StreamUtils.copyToString(new ClassPathResource(path).getInputStream(),
          StandardCharsets.UTF_8);
      cacheSetter.accept(loaded);
      return loaded;
    } catch (IOException e) {
      throw new IllegalStateException("Missing email template: " + path, e);
    }
  }
}
