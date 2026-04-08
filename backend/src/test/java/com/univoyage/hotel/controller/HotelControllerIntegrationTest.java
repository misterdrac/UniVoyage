package com.univoyage.hotel.controller;

import com.univoyage.hotel.dto.HotelResponse;
import com.univoyage.hotel.service.HotelService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Full-stack integration tests for {@link HotelController} with {@link HotelService} mocked.
 */
@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class HotelControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private HotelService hotelService;

    @Test
    @DisplayName("GET /api/hotels/search returns hotels limited by query param")
    void hotelSearchOk() throws Exception {
        List<HotelResponse> many = List.of(
                HotelResponse.builder().hotelName("A").hotelId("1").build(),
                HotelResponse.builder().hotelName("B").hotelId("2").build(),
                HotelResponse.builder().hotelName("C").hotelId("3").build());
        when(hotelService.searchHotels("Berlin")).thenReturn(many);

        mockMvc.perform(get("/api/hotels/search")
                        .param("city", "Berlin")
                        .param("limit", "2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.hotels.length()").value(2))
                .andExpect(jsonPath("$.data.hotels[0].hotelName").value("A"));
    }

    @Test
    @DisplayName("GET /api/hotels/search returns 400 when city parameter is missing")
    void hotelSearchMissingCity_returns400() throws Exception {
        mockMvc.perform(get("/api/hotels/search"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("GET /api/hotels/search returns 503 when hotel service reports IllegalStateException")
    void hotelSearchServiceUnavailable() throws Exception {
        when(hotelService.searchHotels("Z")).thenThrow(new IllegalStateException("no provider"));

        mockMvc.perform(get("/api/hotels/search").param("city", "Z"))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.error").value("no provider"));
    }

    @Test
    @DisplayName("GET /api/hotels/search returns 502 on generic runtime failure")
    void hotelSearchBadGateway() throws Exception {
        when(hotelService.searchHotels("W")).thenThrow(new RuntimeException("broken"));

        mockMvc.perform(get("/api/hotels/search").param("city", "W"))
                .andExpect(status().isBadGateway())
                .andExpect(jsonPath("$.error").value("Failed to fetch hotels: broken"));
    }

    @Test
    @DisplayName("GET /api/hotels/status returns configuration flag")
    void hotelStatus() throws Exception {
        when(hotelService.isConfigured()).thenReturn(true);

        mockMvc.perform(get("/api/hotels/status"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").value(true));
    }
}
