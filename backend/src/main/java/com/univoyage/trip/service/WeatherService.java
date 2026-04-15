package com.univoyage.trip.service;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import jakarta.annotation.PostConstruct;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

/**
 * Service for fetching weather data from OpenWeather API
 */
@Log4j2
@Service
public class WeatherService {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${OPENWEATHER_API_KEY:}")
    private String openWeatherApiKey;

    @PostConstruct
    public void init() {
        if (openWeatherApiKey == null || openWeatherApiKey.isBlank()) {
            log.warn("OPENWEATHER_API_KEY is not configured. Weather features will not work. " +
                    "Please set OPENWEATHER_API_KEY in your .env file and restart the server.");
        } else {
            log.info("OpenWeather API key configured successfully (length: {})", openWeatherApiKey.length());
        }
    }

    private static final String CURRENT_WEATHER_URL = "https://api.openweathermap.org/data/2.5/weather";
    private static final String FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast";

    /**
     * Get current weather - returns processed data matching frontend WeatherData format
     */
    public WeatherResponse getCurrentWeather(String city, String country) {
        if (openWeatherApiKey == null || openWeatherApiKey.isBlank()) {
            throw new IllegalStateException("OpenWeather API key is not configured");
        }

        // OpenWeather API works best with just city name
        // Only include country if it's a short country code (2-3 letters)
        String queryLocation = city;
        
        String url = String.format("%s?q=%s&APPID=%s&units=metric", 
            CURRENT_WEATHER_URL, 
            URLEncoder.encode(queryLocation, StandardCharsets.UTF_8),
            openWeatherApiKey);

        try {
            OpenWeatherResponse response = restTemplate.getForObject(url, OpenWeatherResponse.class);
            if (response == null) {
                throw new RuntimeException("Failed to fetch weather data");
            }

            return mapToWeatherResponse(response);
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch current weather: " + e.getMessage(), e);
        }
    }

    /**
     * Get current weather by coordinates - returns processed data matching frontend WeatherData format
     */
    public WeatherResponse getCurrentWeatherByCoordinates(double latitude, double longitude) {
        if (openWeatherApiKey == null || openWeatherApiKey.isBlank()) {
            throw new IllegalStateException("OpenWeather API key is not configured");
        }

        String url = String.format("%s?lat=%.4f&lon=%.4f&APPID=%s&units=metric", 
            CURRENT_WEATHER_URL, latitude, longitude, openWeatherApiKey);

        try {
            OpenWeatherResponse response = restTemplate.getForObject(url, OpenWeatherResponse.class);
            if (response == null) {
                throw new RuntimeException("Failed to fetch weather data");
            }

            return mapToWeatherResponse(response);
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch current weather: " + e.getMessage(), e);
        }
    }

    /**
     * Get forecast - returns raw OpenWeather response (frontend handles grouping)
     */
    public Map<String, Object> getForecast(String city, String country) {
        if (openWeatherApiKey == null || openWeatherApiKey.isBlank()) {
            throw new IllegalStateException("OpenWeather API key is not configured");
        }

        // OpenWeather API works best with just city name
        // Only include country if it's a short country code (2-3 letters)
        String queryLocation = city;
        
        String url = String.format("%s?q=%s&APPID=%s&units=metric", 
            FORECAST_URL, 
            URLEncoder.encode(queryLocation, StandardCharsets.UTF_8),
            openWeatherApiKey);

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            if (response == null) {
                throw new RuntimeException("Failed to fetch forecast data");
            }
            return response;
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch forecast: " + e.getMessage(), e);
        }
    }

    private WeatherResponse mapToWeatherResponse(OpenWeatherResponse response) {
        WeatherResponse weatherResponse = new WeatherResponse();
        weatherResponse.setCity(response.name);
        weatherResponse.setTemperature((int) Math.round(response.main.temp));
        
        String weatherMain = response.weather != null && !response.weather.isEmpty() 
            ? response.weather.get(0).main 
            : "Clear";
        weatherResponse.setWeatherType(mapWeatherType(weatherMain));
        
        weatherResponse.setDateTime(formatDateTimeForTimezone(response.timezone != null ? response.timezone : 0));
        weatherResponse.setDay(response.weather != null && !response.weather.isEmpty() 
            && response.weather.get(0).icon != null 
            && response.weather.get(0).icon.contains("d"));
        weatherResponse.setTimezoneOffsetSeconds(response.timezone != null ? response.timezone : 0);
        
        return weatherResponse;
    }

    private String mapWeatherType(String weatherMain) {
        if (weatherMain == null) return "clear";
        return switch (weatherMain.toLowerCase()) {
            case "clear" -> "clear";
            case "clouds" -> "clouds";
            case "rain", "drizzle" -> "rain";
            case "thunderstorm" -> "thunderstorm";
            case "snow" -> "snow";
            case "mist", "fog", "haze" -> "mist";
            default -> "unknown";
        };
    }

    private String formatDateTimeForTimezone(int timezoneOffsetSeconds) {
        // Format similar to frontend: "Mon, Jun 2, 3:45 PM"
        LocalDateTime now = LocalDateTime.now(ZoneOffset.ofTotalSeconds(timezoneOffsetSeconds));
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("E, MMM d, h:mm a");
        return now.format(formatter);
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class WeatherResponse {
        private String city;
        private int temperature;
        private String weatherType; // 'clear' | 'clouds' | 'rain' | 'snow' | 'thunderstorm' | 'mist' | 'unknown'
        private String dateTime;
        @JsonProperty("isDay")
        private boolean day;
        private int timezoneOffsetSeconds;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class OpenWeatherResponse {
        private String name;
        private MainData main;
        private List<WeatherData> weather;
        private Integer timezone;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class MainData {
        private Double temp;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class WeatherData {
        private String main;
        private String icon;
    }
}

