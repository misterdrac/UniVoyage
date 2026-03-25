package com.univoyage.currency.service;

import com.univoyage.currency.client.ExchangeRateHttpClient;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CachedExchangeRateService {

    private final ExchangeRateHttpClient exchangeRateHttpClient;

    @Cacheable(cacheNames = "fxRates", key = "#baseCurrency + ':' + #targetCurrency")
    public double getConversionRate(String baseCurrency, String targetCurrency) {
        return exchangeRateHttpClient.fetchPairRate(baseCurrency, targetCurrency);
    }
}
