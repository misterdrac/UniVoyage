package com.univoyage.admin.audit.controller;

import com.univoyage.auth.security.JwtAuthenticationFilter;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class AdminAuditLogControllerIntegrationTest {

  @Autowired
  private MockMvc mockMvc;

  @Test
  @WithMockUser(roles = "ADMIN")
  @DisplayName("GET /api/admin/audit-logs returns a page")
  void list_ok() throws Exception {
    mockMvc.perform(get("/api/admin/audit-logs").with(request -> {
      request.setAttribute(JwtAuthenticationFilter.TFA_REQUEST_ATTRIBUTE, Boolean.TRUE);
      return request;
    })).andExpect(status().isOk()).andExpect(jsonPath("$.success").value(true))
        .andExpect(jsonPath("$.data.content").isArray());
  }
}
