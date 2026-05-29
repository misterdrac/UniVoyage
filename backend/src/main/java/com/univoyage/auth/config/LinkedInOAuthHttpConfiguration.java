package com.univoyage.auth.config;

import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;

@Configuration
public class LinkedInOAuthHttpConfiguration {

  public static final String LINKEDIN_OAUTH_REST_TEMPLATE = "linkedinOAuthRestTemplate";

  @Bean(name = LINKEDIN_OAUTH_REST_TEMPLATE)
  public RestTemplate linkedinOAuthRestTemplate(RestTemplateBuilder builder) {
    return builder.setConnectTimeout(Duration.ofSeconds(10)).setReadTimeout(Duration.ofSeconds(10))
        .build();
  }
}
