package com.univoyage.auth.controller;

import com.univoyage.auth.security.CookieUtils;
import com.univoyage.reference.country.repository.CountryRepository;
import com.univoyage.user.model.Role;
import com.univoyage.user.model.UserEntity;
import com.univoyage.user.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.RequestPostProcessor;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.securityContext;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Integration tests for authenticated session endpoints on {@link AuthController}:
 * {@code GET /api/auth/me} and {@code POST /api/auth/logout}.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class AuthSessionEndpointsIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CountryRepository countryRepository;

    @Test
    @DisplayName("GET /api/auth/me returns 401 without authentication")
    void getMe_unauthenticated_returns401() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("GET /api/auth/me returns 200 and user profile when principal is UserEntity")
    void getMe_authenticated_returnsUser() throws Exception {
        UserEntity user = persistUser("me-endpoint@example.com");

        mockMvc.perform(get("/api/auth/me").with(securityContextFor(user)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.email").value("me-endpoint@example.com"));
    }

    @Test
    @DisplayName("POST /api/auth/logout returns 401 without authentication")
    void postLogout_unauthenticated_returns401() throws Exception {
        mockMvc.perform(post("/api/auth/logout"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("POST /api/auth/logout returns 200 and clears auth cookies")
    void postLogout_authenticated_clearsCookies() throws Exception {
        UserEntity user = persistUser("logout@example.com");

        MvcResult result = mockMvc.perform(post("/api/auth/logout").with(securityContextFor(user)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andReturn();

        List<String> setCookies = result.getResponse().getHeaders(HttpHeaders.SET_COOKIE);
        assertThat(setCookies).isNotEmpty();
        assertThat(setCookies.stream().anyMatch(c ->
                c.startsWith(CookieUtils.JWT_COOKIE_NAME + "=") && c.contains("Max-Age=0")))
                .as("JWT cleared")
                .isTrue();
        assertThat(setCookies.stream().anyMatch(c ->
                c.startsWith(CookieUtils.CSRF_COOKIE_NAME + "=") && c.contains("Max-Age=0")))
                .as("CSRF cleared")
                .isTrue();
        assertThat(setCookies.stream().anyMatch(c ->
                c.startsWith(CookieUtils.REFRESH_TOKEN_COOKIE_NAME + "=") && c.contains("Max-Age=0")))
                .as("Refresh token cleared")
                .isTrue();
    }

    private static RequestPostProcessor securityContextFor(UserEntity principal) {
        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                principal, principal.getPassword(), principal.getAuthorities());
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        return securityContext(context);
    }

    private UserEntity persistUser(String email) {
        return userRepository.save(UserEntity.builder()
                .name("N")
                .surname("S")
                .email(email)
                .passwordHash("{noop}unused")
                .dateOfRegister(Instant.now())
                .role(Role.USER)
                .country(countryRepository.findByIsoCode("HR").orElse(null))
                .build());
    }
}
