package com.univoyage.reference.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ReferenceControllerIntegrationTest {

  @Autowired
  private MockMvc mockMvc;

  @Test
  @DisplayName("GET /api/reference/hobbies returns 200 and array")
  void getHobbies() throws Exception {
    mockMvc.perform(get("/api/reference/hobbies")).andExpect(status().isOk())
        .andExpect(jsonPath("$.success").value(true)).andExpect(jsonPath("$.data").isArray());
  }

  @Test
  @DisplayName("GET /api/reference/languages returns 200 and array")
  void getLanguages() throws Exception {
    mockMvc.perform(get("/api/reference/languages")).andExpect(status().isOk())
        .andExpect(jsonPath("$.success").value(true)).andExpect(jsonPath("$.data").isArray());
  }

  @Test
  @DisplayName("GET /api/reference/countries returns 200 and array")
  void getCountries() throws Exception {
    mockMvc.perform(get("/api/reference/countries")).andExpect(status().isOk())
        .andExpect(jsonPath("$.success").value(true)).andExpect(jsonPath("$.data").isArray());
  }
}
