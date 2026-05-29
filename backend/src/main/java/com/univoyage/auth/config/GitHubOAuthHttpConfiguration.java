package com.univoyage.auth.config;

import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;

@Configuration
public class GitHubOAuthHttpConfiguration {

  public static final String GITHUB_OAUTH_REST_TEMPLATE = "githubOAuthRestTemplate";

  @Bean(name = GITHUB_OAUTH_REST_TEMPLATE)
  public RestTemplate githubOAuthRestTemplate(RestTemplateBuilder builder) {
    return builder.setConnectTimeout(Duration.ofSeconds(10)).setReadTimeout(Duration.ofSeconds(10))
        .build();
  }
}
