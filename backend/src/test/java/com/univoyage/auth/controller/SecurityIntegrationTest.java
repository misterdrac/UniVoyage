package com.univoyage.auth.controller;

import com.univoyage.user.model.Role;
import com.univoyage.user.model.UserEntity;
import com.univoyage.user.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.securityContext;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Integration tests for issue #201: unauthenticated access to protected APIs and
 * forbidden access for authenticated users without required roles.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class SecurityIntegrationTest {

    private static final String UNAUTHORIZED_MESSAGE = "Unauthorized. Please log in.";
    private static final String FORBIDDEN_MESSAGE = "Forbidden. You do not have permission to access this resource.";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    // --- Unauthenticated: 401 + consistent ApiResponse --------------------------------

    @Test
    @DisplayName("GET /api/auth/me returns 401 without authentication")
    void authMe_unauthenticated() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").value(UNAUTHORIZED_MESSAGE));
    }

    @Test
    @DisplayName("POST /api/auth/logout returns 401 without authentication")
    void authLogout_unauthenticated() throws Exception {
        mockMvc.perform(post("/api/auth/logout"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").value(UNAUTHORIZED_MESSAGE));
    }

    @Test
    @DisplayName("GET /api/admin/users returns 401 without authentication")
    void adminUsers_unauthenticated() throws Exception {
        mockMvc.perform(get("/api/admin/users"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").value(UNAUTHORIZED_MESSAGE));
    }

    @Test
    @DisplayName("DELETE /api/admin/users/1 returns 401 without authentication")
    void adminDeleteUser_unauthenticated() throws Exception {
        mockMvc.perform(delete("/api/admin/users/1"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").value(UNAUTHORIZED_MESSAGE));
    }

    @Test
    @DisplayName("GET /api/admin/destinations returns 401 without authentication")
    void adminDestinations_unauthenticated() throws Exception {
        mockMvc.perform(get("/api/admin/destinations"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").value(UNAUTHORIZED_MESSAGE));
    }

    @Test
    @DisplayName("GET /api/trips returns 401 without authentication")
    void trips_unauthenticated() throws Exception {
        mockMvc.perform(get("/api/trips"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").value(UNAUTHORIZED_MESSAGE));
    }

    @Test
    @DisplayName("POST /api/trips returns 401 without authentication")
    void createTrip_unauthenticated() throws Exception {
        mockMvc.perform(post("/api/trips")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").value(UNAUTHORIZED_MESSAGE));
    }

    @Test
    @DisplayName("GET /api/trips/1/budget returns 401 without authentication")
    void tripBudget_unauthenticated() throws Exception {
        mockMvc.perform(get("/api/trips/1/budget"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").value(UNAUTHORIZED_MESSAGE));
    }

    @Test
    @DisplayName("GET /api/user/profile returns 401 without authentication")
    void userProfile_unauthenticated() throws Exception {
        mockMvc.perform(get("/api/user/profile"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").value(UNAUTHORIZED_MESSAGE));
    }

    @Test
    @DisplayName("GET /api/places/search returns 401 without authentication")
    void placesSearch_unauthenticated() throws Exception {
        mockMvc.perform(get("/api/places/search").param("city", "Paris"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").value(UNAUTHORIZED_MESSAGE));
    }

    @Test
    @DisplayName("GET /api/hotels/search returns 401 without authentication")
    void hotelsSearch_unauthenticated() throws Exception {
        mockMvc.perform(get("/api/hotels/search").param("city", "Paris"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").value(UNAUTHORIZED_MESSAGE));
    }

    @Test
    @DisplayName("GET /api/weather/current returns 401 without authentication")
    void weatherCurrent_unauthenticated() throws Exception {
        mockMvc.perform(get("/api/weather/current").param("city", "Paris"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").value(UNAUTHORIZED_MESSAGE));
    }

    @Test
    @DisplayName("POST /api/ai/itinerary returns 401 without authentication")
    void aiItinerary_unauthenticated() throws Exception {
        mockMvc.perform(post("/api/ai/itinerary")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").value(UNAUTHORIZED_MESSAGE));
    }

    // --- Authenticated USER on admin routes: 403 + consistent ApiResponse ------------

    @Test
    @DisplayName("GET /api/admin/users returns 403 for authenticated non-admin user")
    void adminUsers_forbiddenForPlainUser() throws Exception {
        UserEntity user = persistPlainUser("sec-plain-admin-users@example.com");
        mockMvc.perform(get("/api/admin/users").with(securityContextFor(user)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").value(FORBIDDEN_MESSAGE));
    }

    @Test
    @DisplayName("GET /api/admin/destinations returns 403 for authenticated non-admin user")
    void adminDestinations_forbiddenForPlainUser() throws Exception {
        UserEntity user = persistPlainUser("sec-plain-admin-dest@example.com");
        mockMvc.perform(get("/api/admin/destinations").with(securityContextFor(user)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").value(FORBIDDEN_MESSAGE));
    }

    @Test
    @DisplayName("PATCH /api/admin/users/1/role returns 403 for authenticated non-admin user")
    void adminPatchRole_forbiddenForPlainUser() throws Exception {
        UserEntity user = persistPlainUser("sec-plain-admin-patch@example.com");
        mockMvc.perform(patch("/api/admin/users/1/role")
                        .with(securityContextFor(user))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"role\":\"ADMIN\"}"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").value(FORBIDDEN_MESSAGE));
    }

    // --- Public routes must not be rejected as unauthenticated (no 401 from security) -

    @Test
    @DisplayName("GET /api/destinations is publicly accessible (not 401)")
    void destinations_publiclyAccessible() throws Exception {
        mockMvc.perform(get("/api/destinations"))
                .andExpect(status().is2xxSuccessful());
    }

    @Test
    @DisplayName("GET /api/heatmap is publicly accessible (not 401)")
    void heatmap_publiclyAccessible() throws Exception {
        mockMvc.perform(get("/api/heatmap"))
                .andExpect(status().is2xxSuccessful());
    }

    /**
     * Quiz is permitAll under /api/quiz/**; there is no GET handler on /api/quiz.
     * Assert unauthenticated POST hits the app (validation/service), not Spring Security 401.
     */
    @Test
    @DisplayName("POST /api/quiz/recommend without auth is not blocked with 401 (permitAll)")
    void quiz_recommend_notUnauthorizedWithoutToken() throws Exception {
        mockMvc.perform(post("/api/quiz/recommend")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest());
    }

    private UserEntity persistPlainUser(String email) {
        return userRepository.save(UserEntity.builder()
                .name("Security")
                .surname("User")
                .email(email)
                .passwordHash("{noop}unused")
                .dateOfRegister(Instant.now())
                .role(Role.USER)
                .build());
    }

    private static RequestPostProcessor securityContextFor(UserEntity principal) {
        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                principal, principal.getPassword(), principal.getAuthorities());
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        return securityContext(context);
    }
}
