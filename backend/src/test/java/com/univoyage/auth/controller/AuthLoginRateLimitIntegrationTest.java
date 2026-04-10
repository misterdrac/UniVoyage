package com.univoyage.auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "app.auth.login.ip-max-attempts=2",
        "app.auth.login.ip-window=PT1H"
})
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class AuthLoginRateLimitIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("POST /api/auth/login returns 429 when IP exceeds configured window limit")
    void loginRateLimitedByIp() throws Exception {
        String body = objectMapper.writeValueAsString(Map.of(
                "email", "anyone@example.com",
                "password", "irrelevant"
        ));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(header().exists("Retry-After"));
    }

    @Test
    @DisplayName("X-Forwarded-For first hop is rate-limited separately per client IP")
    void rateLimitUsesXForwardedForWhenPresent() throws Exception {
        String body = objectMapper.writeValueAsString(Map.of(
                "email", "x@example.com",
                "password", "x"
        ));

        for (int i = 0; i < 2; i++) {
            mockMvc.perform(post("/api/auth/login")
                            .header("X-Forwarded-For", "203.0.113.10")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isUnauthorized());
        }
        mockMvc.perform(post("/api/auth/login")
                        .header("X-Forwarded-For", "203.0.113.10")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isTooManyRequests());

        mockMvc.perform(post("/api/auth/login")
                        .header("X-Forwarded-For", "203.0.113.20")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isUnauthorized());
    }
}
