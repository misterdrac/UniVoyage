package com.univoyage.email.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;

@Configuration
public class EmailConfiguration {

  public static final String EMAIL_REST_TEMPLATE = "emailRestTemplate";

  @Bean(EMAIL_REST_TEMPLATE)
  @ConditionalOnMissingBean(name = EMAIL_REST_TEMPLATE)
  public RestTemplate emailRestTemplate(RestTemplateBuilder builder) {
    return builder.setConnectTimeout(Duration.ofSeconds(10)).setReadTimeout(Duration.ofSeconds(15))
        .build();
  }
}
