package com.univoyage.auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.univoyage.reference.country.model.Country;
import com.univoyage.reference.country.repository.CountryRepository;
import com.univoyage.user.model.UserEntity;
import com.univoyage.user.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "app.auth.login.max-failed-attempts=5",
        "app.auth.login.lock-duration=PT24H"
})
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class AuthLoginLockoutIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private CountryRepository countryRepository;

    @Autowired
    private UserRepository userRepository;

    @Test
    @DisplayName("After 5 consecutive wrong passwords, account is locked and correct password is rejected")
    void accountLocksAfterFiveFailedAttempts() throws Exception {
        seedCountry("MT", "Malta");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "email", "lockme@example.com",
                                "password", "Good-Secret-1",
                                "name", "L",
                                "surname", "K",
                                "countryCode", "MT"
                        ))))
                .andExpect(status().isCreated());

        String wrongLogin = objectMapper.writeValueAsString(Map.of(
                "email", "lockme@example.com",
                "password", "wrong-password"
        ));

        for (int i = 0; i < 5; i++) {
            mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(wrongLogin))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.success").value(false))
                    .andExpect(jsonPath("$.error").value("Invalid credentials"));
        }

        UserEntity user = userRepository.findByEmail("lockme@example.com").orElseThrow();
        assertNotNull(user.getLockedUntil());
        assertTrue(user.getLockedUntil().isAfter(Instant.now()));
        assertEquals(5, user.getFailedLoginAttempts());

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "email", "lockme@example.com",
                                "password", "Good-Secret-1"
                        ))))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").value("Invalid credentials"));
    }

    @Test
    @DisplayName("Successful login resets failed attempts; next 5 wrong passwords lock again")
    void successfulLoginResetsFailedAttemptsCounter() throws Exception {
        seedCountry("CY", "Cyprus");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "email", "reset@example.com",
                                "password", "Valid-1",
                                "name", "R",
                                "surname", "S",
                                "countryCode", "CY"
                        ))))
                .andExpect(status().isCreated());

        String wrong = objectMapper.writeValueAsString(Map.of(
                "email", "reset@example.com",
                "password", "bad"
        ));

        for (int i = 0; i < 2; i++) {
            mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(wrong))
                    .andExpect(status().isUnauthorized());
        }

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "email", "reset@example.com",
                                "password", "Valid-1"
                        ))))
                .andExpect(status().isOk());

        UserEntity afterOk = userRepository.findByEmail("reset@example.com").orElseThrow();
        assertEquals(0, afterOk.getFailedLoginAttempts());
        assertTrue(afterOk.getLockedUntil() == null || !afterOk.getLockedUntil().isAfter(Instant.now()));

        for (int i = 0; i < 5; i++) {
            mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(wrong))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.error").value("Invalid credentials"));
        }

        UserEntity locked = userRepository.findByEmail("reset@example.com").orElseThrow();
        assertNotNull(locked.getLockedUntil());
        assertEquals(5, locked.getFailedLoginAttempts());
    }

    private void seedCountry(String iso, String name) {
        countryRepository.save(Country.builder()
                .isoCode(iso)
                .countryName(name)
                .currencyCode("EUR")
                .currencyName("Euro")
                .build());
    }
}
