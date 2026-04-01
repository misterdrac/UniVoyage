package com.univoyage.admin.user.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
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
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Map;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.securityContext;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Full-stack integration tests for {@link AdminUserController}.
 * Role updates use a seeded HEAD_ADMIN {@link UserEntity} in the request security context so
 * {@link com.univoyage.admin.user.service.AdminUserService#updateRole} receives a real acting user id.
 * Other admin routes use {@link WithMockUser} so the secured URL patterns match production.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class AdminUserControllerIntegrationTest {

    private static final String SEEDED_HEAD_ADMIN_EMAIL = "papavolaric@univoyage.com";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("GET /api/admin/users returns a page")
    void listUsers() throws Exception {
        mockMvc.perform(get("/api/admin/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content").isArray());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("GET /api/admin/users/{id} returns user when present")
    void getUser_ok() throws Exception {
        UserEntity u = saveUser("admin-get-user@example.com", Role.USER);
        mockMvc.perform(get("/api/admin/users/{id}", u.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.email").value("admin-get-user@example.com"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("GET /api/admin/users/{id} returns 404 when missing")
    void getUser_notFound() throws Exception {
        mockMvc.perform(get("/api/admin/users/{id}", 9_999_999_999L))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("PATCH /api/admin/users/{id}/role returns 400 when role is missing")
    void updateRole_validationFails() throws Exception {
        UserEntity headAdmin = userRepository.findByEmail(SEEDED_HEAD_ADMIN_EMAIL)
                .orElseThrow(() -> new IllegalStateException("Seed HEAD_ADMIN user required: " + SEEDED_HEAD_ADMIN_EMAIL));
        UserEntity target = saveUser("admin-role-val@example.com", Role.USER);

        mockMvc.perform(patch("/api/admin/users/{id}/role", target.getId())
                        .with(securityContextFor(headAdmin))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("PATCH /api/admin/users/{id}/role promotes USER to ADMIN when HEAD_ADMIN acts")
    void updateRole_headAdminPromotesUser() throws Exception {
        UserEntity headAdmin = userRepository.findByEmail(SEEDED_HEAD_ADMIN_EMAIL)
                .orElseThrow(() -> new IllegalStateException("Seed HEAD_ADMIN user required: " + SEEDED_HEAD_ADMIN_EMAIL));
        UserEntity target = saveUser("admin-promote@example.com", Role.USER);

        mockMvc.perform(patch("/api/admin/users/{id}/role", target.getId())
                        .with(securityContextFor(headAdmin))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("role", "ADMIN"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.role").value("ADMIN"));
    }

    private static RequestPostProcessor securityContextFor(UserEntity principal) {
        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                principal, principal.getPassword(), principal.getAuthorities());
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        return securityContext(context);
    }

    private UserEntity saveUser(String email, Role role) {
        return userRepository.save(UserEntity.builder()
                .name("A")
                .surname("B")
                .email(email)
                .passwordHash("{noop}unused")
                .dateOfRegister(Instant.now())
                .role(role)
                .build());
    }
}
