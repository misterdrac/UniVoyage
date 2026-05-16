package com.univoyage.auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.univoyage.auth.dto.AuthPayload;
import com.univoyage.auth.security.CookieUtils;
import com.univoyage.auth.service.GitHubOAuthService;
import com.univoyage.user.dto.UserDto;
import com.univoyage.user.model.Role;
import com.univoyage.user.model.UserEntity;
import com.univoyage.user.repository.UserRepository;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class GitHubOAuthControllerIntegrationTest {

  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private ObjectMapper objectMapper;

  @MockBean
  private GitHubOAuthService githubOAuthService;

  @Autowired
  private UserRepository userRepository;

  @Test
  @DisplayName("POST /api/auth/github/callback sets auth cookies on success (parity with Google)")
  void callback_success_setsCookies() throws Exception {
    UserEntity user = userRepository
        .save(UserEntity.builder().email("gh-user@example.com").name("G").surname("H")
            .passwordHash("{noop}x").dateOfRegister(Instant.now()).role(Role.USER).build());
    when(githubOAuthService.handleCallback(eq("code"), anyString()))
        .thenReturn(AuthPayload.ok(UserDto.from(user), "gh-jwt", "gh-csrf"));

    MvcResult result = mockMvc
        .perform(post("/api/auth/github/callback").contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(Map.of("code", "code", "state", "state"))))
        .andExpect(status().isOk()).andExpect(jsonPath("$.data.token").value("gh-jwt")).andReturn();

    List<String> cookies = result.getResponse().getHeaders(HttpHeaders.SET_COOKIE);
    assertThat(
        cookies.stream().anyMatch(c -> c.startsWith(CookieUtils.JWT_COOKIE_NAME + "=gh-jwt")))
        .isTrue();
    assertThat(
        cookies.stream().anyMatch(c -> c.startsWith(CookieUtils.CSRF_COOKIE_NAME + "=gh-csrf")))
        .isTrue();
    assertThat(
        cookies.stream().anyMatch(c -> c.startsWith(CookieUtils.REFRESH_TOKEN_COOKIE_NAME + "=")))
        .isTrue();
  }
}
