package com.univoyage.auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.univoyage.auth.dto.AuthPayload;
import com.univoyage.auth.security.CookieUtils;
import com.univoyage.auth.service.GoogleOAuthService;
import com.univoyage.reference.country.model.Country;
import com.univoyage.reference.country.repository.CountryRepository;
import com.univoyage.user.dto.UserDto;
import com.univoyage.user.model.Role;
import com.univoyage.user.model.UserEntity;
import com.univoyage.user.repository.UserRepository;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class AuthCookieContractIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private CountryRepository countryRepository;

    @Autowired
    private UserRepository userRepository;

    @MockBean
    private GoogleOAuthService googleOAuthService;

    @Value("${app.cookies.secure:false}")
    private boolean cookieSecure;

    @Value("${app.cookies.same-site:Lax}")
    private String sameSite;

    @Test
    @DisplayName("Login sets auth cookies with expected security attributes")
    void login_cookieContract() throws Exception {
        seedCountry("SE", "Sweden");
        registerUser("cookie-login@example.com", "SE");

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "email", "cookie-login@example.com",
                                "password", "Str0ng!Pass"
                        ))))
                .andExpect(status().isOk())
                .andReturn();

        List<String> setCookies = result.getResponse().getHeaders(HttpHeaders.SET_COOKIE);
        assertCookieContract(setCookies, CookieUtils.JWT_COOKIE_NAME, true);
        assertCookieContract(setCookies, CookieUtils.CSRF_COOKIE_NAME, false);
        assertCookieContract(setCookies, CookieUtils.REFRESH_TOKEN_COOKIE_NAME, true);
    }

    @Test
    @DisplayName("Refresh sets rotated auth cookies with expected security attributes")
    void refresh_cookieContract() throws Exception {
        seedCountry("NO", "Norway");
        registerUser("cookie-refresh@example.com", "NO");

        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "email", "cookie-refresh@example.com",
                                "password", "Str0ng!Pass"
                        ))))
                .andExpect(status().isOk())
                .andReturn();

        Cookie refreshCookie = loginResult.getResponse().getCookie(CookieUtils.REFRESH_TOKEN_COOKIE_NAME);
        assertThat(refreshCookie).isNotNull();

        MvcResult refreshResult = mockMvc.perform(post("/api/auth/refresh")
                        .cookie(refreshCookie))
                .andExpect(status().isOk())
                .andReturn();

        List<String> setCookies = refreshResult.getResponse().getHeaders(HttpHeaders.SET_COOKIE);
        assertCookieContract(setCookies, CookieUtils.JWT_COOKIE_NAME, true);
        assertCookieContract(setCookies, CookieUtils.CSRF_COOKIE_NAME, false);
        assertCookieContract(setCookies, CookieUtils.REFRESH_TOKEN_COOKIE_NAME, true);
    }

    @Test
    @DisplayName("Google callback sets auth cookies with expected security attributes")
    void googleCallback_cookieContract() throws Exception {
        UserEntity persisted = userRepository.save(UserEntity.builder()
                .name("G")
                .surname("User")
                .email("cookie-google@example.com")
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
                .andReturn();

        List<String> setCookies = result.getResponse().getHeaders(HttpHeaders.SET_COOKIE);
        assertCookieContract(setCookies, CookieUtils.JWT_COOKIE_NAME, true);
        assertCookieContract(setCookies, CookieUtils.CSRF_COOKIE_NAME, false);
        assertCookieContract(setCookies, CookieUtils.REFRESH_TOKEN_COOKIE_NAME, true);
    }

    private void registerUser(String email, String countryCode) throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "email", email,
                                "password", "Str0ng!Pass",
                                "name", "Cookie",
                                "surname", "Contract",
                                "countryCode", countryCode
                        ))))
                .andExpect(status().isCreated());
    }

    private void seedCountry(String iso, String name) {
        countryRepository.save(Country.builder()
                .isoCode(iso)
                .countryName(name)
                .currencyCode("EUR")
                .currencyName("Euro")
                .build());
    }

    private void assertCookieContract(List<String> setCookies, String cookieName, boolean expectedHttpOnly) {
        String header = setCookies.stream()
                .filter(v -> v.startsWith(cookieName + "="))
                .findFirst()
                .orElseThrow(() -> new AssertionError("Missing Set-Cookie for " + cookieName));

        assertThat(header).contains("Path=/");
        assertThat(header).contains("SameSite=" + sameSite);
        if (expectedHttpOnly) {
            assertThat(header).contains("HttpOnly");
        } else {
            assertThat(header).doesNotContain("HttpOnly");
        }
        if (cookieSecure) {
            assertThat(header).contains("Secure");
        } else {
            assertThat(header).doesNotContain("Secure");
        }
    }
}
