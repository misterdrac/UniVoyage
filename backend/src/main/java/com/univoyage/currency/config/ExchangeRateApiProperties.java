package com.univoyage.currency.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.currency.exchangerate-api")
public record ExchangeRateApiProperties(
        String apiKey,
        String baseUrl
) {
    public ExchangeRateApiProperties {
        if (baseUrl == null || baseUrl.isBlank()) {
            baseUrl = "https://v6.exchangerate-api.com/v6";
        } else {
            baseUrl = baseUrl.replaceAll("/+$", "");
        }
    }
}
