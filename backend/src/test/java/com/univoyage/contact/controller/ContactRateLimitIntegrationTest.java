package com.univoyage.contact.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {"app.contact.ip-max-attempts=2", "app.contact.ip-window=PT1H"})
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class ContactRateLimitIntegrationTest {

  private static final String VALID_BODY = """
      {
        "name": "Jane Doe",
        "email": "jane@example.com",
        "subject": "Rate limit test",
        "message": "Checking contact form IP rate limiting behaviour."
      }
      """;

  @Autowired
  private MockMvc mockMvc;

  @Test
  @DisplayName("POST /api/contact returns 429 when IP exceeds configured window limit")
  void contactFormRateLimitedByIp() throws Exception {
    mockMvc
        .perform(post("/api/contact").contentType(MediaType.APPLICATION_JSON).content(VALID_BODY))
        .andExpect(status().isOk());

    mockMvc
        .perform(post("/api/contact").contentType(MediaType.APPLICATION_JSON).content(VALID_BODY))
        .andExpect(status().isOk());

    mockMvc
        .perform(post("/api/contact").contentType(MediaType.APPLICATION_JSON).content(VALID_BODY))
        .andExpect(status().isTooManyRequests()).andExpect(header().exists("Retry-After"))
        .andExpect(jsonPath("$.success").value(false)).andExpect(
            jsonPath("$.error").value("Too many contact submissions. Please try again later."));
  }

  @Test
  @DisplayName("X-Forwarded-For first hop is rate-limited separately per client IP")
  void rateLimitUsesXForwardedForWhenPresent() throws Exception {
    for (int i = 0; i < 2; i++) {
      mockMvc
          .perform(post("/api/contact").header("X-Forwarded-For", "203.0.113.10")
              .contentType(MediaType.APPLICATION_JSON).content(VALID_BODY))
          .andExpect(status().isOk());
    }

    mockMvc
        .perform(post("/api/contact").header("X-Forwarded-For", "203.0.113.10")
            .contentType(MediaType.APPLICATION_JSON).content(VALID_BODY))
        .andExpect(status().isTooManyRequests());

    mockMvc
        .perform(post("/api/contact").header("X-Forwarded-For", "203.0.113.20")
            .contentType(MediaType.APPLICATION_JSON).content(VALID_BODY))
        .andExpect(status().isOk());
  }
}
