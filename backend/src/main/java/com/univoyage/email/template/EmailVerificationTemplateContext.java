package com.univoyage.email.template;

public record EmailVerificationTemplateContext(String productName, String verifyLink,
    long minutesToExpire) {
}
