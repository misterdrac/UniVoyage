package com.univoyage.trip.controller;

import com.univoyage.trip.service.GeoapifyService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Full-stack integration tests for {@link PlacesController} with {@link GeoapifyService} mocked.
 */
@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class PlacesControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private GeoapifyService geoapifyService;

    @Test
    @DisplayName("GET /api/places/search returns places from Geoapify service")
    void placesSearchOk() throws Exception {
        GeoapifyService.PointOfInterest poi = new GeoapifyService.PointOfInterest();
        poi.setId("p1");
        poi.setName("Museum");
        poi.setCategory("tourism");
        when(geoapifyService.searchPlaces("Lyon", 10)).thenReturn(List.of(poi));

        mockMvc.perform(get("/api/places/search")
                        .param("city", "Lyon")
                        .param("limit", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.places[0].name").value("Museum"));
    }

    @Test
    @DisplayName("GET /api/places/search returns 400 when city parameter is missing")
    void placesSearchMissingCity_returns400() throws Exception {
        mockMvc.perform(get("/api/places/search"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("GET /api/places/search caps limit at 22 when calling Geoapify")
    void placesSearchCapsLimit() throws Exception {
        when(geoapifyService.searchPlaces(anyString(), anyInt())).thenReturn(List.of());

        mockMvc.perform(get("/api/places/search")
                        .param("city", "Zurich")
                        .param("limit", "999"))
                .andExpect(status().isOk());

        verify(geoapifyService).searchPlaces("Zurich", 22);
    }

    @Test
    @DisplayName("GET /api/places/search returns 503 when Geoapify reports IllegalStateException")
    void placesSearchServiceUnavailable() throws Exception {
        when(geoapifyService.searchPlaces("X", 10))
                .thenThrow(new IllegalStateException("Geoapify API key is not configured"));

        mockMvc.perform(get("/api/places/search").param("city", "X"))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").value("Geoapify API key is not configured"));
    }

    @Test
    @DisplayName("GET /api/places/search returns 502 on generic runtime failure")
    void placesSearchBadGateway() throws Exception {
        when(geoapifyService.searchPlaces("Y", 10)).thenThrow(new RuntimeException("timeout"));

        mockMvc.perform(get("/api/places/search").param("city", "Y"))
                .andExpect(status().isBadGateway())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").value("Failed to fetch places: timeout"));
    }
}
