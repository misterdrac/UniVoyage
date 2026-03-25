package com.univoyage.currency.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
@EnableConfigurationProperties(ExchangeRateApiProperties.class)
public class CurrencyConfig {

    @Bean
    public RestClient exchangeRateRestClient() {
        return RestClient.builder().build();
    }
}
