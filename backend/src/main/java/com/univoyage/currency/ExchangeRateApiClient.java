package com.univoyage.currency;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.Map;

@Component
@RequiredArgsConstructor
public class ExchangeRateApiClient {

    private final RestClient restClient = RestClient.builder().build();

    @Value("${app.currency.api.key}")
    private String apiKey;

    @Value("${app.currency.api.base-url:https://v6.exchangerate-api.com/v6}")
    private String baseUrl;

    public double getPairRate(String baseCurrency, String targetCurrency) {
        ExchangeRateApiPairResponse response = restClient.get()
                .uri(baseUrl + "/{key}/pair/{base}/{target}",
                        apiKey, baseCurrency, targetCurrency)
                .retrieve()
                .body(ExchangeRateApiPairResponse.class);

        if (response == null) {
            throw new IllegalStateException("Currency API returned empty response");
        }

        if (!"success".equalsIgnoreCase(response.getResult())) {
            throw new IllegalStateException("Currency API error: " + response.getResult());
        }

        if (response.getConversionRate() == null) {
            throw new IllegalStateException("Currency API returned no conversion rate");
        }

        return response.getConversionRate();
    }

    public static class ExchangeRateApiPairResponse {
        private String result;
        private String baseCode;
        private String targetCode;
        private Double conversionRate;

        public String getResult() { return result; }
        public void setResult(String result) { this.result = result; }

        public String getBaseCode() { return baseCode; }
        public void setBaseCode(String baseCode) { this.baseCode = baseCode; }

        public String getTargetCode() { return targetCode; }
        public void setTargetCode(String targetCode) { this.targetCode = targetCode; }

        public Double getConversionRate() { return conversionRate; }
        public void setConversionRate(Double conversionRate) { this.conversionRate = conversionRate; }
    }
}