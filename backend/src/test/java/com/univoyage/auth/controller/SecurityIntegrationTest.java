package com.univoyage.auth.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Integration tests for issue #201.
 * Verifies that protected endpoints reject unauthenticated requests
 * with 401 Unauthorized or 403 Forbidden.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class SecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    // ── /api/auth/me ──────────────────────────────────────────────

    @Test
    @DisplayName("GET /api/auth/me returns 401 without token")
    void authMe_unauthenticated() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized());
    }

    // ── /api/admin/** ─────────────────────────────────────────────

    @Test
    @DisplayName("GET /api/admin/users returns 401 without token")
    void adminUsers_unauthenticated() throws Exception {
        mockMvc.perform(get("/api/admin/users"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("DELETE /api/admin/users/1 returns 401 without token")
    void adminDeleteUser_unauthenticated() throws Exception {
        mockMvc.perform(delete("/api/admin/users/1"))
                .andExpect(status().isUnauthorized());
    }

    // ── /api/trips/** ─────────────────────────────────────────────

    @Test
    @DisplayName("GET /api/trips returns 401 without token")
    void trips_unauthenticated() throws Exception {
        mockMvc.perform(get("/api/trips"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("POST /api/trips returns 401 without token")
    void createTrip_unauthenticated() throws Exception {
        mockMvc.perform(post("/api/trips")
                        .contentType("application/json")
                        .content("{}"))
                .andExpect(status().isUnauthorized());
    }

    // ── /api/user/** ──────────────────────────────────────────────

    @Test
    @DisplayName("GET /api/user/profile returns 401 without token")
    void userProfile_unauthenticated() throws Exception {
        mockMvc.perform(get("/api/user/profile"))
                .andExpect(status().isUnauthorized());
    }

    // ── Public endpoints – must NOT return 401 ────────────────────

    @Test
    @DisplayName("GET /api/destinations is publicly accessible (not 401)")
    void destinations_publiclyAccessible() throws Exception {
        mockMvc.perform(get("/api/destinations"))
                .andExpect(status().is2xxSuccessful());
    }

    @Test
    @DisplayName("GET /api/quiz is publicly accessible (not 401)")
    void quiz_publiclyAccessible() throws Exception {
        mockMvc.perform(get("/api/quiz"))
                .andExpect(status().is2xxSuccessful());
    }
}
