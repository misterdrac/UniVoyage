package com.univoyage.email.template;

/**
 * Variables for OTP email templates. The verification code must not be logged
 * by callers.
 */
public record OtpTemplateContext(String productName, String purposeLabel, String purposeAction,
    String code, long minutesToExpire) {
}
