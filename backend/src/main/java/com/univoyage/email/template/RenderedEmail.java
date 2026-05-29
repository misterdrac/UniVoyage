package com.univoyage.email.template;

public record RenderedEmail(String subject, String textPlain, String textHtml) {
}
