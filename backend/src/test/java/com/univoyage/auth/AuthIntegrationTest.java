package com.univoyage.auth;

import com.univoyage.user.model.UserEntity;
import com.univoyage.user.repository.UserRepository;
import com.univoyage.user.model.Role;

import com.univoyage.auth.security.CookieUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import java.time.Instant;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setup() {
        userRepository.deleteAll();

        UserEntity user = UserEntity.builder()
                .email("test@univoyage.com")
                .passwordHash(passwordEncoder.encode("password123"))
                .role(Role.USER)
                .name("Test")
                .surname("User")
                .dateOfRegister(Instant.now())
                .build();

        userRepository.save(user);
    }

    @Test
    void login_shouldReturnJwtCookie() throws Exception {
        String body = """
        {
          "email": "test@univoyage.com",
          "password": "password123"
        }
        """;

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(cookie().exists(CookieUtils.JWT_COOKIE_NAME))
                .andExpect(cookie().exists(CookieUtils.CSRF_COOKIE_NAME));
    }
}
