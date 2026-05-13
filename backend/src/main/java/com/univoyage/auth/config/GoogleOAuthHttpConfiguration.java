package com.univoyage.auth.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class GoogleOAuthHttpConfiguration {

  public static final String GOOGLE_OAUTH_REST_TEMPLATE = "googleOAuthRestTemplate";

  @Bean(name = GOOGLE_OAUTH_REST_TEMPLATE)
  public RestTemplate googleOAuthRestTemplate() {
    return new RestTemplate();
  }
}
