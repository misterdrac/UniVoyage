package com.univoyage.ai.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.univoyage.ai.dto.BudgetEstimateRequest;
import com.univoyage.ai.dto.GeminiResponse;
import com.univoyage.ai.dto.ItineraryRequest;
import com.univoyage.ai.dto.PackingRequest;
import com.univoyage.ai.service.GeminiService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Full-stack integration tests for {@link GeminiController} with {@link GeminiService} mocked.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class GeminiControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private GeminiService geminiService;

    @Test
    @DisplayName("GET /api/ai/status returns 401 without authentication")
    void getStatusUnauthenticated_returns401() throws Exception {
        mockMvc.perform(get("/api/ai/status"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @WithMockUser
    @DisplayName("GET /api/ai/status returns configured flag from service")
    void getStatusAuthenticated_returnsPayload() throws Exception {
        when(geminiService.isConfigured()).thenReturn(true);

        mockMvc.perform(get("/api/ai/status"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").value(true));
    }

    @Test
    @WithMockUser
    @DisplayName("POST /api/ai/itinerary returns 200 with content when service succeeds")
    void postItinerary_success() throws Exception {
        when(geminiService.generateItinerary(any(ItineraryRequest.class)))
                .thenReturn(GeminiResponse.success("day 1: museum"));

        ItineraryRequest req = new ItineraryRequest();
        req.setLocationLabel("Paris");
        req.setDepartureDate("2026-06-01");
        req.setReturnDate("2026-06-07");
        req.setItineraryDates(List.of());

        mockMvc.perform(post("/api/ai/itinerary")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content").value("day 1: museum"));
    }

    @Test
    @WithMockUser
    @DisplayName("POST /api/ai/itinerary returns 200 with error payload when service reports failure")
    void postItinerary_serviceError_returnsOkWithFail() throws Exception {
        when(geminiService.generateItinerary(any(ItineraryRequest.class)))
                .thenReturn(GeminiResponse.error("quota exceeded"));

        ItineraryRequest req = new ItineraryRequest();
        req.setLocationLabel("Paris");
        req.setDepartureDate("2026-06-01");
        req.setReturnDate("2026-06-07");
        req.setItineraryDates(List.of());

        mockMvc.perform(post("/api/ai/itinerary")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").value("quota exceeded"));
    }

    @Test
    @WithMockUser
    @DisplayName("POST /api/ai/itinerary returns 400 when required fields are missing")
    void postItinerary_validationFails() throws Exception {
        mockMvc.perform(post("/api/ai/itinerary")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @WithMockUser
    @DisplayName("POST /api/ai/packing returns 200 when service succeeds")
    void postPacking_success() throws Exception {
        when(geminiService.generatePackingSuggestions(any(PackingRequest.class)))
                .thenReturn(GeminiResponse.success("bring umbrella"));

        PackingRequest req = new PackingRequest();
        req.setDestinationName("Oslo");
        req.setDepartureDate("2026-01-10");
        req.setReturnDate("2026-01-20");
        req.setForecastSummary("cold and wet");

        mockMvc.perform(post("/api/ai/packing")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content").value("bring umbrella"));
    }

    @Test
    @WithMockUser
    @DisplayName("POST /api/ai/packing returns 400 when body is invalid")
    void postPacking_validationFails() throws Exception {
        mockMvc.perform(post("/api/ai/packing")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"destinationName\":\"\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @WithMockUser
    @DisplayName("POST /api/ai/budget-estimate returns 200 when service succeeds")
    void postBudgetEstimate_success() throws Exception {
        when(geminiService.generateBudgetEstimate(any(BudgetEstimateRequest.class)))
                .thenReturn(GeminiResponse.success("~500 EUR"));

        BudgetEstimateRequest req = new BudgetEstimateRequest();
        req.setDestinationName("Lisbon");
        req.setDestinationLocation("Portugal");
        req.setDepartureDate("2026-03-01");
        req.setReturnDate("2026-03-10");

        mockMvc.perform(post("/api/ai/budget-estimate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content").value("~500 EUR"));
    }

    @Test
    @WithMockUser
    @DisplayName("POST /api/ai/budget-estimate returns 400 when required string is blank")
    void postBudgetEstimate_validationFails() throws Exception {
        mockMvc.perform(post("/api/ai/budget-estimate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"destinationName":" ","destinationLocation":"Lisbon",
                                "departureDate":"2026-03-01","returnDate":"2026-03-10"}"""))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }
}
