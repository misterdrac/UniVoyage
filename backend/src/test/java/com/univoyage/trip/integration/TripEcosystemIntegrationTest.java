package com.univoyage.trip.integration;

import com.univoyage.destination.model.DestinationEntity;
import com.univoyage.destination.repository.DestinationRepository;
import com.univoyage.hotel.dto.HotelResponse;
import com.univoyage.hotel.service.HotelService;
import com.univoyage.reference.country.model.Country;
import com.univoyage.reference.country.repository.CountryRepository;
import com.univoyage.trip.model.TripEntity;
import com.univoyage.trip.repository.TripRepository;
import com.univoyage.trip.service.GeoapifyService;
import com.univoyage.trip.service.WeatherService;
import com.univoyage.user.model.Role;
import com.univoyage.user.model.UserEntity;
import com.univoyage.user.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Full-context integration tests for trip-adjacent HTTP APIs: heatmap (DB-backed), weather, places,
 * and hotels. External providers are mocked so tests stay deterministic and offline.
 */
@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
@Transactional
class TripEcosystemIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CountryRepository countryRepository;

    @Autowired
    private DestinationRepository destinationRepository;

    @Autowired
    private TripRepository tripRepository;

    @MockBean
    private WeatherService weatherService;

    @MockBean
    private GeoapifyService geoapifyService;

    @MockBean
    private HotelService hotelService;

    @Test
    @DisplayName("GET /api/heatmap returns points array (may be empty)")
    void heatmapReturnsOk() throws Exception {
        mockMvc.perform(get("/api/heatmap"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.points").isArray());
    }

    @Test
    @DisplayName("GET /api/heatmap aggregates trip counts per destination")
    void heatmapAggregatesTripsPerDestination() throws Exception {
        UserEntity user = saveUser("heatmap-user@example.com");
        Country lu = country("LU");
        Country mt = country("MT");
        DestinationEntity d1 = saveDestination("HeatmapCityA", lu);
        DestinationEntity d2 = saveDestination("HeatmapCityB", mt);
        saveTrip(user.getId(), d1);
        saveTrip(user.getId(), d1);
        saveTrip(user.getId(), d2);

        mockMvc.perform(get("/api/heatmap"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.points[0].destinationName").value("HeatmapCityA"))
                .andExpect(jsonPath("$.data.points[0].tripCount").value(2))
                .andExpect(jsonPath("$.data.points[1].destinationName").value("HeatmapCityB"))
                .andExpect(jsonPath("$.data.points[1].tripCount").value(1));
    }

    @Test
    @DisplayName("GET /api/weather/current returns 400 when city and coordinates are missing")
    void weatherCurrentRequiresLocation() throws Exception {
        mockMvc.perform(get("/api/weather/current"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").value("Either city or lat/lon parameters are required"));
    }

    @Test
    @DisplayName("GET /api/weather/current returns weather by lat/lon")
    void weatherCurrentByCoordinates() throws Exception {
        WeatherService.WeatherResponse w = new WeatherService.WeatherResponse();
        w.setCity("Testville");
        w.setTemperature(21);
        w.setWeatherType("clear");
        w.setDateTime("Mon, Jan 1, 12:00 PM");
        w.setDay(true);
        w.setTimezoneOffsetSeconds(0);
        when(weatherService.getCurrentWeatherByCoordinates(45.5, 9.2)).thenReturn(w);

        mockMvc.perform(get("/api/weather/current")
                        .param("lat", "45.5")
                        .param("lon", "9.2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.weather.city").value("Testville"))
                .andExpect(jsonPath("$.data.weather.temperature").value(21));
    }

    @Test
    @DisplayName("GET /api/weather/current returns weather by city")
    void weatherCurrentByCity() throws Exception {
        WeatherService.WeatherResponse w = new WeatherService.WeatherResponse();
        w.setCity("Paris");
        w.setTemperature(12);
        w.setWeatherType("clouds");
        w.setDateTime("Tue, Jan 2, 3:00 PM");
        w.setDay(false);
        w.setTimezoneOffsetSeconds(3600);
        when(weatherService.getCurrentWeather("Paris", "FR")).thenReturn(w);

        mockMvc.perform(get("/api/weather/current")
                        .param("city", "Paris")
                        .param("country", "FR"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.weather.city").value("Paris"))
                .andExpect(jsonPath("$.data.weather.weatherType").value("clouds"));
    }

    @Test
    @DisplayName("GET /api/weather/current returns 500 when weather service throws")
    void weatherCurrentHandlesServiceFailure() throws Exception {
        when(weatherService.getCurrentWeatherByCoordinates(1.0, 1.0))
                .thenThrow(new RuntimeException("upstream down"));

        mockMvc.perform(get("/api/weather/current").param("lat", "1").param("lon", "1"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").value("upstream down"));
    }

    @Test
    @DisplayName("GET /api/weather/forecast returns forecast payload in data")
    void weatherForecastOk() throws Exception {
        when(weatherService.getForecast("Oslo", null)).thenReturn(Map.of("cod", "200", "cnt", 1));

        mockMvc.perform(get("/api/weather/forecast").param("city", "Oslo"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.cod").value("200"));
    }

    @Test
    @DisplayName("GET /api/weather/forecast returns 500 when service throws")
    void weatherForecastHandlesFailure() throws Exception {
        when(weatherService.getForecast("Bergen", null)).thenThrow(new RuntimeException("no forecast"));

        mockMvc.perform(get("/api/weather/forecast").param("city", "Bergen"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.success").value(false));
    }

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

    private Country country(String isoCode) {
        return countryRepository.findByIsoCode(isoCode)
                .orElseThrow(() -> new IllegalStateException("Test DB missing seeded country: " + isoCode));
    }

    private UserEntity saveUser(String email) {
        return userRepository.save(UserEntity.builder()
                .name("T")
                .surname("U")
                .email(email)
                .passwordHash("{noop}unused")
                .dateOfRegister(Instant.now())
                .role(Role.USER)
                .build());
    }

    private DestinationEntity saveDestination(String name, Country country) {
        return destinationRepository.save(DestinationEntity.builder()
                .name(name)
                .location(name)
                .continent("Europe")
                .country(country)
                .imageUrl("https://example.com/x.jpg")
                .imageAlt(name)
                .overview("Overview")
                .budgetPerDay(50)
                .whyVisit("Why")
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build());
    }

    private TripEntity saveTrip(Long userId, DestinationEntity destination) {
        return tripRepository.save(TripEntity.builder()
                .userId(userId)
                .destination(destination)
                .departureDate(LocalDate.now().plusDays(10))
                .returnDate(LocalDate.now().plusDays(14))
                .status("planned")
                .createdAt(Instant.now())
                .build());
    }
}
