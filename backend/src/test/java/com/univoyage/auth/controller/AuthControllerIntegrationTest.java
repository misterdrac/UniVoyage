package com.univoyage.auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.univoyage.reference.country.model.Country;
import com.univoyage.reference.country.repository.CountryRepository;
import com.univoyage.reference.hobby.repository.HobbyRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Set;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Integration tests for {@link AuthController} registration and login flows.
 * <p>
 * Uses the full application with {@code test} profile, real {@link org.springframework.test.web.servlet.MockMvc},
 * and servlet filters enabled so public auth routes behave like production. Database changes roll back
 * after each test via {@link org.springframework.transaction.annotation.Transactional @Transactional}.
 * Countries are inserted when a test needs a valid {@code countryCode} for registration.
 * </p>
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class AuthControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private CountryRepository countryRepository;

    @Autowired
    private HobbyRepository hobbyRepository;

    /**
     * Happy path: valid registration payload persists a user and returns HTTP 201 with
     * {@link com.univoyage.auth.dto.AuthPayload} containing user, JWT, and CSRF token fields.
     */
    @Test
    @DisplayName("POST /api/auth/register creates user and returns 201")
    void registerSuccess() throws Exception {
        seedCountry("HR", "Croatia");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "email", "newuser@example.com",
                                "password", "Str0ng!Pass",
                                "name", "Ann",
                                "surname", "Test",
                                "countryCode", "HR"
                        ))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.user.email").value("newuser@example.com"))
                .andExpect(jsonPath("$.data.token").exists())
                .andExpect(jsonPath("$.data.csrfToken").exists());
    }

    /**
     * Second registration with the same email must fail with HTTP 400 and a stable error message
     * from {@link com.univoyage.auth.service.AuthService#register}.
     */
    @Test
    @DisplayName("POST /api/auth/register returns 400 when email already exists")
    void registerDuplicateEmail() throws Exception {
        seedCountry("DE", "Germany");

        String body = objectMapper.writeValueAsString(Map.of(
                "email", "dup@example.com",
                "password", "Str0ng!Pass",
                "name", "A",
                "surname", "B",
                "countryCode", "DE"
        ));

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").value("Email is already in use"));
    }

    /**
     * Registration without {@code countryCode} is rejected before country lookup (HTTP 400).
     */
    @Test
    @DisplayName("POST /api/auth/register returns 400 when country code is missing")
    void registerMissingCountryCode() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "email", "nocountry@example.com",
                                "password", "Str0ng!Pass",
                                "name", "A",
                                "surname", "B"
                        ))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").value("Country code is required"));
    }

    /**
     * After a successful register, login with the same credentials returns HTTP 200 and embeds
     * the authenticated user in the response body.
     */
    @Test
    @DisplayName("POST /api/auth/login succeeds after registration")
    void loginSuccess() throws Exception {
        seedCountry("SI", "Slovenia");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "email", "loginok@example.com",
                                "password", "Correct-Horse-1",
                                "name", "L",
                                "surname", "O",
                                "countryCode", "SI"
                        ))))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "email", "loginok@example.com",
                                "password", "Correct-Horse-1"
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.user.email").value("loginok@example.com"));
    }

    /**
     * Wrong password must yield HTTP 401 and {@code Invalid credentials} without revealing whether
     * the email exists (aligned with service-layer failure payload).
     */
    @Test
    @DisplayName("POST /api/auth/login returns 401 for wrong password")
    void loginWrongPassword() throws Exception {
        seedCountry("AT", "Austria");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "email", "badlogin@example.com",
                                "password", "Right-One-2",
                                "name", "X",
                                "surname", "Y",
                                "countryCode", "AT"
                        ))))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "email", "badlogin@example.com",
                                "password", "Wrong-One-2"
                        ))))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").value("Invalid credentials"));
    }

    /**
     * Unknown email triggers {@link java.lang.IllegalArgumentException} in the service; the controller
     * maps it to HTTP 401 with a generic {@code Invalid email or password} message.
     */
    @Test
    @DisplayName("POST /api/auth/login returns 401 for unknown email")
    void loginUnknownEmail() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "email", "nobody@example.com",
                                "password", "Whatever1!"
                        ))))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").value("Invalid email or password"));
    }

    /**
     * {@code countryCode} that is only whitespace is treated as missing ({@link String#isBlank()}).
     */
    @Test
    @DisplayName("POST /api/auth/register returns 400 when country code is blank whitespace")
    void registerBlankWhitespaceCountryCode() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "email", "ws@example.com",
                                "password", "Str0ng!Pass",
                                "name", "A",
                                "surname", "B",
                                "countryCode", "   "
                        ))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").value("Country code is required"));
    }

    /**
     * Unknown ISO code causes {@link IllegalArgumentException} in the service; handled as 400 by
     * {@link com.univoyage.exception.GlobalExceptionHandler}.
     */
    @Test
    @DisplayName("POST /api/auth/register returns 400 for unknown country code")
    void registerUnknownCountryCode() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "email", "unknownco@example.com",
                                "password", "Str0ng!Pass",
                                "name", "A",
                                "surname", "B",
                                "countryCode", "QQ"
                        ))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").value("Invalid country code: QQ"));
    }

    /**
     * Invalid hobby id fails inside {@link com.univoyage.auth.service.AuthService#register} with
     * {@link IllegalArgumentException}, mapped to 400 by {@link com.univoyage.exception.GlobalExceptionHandler}.
     */
    @Test
    @DisplayName("POST /api/auth/register returns 400 when hobby id does not exist")
    void registerInvalidHobbyId() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "email", "badhobby@example.com",
                                "password", "Str0ng!Pass",
                                "name", "A",
                                "surname", "B",
                                "countryCode", "FR",
                                "hobbyIds", List.of(999_999L)
                        ))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").value("Invalid hobby id: 999999"));
    }

    /**
     * Registration succeeds when optional hobby and language ids match seeded reference data.
     */
    @Test
    @DisplayName("POST /api/auth/register succeeds with valid hobby and language ids")
    void registerWithHobbyAndLanguage() throws Exception {
        long hobbyId = hobbyRepository.findAll().stream()
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Expected seeded hobbies"))
                .getId();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "email", "profile@example.com",
                                "password", "Str0ng!Pass",
                                "name", "P",
                                "surname", "L",
                                "countryCode", "FR",
                                "hobbyIds", Set.of(hobbyId),
                                "languageCodes", Set.of("en")
                        ))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.user.hobbies").isArray())
                .andExpect(jsonPath("$.data.user.languages").isArray());
    }

    /**
     * {@link com.univoyage.auth.dto.LoginRequestDto} uses bean validation; invalid email format → 400
     * with {@link com.univoyage.exception.GlobalExceptionHandler} payload shape.
     */
    @Test
    @DisplayName("POST /api/auth/login returns 400 when email format is invalid")
    void loginInvalidEmailFormat() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "email", "not-an-email",
                                "password", "secret"
                        ))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    /**
     * Blank password violates {@code @NotBlank} on {@link com.univoyage.auth.dto.LoginRequestDto}.
     */
    @Test
    @DisplayName("POST /api/auth/login returns 400 when password is blank")
    void loginBlankPassword() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "email", "a@b.com",
                                "password", ""
                        ))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    /**
     * Invalid visited country code during register throws {@link IllegalArgumentException} → 400.
     */
    @Test
    @DisplayName("POST /api/auth/register returns 400 when visited country code is invalid")
    void registerInvalidVisitedCountryCode() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "email", "badvisit@example.com",
                                "password", "Str0ng!Pass",
                                "name", "A",
                                "surname", "B",
                                "countryCode", "FR",
                                "visitedCountryCodes", Set.of("QQ")
                        ))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").value("Invalid visited country code: QQ"));
    }

    /**
     * Unknown language code in {@code languageCodes} throws {@link IllegalArgumentException} → 400.
     */
    @Test
    @DisplayName("POST /api/auth/register returns 400 when language code does not exist")
    void registerInvalidLanguageCode() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "email", "badlang@example.com",
                                "password", "Str0ng!Pass",
                                "name", "A",
                                "surname", "B",
                                "countryCode", "FR",
                                "languageCodes", Set.of("xx")
                        ))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").value("Invalid language code: xx"));
    }

    /**
     * Inserts a minimal {@link Country} row so registration can resolve {@code countryCode}.
     *
     * @param iso  ISO 3166-1 alpha-2 code (must fit DB column width)
     * @param name display name for the country
     */
    private void seedCountry(String iso, String name) {
        countryRepository.save(Country.builder()
                .isoCode(iso)
                .countryName(name)
                .currencyCode("EUR")
                .currencyName("Euro")
                .build());
    }
}
