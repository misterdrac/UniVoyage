package com.univoyage.contact.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.matchesPattern;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class ContactControllerIntegrationTest {

  private static final String VALID_BODY = """
      {
        "name": "Jane Doe",
        "email": "jane@example.com",
        "subject": "Trip planning question",
        "message": "I would like to know more about student travel options in Europe."
      }
      """;

  @Autowired
  private MockMvc mockMvc;

  @Test
  @DisplayName("POST /api/contact accepts valid payload and returns reference id")
  void submitContactForm_success() throws Exception {
    mockMvc
        .perform(post("/api/contact").contentType(MediaType.APPLICATION_JSON).content(VALID_BODY))
        .andExpect(status().isOk()).andExpect(jsonPath("$.success").value(true))
        .andExpect(jsonPath("$.data.message")
            .value("Thank you for reaching out! We'll get back to you within 24-48 hours."))
        .andExpect(jsonPath("$.data.referenceId").value(matchesPattern("[A-F0-9]{8}")));
  }

  @Test
  @DisplayName("POST /api/contact returns 400 when required fields are missing")
  void submitContactForm_missingFields() throws Exception {
    mockMvc
        .perform(post("/api/contact").contentType(MediaType.APPLICATION_JSON)
            .content("{\"email\":\"jane@example.com\"}"))
        .andExpect(status().isBadRequest()).andExpect(jsonPath("$.success").value(false))
        .andExpect(jsonPath("$.error").value("Validation failed for the request payload."))
        .andExpect(jsonPath("$.data.name").exists());
  }

  @Test
  @DisplayName("POST /api/contact returns 400 for invalid email")
  void submitContactForm_invalidEmail() throws Exception {
    mockMvc.perform(post("/api/contact").contentType(MediaType.APPLICATION_JSON).content("""
        {
          "name": "Jane Doe",
          "email": "not-an-email",
          "subject": "Hello",
          "message": "This message is long enough for validation."
        }
        """)).andExpect(status().isBadRequest()).andExpect(jsonPath("$.success").value(false))
        .andExpect(jsonPath("$.data.email").exists());
  }

  @Test
  @DisplayName("POST /api/contact returns 400 when message is too short")
  void submitContactForm_messageTooShort() throws Exception {
    mockMvc.perform(post("/api/contact").contentType(MediaType.APPLICATION_JSON).content("""
        {
          "name": "Jane Doe",
          "email": "jane@example.com",
          "subject": "Hello",
          "message": "short"
        }
        """)).andExpect(status().isBadRequest()).andExpect(jsonPath("$.success").value(false))
        .andExpect(jsonPath("$.data.message").exists());
  }

  @Test
  @DisplayName("POST /api/contact returns 400 for malformed JSON")
  void submitContactForm_malformedJson() throws Exception {
    mockMvc
        .perform(post("/api/contact").contentType(MediaType.APPLICATION_JSON).content("{bad json"))
        .andExpect(status().isBadRequest()).andExpect(jsonPath("$.success").value(false));
  }
}
