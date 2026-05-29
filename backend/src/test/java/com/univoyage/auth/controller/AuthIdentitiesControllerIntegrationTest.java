package com.univoyage.auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.univoyage.auth.model.UserIdentity;
import com.univoyage.auth.repository.UserIdentityRepository;
import com.univoyage.auth.security.JwtService;
import com.univoyage.reference.country.model.Country;
import com.univoyage.reference.country.repository.CountryRepository;
import com.univoyage.user.model.Role;
import com.univoyage.user.model.UserEntity;
import com.univoyage.user.repository.UserRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import jakarta.servlet.http.Cookie;

import java.time.Instant;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthIdentitiesControllerIntegrationTest {

  @Autowired
  MockMvc mockMvc;

  @Autowired
  UserRepository userRepository;

  @Autowired
  UserIdentityRepository userIdentityRepository;

  @Autowired
  CountryRepository countryRepository;

  @Autowired
  JwtService jwtService;

  @Autowired
  ObjectMapper objectMapper;

  private Cookie authCookie;

  @BeforeEach
  void setUp() {
    userIdentityRepository.deleteAll();
    userRepository.deleteAll();

    Country country = countryRepository.findByIsoCode("HR").orElseThrow();
    UserEntity user = userRepository.save(UserEntity.builder().name("Test").surname("User")
        .email("identities-test@example.com").passwordHash("hash").country(country)
        .dateOfRegister(Instant.now()).dateOfLastSignin(Instant.now()).role(Role.USER).build());

    userIdentityRepository
        .save(UserIdentity.builder().user(user).provider("google").providerSubject("google-sub-1")
            .providerEmail(user.getEmail()).emailVerified(true).build());

    authCookie = new Cookie("auth_token", jwtService.generateForUser(user).jwt());
  }

  @Test
  void listIdentities_requiresAuth() throws Exception {
    mockMvc.perform(get("/api/auth/identities")).andExpect(status().isUnauthorized());
  }

  @Test
  void listIdentities_returnsPasswordAndLinkedProvidersWithoutInternalIds() throws Exception {
    mockMvc
        .perform(get("/api/auth/identities").cookie(authCookie).accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk()).andExpect(jsonPath("$.success").value(true))
        .andExpect(jsonPath("$.data[0].provider").value("password"))
        .andExpect(jsonPath("$.data[0].label").value("Email & password"))
        .andExpect(jsonPath("$.data[1].provider").value("google"))
        .andExpect(jsonPath("$.data[1].label").value("Google"))
        .andExpect(jsonPath("$.data[1].linkedAt").exists())
        .andExpect(jsonPath("$.data[1].providerSubject").doesNotExist())
        .andExpect(jsonPath("$.data[1].id").doesNotExist());
  }
}
