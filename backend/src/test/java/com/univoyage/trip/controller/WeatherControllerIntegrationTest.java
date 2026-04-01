package com.univoyage.trip.controller;

import com.univoyage.trip.service.WeatherService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Full-stack integration tests for {@link WeatherController} with {@link WeatherService} mocked.
 */
@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class WeatherControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private WeatherService weatherService;

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
}
