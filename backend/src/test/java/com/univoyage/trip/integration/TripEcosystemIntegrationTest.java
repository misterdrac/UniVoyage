package com.univoyage.trip.integration;

import com.univoyage.hotel.dto.HotelResponse;
import com.univoyage.hotel.service.HotelService;
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
 * Full-context integration tests for places and hotel HTTP APIs (see also
 * {@link com.univoyage.trip.controller.HeatmapControllerIntegrationTest} and
 * {@link com.univoyage.trip.controller.WeatherControllerIntegrationTest}).
 */
@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class TripEcosystemIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private GeoapifyService geoapifyService;

    @MockBean
    private HotelService hotelService;

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
