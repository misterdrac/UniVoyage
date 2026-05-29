package com.univoyage.email.template;

public record PasswordResetTemplateContext(String productName, String resetLink,
    long minutesToExpire) {
}
