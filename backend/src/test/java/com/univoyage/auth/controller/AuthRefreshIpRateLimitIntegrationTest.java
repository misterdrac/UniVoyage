package com.univoyage.auth.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "app.auth.login.refresh-ip-max-attempts=2",
        "app.auth.login.refresh-ip-window=PT1H"
})
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class AuthRefreshIpRateLimitIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("POST /api/auth/refresh returns 429 when IP exceeds refresh window limit")
    void refreshRateLimitedByIp() throws Exception {
        mockMvc.perform(post("/api/auth/refresh"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(post("/api/auth/refresh"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(post("/api/auth/refresh"))
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(header().exists("Retry-After"));
    }
}
