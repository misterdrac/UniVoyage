package com.univoyage.auth.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.mock.web.MockHttpServletRequest;

import static org.assertj.core.api.Assertions.assertThat;

class PublicApiRequestMatcherTest {

  private PublicApiRequestMatcher matcher;

  @BeforeEach
  void setUp() {
    matcher = new PublicApiRequestMatcher();
  }

  @ParameterizedTest(name = "skip {0} {1}")
  @CsvSource({"/api/auth/login,POST,true", "/api/auth/google/callback,POST,true",
      "/api/quiz/recommend,POST,true", "/api/contact,POST,true", "/api/destinations,GET,true",
      "/api/destinations/1/reviews,GET,true", "/api/reference/countries,GET,true",
      "/actuator/health,GET,true", "/api/admin/destinations,GET,false",
      "/api/admin/destinations,POST,false", "/api/destinations,POST,false", "/api/trips,GET,false",
      "/api/auth/me,GET,false"})
  @DisplayName("JWT skip matches SecurityConfiguration public routes only")
  void shouldSkipJwtProcessing(String path, String method, boolean expected) {
    MockHttpServletRequest request = new MockHttpServletRequest(method, path);
    assertThat(matcher.shouldSkipJwtProcessing(request)).isEqualTo(expected);
  }
}
