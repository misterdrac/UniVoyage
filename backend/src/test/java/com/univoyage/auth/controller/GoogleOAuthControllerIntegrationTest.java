package com.univoyage.auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.univoyage.auth.dto.AuthPayload;
import com.univoyage.auth.security.CookieUtils;
import com.univoyage.auth.service.GoogleOAuthService;
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
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Integration tests for {@link GoogleOAuthController} with {@link GoogleOAuthService} mocked
 * so no Google credentials or outbound HTTP are required.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class GoogleOAuthControllerIntegrationTest {

    private static final String GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth?client=test";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private GoogleOAuthService googleOAuthService;

    @Autowired
    private UserRepository userRepository;

    @Test
    @DisplayName("GET /api/auth/google returns 302 to authorization URL from service")
    void googleAuth_redirects() throws Exception {
        when(googleOAuthService.buildAuthorizationUrl()).thenReturn(GOOGLE_AUTH_URL);

        mockMvc.perform(get("/api/auth/google"))
                .andExpect(status().isFound())
                .andExpect(header().string(HttpHeaders.LOCATION, GOOGLE_AUTH_URL));
    }

    @Test
    @DisplayName("GET /api/auth/google returns 500 when service cannot build URL")
    void googleAuth_serviceThrows_returns500() throws Exception {
        when(googleOAuthService.buildAuthorizationUrl())
                .thenThrow(new IllegalStateException("Google OAuth is not configured"));

        mockMvc.perform(get("/api/auth/google"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    @DisplayName("POST /api/auth/google/callback returns 400 when code is missing")
    void callback_missingCode_returns400() throws Exception {
        mockMvc.perform(post("/api/auth/google/callback")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").value("Missing authorization code"));
    }

    @Test
    @DisplayName("POST /api/auth/google/callback returns 400 when code is blank")
    void callback_blankCode_returns400() throws Exception {
        mockMvc.perform(post("/api/auth/google/callback")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("code", "   "))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").value("Missing authorization code"));
    }

    @Test
    @DisplayName("POST /api/auth/google/callback returns 401 when service reports failure")
    void callback_serviceFailure_returns401() throws Exception {
        when(googleOAuthService.handleCallback("bad"))
                .thenReturn(AuthPayload.fail("invalid_grant"));

        mockMvc.perform(post("/api/auth/google/callback")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("code", "bad"))))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").value("invalid_grant"));
    }

    @Test
    @DisplayName("POST /api/auth/google/callback returns 200, payload, and auth cookies on success")
    void callback_success_setsCookiesAndBody() throws Exception {
        UserEntity persisted = userRepository.save(UserEntity.builder()
                .name("G")
                .surname("User")
                .email("google-user@example.com")
                .passwordHash("{noop}unused")
                .dateOfRegister(Instant.now())
                .role(Role.USER)
                .build());
        UserDto user = UserDto.from(persisted);
        when(googleOAuthService.handleCallback("valid-code"))
                .thenReturn(AuthPayload.ok(user, "test-jwt", "test-csrf"));

        MvcResult result = mockMvc.perform(post("/api/auth/google/callback")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("code", "valid-code"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.success").value(true))
                .andExpect(jsonPath("$.data.user.email").value("google-user@example.com"))
                .andExpect(jsonPath("$.data.token").value("test-jwt"))
                .andExpect(jsonPath("$.data.csrfToken").value("test-csrf"))
                .andReturn();

        List<String> setCookies = result.getResponse().getHeaders(HttpHeaders.SET_COOKIE);
        assertThat(setCookies).isNotEmpty();
        assertThat(setCookies.stream().anyMatch(c -> c.startsWith(CookieUtils.JWT_COOKIE_NAME + "=test-jwt")))
                .as("JWT cookie")
                .isTrue();
        assertThat(setCookies.stream().anyMatch(c -> c.startsWith(CookieUtils.CSRF_COOKIE_NAME + "=test-csrf")))
                .as("CSRF cookie")
                .isTrue();
        assertThat(setCookies.stream().anyMatch(c -> c.startsWith(CookieUtils.REFRESH_TOKEN_COOKIE_NAME + "=")))
                .as("Refresh cookie")
                .isTrue();
    }
}
