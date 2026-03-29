package com.univoyage.user.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.univoyage.reference.country.repository.CountryRepository;
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
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Map;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.securityContext;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Full-stack integration tests for {@link UserController}.
 * The real security filter chain runs; authenticated tests install a {@link UserEntity} principal via
 * {@link org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors#securityContext}.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class UserControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CountryRepository countryRepository;

    @Test
    @DisplayName("PATCH /api/user/profile returns 401 when there is no JWT (security entry point)")
    void updateProfileUnauthenticated_returns401() throws Exception {
        mockMvc.perform(patch("/api/user/profile")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").value("Unauthorized. Please log in."));
    }

    @Test
    @DisplayName("PATCH /api/user/profile updates name for authenticated user")
    void updateProfileSuccess() throws Exception {
        UserEntity user = saveUser("profile-ok@example.com");

        mockMvc.perform(patch("/api/user/profile")
                        .with(securityContextFor(user))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("name", "UpdatedName"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.user.name").value("UpdatedName"));
    }

    @Test
    @DisplayName("PATCH /api/user/profile returns 400 when profileImagePath fails bean validation")
    void updateProfileInvalidAvatar_returns400() throws Exception {
        UserEntity user = saveUser("profile-bad-avatar@example.com");

        mockMvc.perform(patch("/api/user/profile")
                        .with(securityContextFor(user))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "profileImagePath", "https://evil.example.com/x.png"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("PATCH /api/user/profile returns 400 for unknown country code")
    void updateProfileInvalidCountry_returns400() throws Exception {
        UserEntity user = saveUser("profile-bad-country@example.com");

        mockMvc.perform(patch("/api/user/profile")
                        .with(securityContextFor(user))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("countryCode", "QQ"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").value("Invalid country code: QQ"));
    }

    private static org.springframework.test.web.servlet.request.RequestPostProcessor securityContextFor(UserEntity principal) {
        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                principal, principal.getPassword(), principal.getAuthorities());
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        return securityContext(context);
    }

    private UserEntity saveUser(String email) {
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
