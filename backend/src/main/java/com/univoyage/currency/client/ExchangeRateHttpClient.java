package com.univoyage.currency.client;

import com.univoyage.currency.client.dto.ExchangeRatePairApiResponse;
import com.univoyage.currency.config.ExchangeRateApiProperties;
import com.univoyage.exception.ExternalServiceException;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

/**
 * Calls ExchangeRate-API v6 pair endpoint (see https://www.exchangerate-api.com/docs/pair-conversion-requests).
 */
@Component
public class ExchangeRateHttpClient {

    private final RestClient exchangeRateRestClient;
    private final ExchangeRateApiProperties properties;

    public ExchangeRateHttpClient(
            @Qualifier("exchangeRateRestClient") RestClient exchangeRateRestClient,
            ExchangeRateApiProperties properties
    ) {
        this.exchangeRateRestClient = exchangeRateRestClient;
        this.properties = properties;
    }

    public double fetchPairRate(String baseCurrency, String targetCurrency) {
        String key = properties.apiKey();
        if (key == null || key.isBlank()) {
            throw new ExternalServiceException("EXCHANGE_RATE_API_KEY is not configured");
        }
        String uri = "%s/%s/pair/%s/%s".formatted(
                properties.baseUrl(),
                key,
                baseCurrency.toUpperCase(),
                targetCurrency.toUpperCase()
        );
        try {
            ExchangeRatePairApiResponse body = exchangeRateRestClient.get()
                    .uri(uri)
                    .retrieve()
                    .body(ExchangeRatePairApiResponse.class);
            if (body == null) {
                throw new ExternalServiceException("Currency API returned an empty body");
            }
            if (!"success".equalsIgnoreCase(body.getResult())) {
                throw new ExternalServiceException(
                        "Currency API error: " + body.getResult()
                );
            }
            if (body.getConversionRate() == null) {
                throw new ExternalServiceException("Currency API returned no conversion rate");
            }
            return body.getConversionRate();
        } catch (RestClientException e) {
            throw new ExternalServiceException("Currency API request failed", e);
        }
    }
}
