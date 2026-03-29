package com.univoyage.admin.destination.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.univoyage.admin.destination.dto.AdminPatchDestinationRequest;
import com.univoyage.admin.destination.dto.AdminUpdateDestinationRequest;
import com.univoyage.destination.model.DestinationEntity;
import com.univoyage.destination.repository.DestinationRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Full-stack integration tests for {@link AdminDestinationController}.
 * Servlet filters are disabled so role checks are not exercised here; focus is controller, validation,
 * and persistence via {@link com.univoyage.admin.destination.service.AdminDestinationService}.
 */
@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
@Transactional
class AdminDestinationControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private DestinationRepository destinationRepository;

    @Test
    @DisplayName("GET /api/admin/destinations returns a page")
    void listDestinations() throws Exception {
        mockMvc.perform(get("/api/admin/destinations"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content").isArray());
    }

    @Test
    @DisplayName("GET /api/admin/destinations/{id} returns destination when present")
    void getDestination_ok() throws Exception {
        long id = destinationRepository.findAll(PageRequest.of(0, 1)).getContent().getFirst().getId();

        mockMvc.perform(get("/api/admin/destinations/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(id));
    }

    @Test
    @DisplayName("GET /api/admin/destinations/{id} returns 404 when missing")
    void getDestination_notFound() throws Exception {
        mockMvc.perform(get("/api/admin/destinations/{id}", 9_999_999_999L))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("POST /api/admin/destinations returns 400 when required fields are invalid")
    void createDestination_validationFails() throws Exception {
        mockMvc.perform(post("/api/admin/destinations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"\",\"location\":\"L\",\"continent\":\"EU\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("PATCH /api/admin/destinations/{id} updates allowed fields")
    void patchDestination_ok() throws Exception {
        DestinationEntity dest = destinationRepository.findAll(PageRequest.of(0, 1)).getContent().getFirst();
        String newName = "AdminPatchName-" + dest.getId();

        AdminPatchDestinationRequest body = new AdminPatchDestinationRequest(
                newName, null, null, null, null, null, null, null, null);

        mockMvc.perform(patch("/api/admin/destinations/{id}", dest.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value(newName));
    }

    @Test
    @DisplayName("PATCH /api/admin/destinations/{id} returns 404 when destination missing")
    void patchDestination_notFound() throws Exception {
        AdminPatchDestinationRequest body = new AdminPatchDestinationRequest(
                "X", null, null, null, null, null, null, null, null);

        mockMvc.perform(patch("/api/admin/destinations/{id}", 9_999_999_999L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("PUT /api/admin/destinations/{id} returns 404 when destination missing")
    void putDestination_notFound() throws Exception {
        AdminUpdateDestinationRequest body = new AdminUpdateDestinationRequest(
                "N", "Loc", "EU", null, null, null, null, null, java.util.List.of());

        mockMvc.perform(put("/api/admin/destinations/{id}", 9_999_999_999L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("DELETE /api/admin/destinations/{id} returns 404 when destination missing")
    void deleteDestination_notFound() throws Exception {
        mockMvc.perform(delete("/api/admin/destinations/{id}", 9_999_999_999L))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false));
    }
}
