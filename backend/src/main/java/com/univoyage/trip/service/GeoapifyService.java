package com.univoyage.trip.service;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import jakarta.annotation.PostConstruct;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
public class GeoapifyService {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${GEOAPIFY_API_KEY:}")
    private String geoapifyApiKey;

    private static final String GEOCODE_URL = "https://api.geoapify.com/v1/geocode/search";
    private static final String PLACES_URL = "https://api.geoapify.com/v2/places";

    @PostConstruct
    public void init() {
        if (geoapifyApiKey == null || geoapifyApiKey.isBlank()) {
            log.warn("GEOAPIFY_API_KEY is not configured. Places features will not work. " +
                    "Please set GEOAPIFY_API_KEY in your .env file and restart the server.");
        } else {
            log.info("Geoapify API key configured successfully (length: {})", geoapifyApiKey.length());
        }
    }

    /**
     * Search for tourism points of interest in a city
     * @param city City name to search in
     * @param limit Maximum number of results
     * @return List of points of interest
     */
    public List<PointOfInterest> searchPlaces(String city, int limit) {
        if (geoapifyApiKey == null || geoapifyApiKey.isBlank()) {
            log.error("GEOAPIFY_API_KEY is not configured");
            throw new IllegalStateException("Geoapify API key is not configured");
        }

        try {
            // First, geocode the city to get its place_id
            String placeId = geocodeCity(city);
            if (placeId == null) {
                log.warn("Could not geocode city: {}", city);
                return List.of();
            }

            // Then search for tourism places within that city
            return searchPlacesInCity(placeId, limit);
        } catch (Exception e) {
            log.error("Failed to search places for city: {}", city, e);
            throw new RuntimeException("Failed to fetch places: " + e.getMessage(), e);
        }
    }

    private String geocodeCity(String city) {
        String url = String.format("%s?text=%s&type=city&limit=1&apiKey=%s",
                GEOCODE_URL,
                URLEncoder.encode(city, StandardCharsets.UTF_8),
                geoapifyApiKey);

        log.info("Geocoding city: {}", city);

        try {
            GeocodeResponse response = restTemplate.getForObject(url, GeocodeResponse.class);
            if (response != null && response.features != null && !response.features.isEmpty()) {
                String placeId = response.features.get(0).properties.placeId;
                log.info("Found place_id for {}: {}", city, placeId);
                return placeId;
            }
        } catch (Exception e) {
            log.error("Geocoding failed for city: {}", city, e);
        }

        return null;
    }

    private List<PointOfInterest> searchPlacesInCity(String placeId, int limit) {
        String categories = "tourism";
        
        String url = String.format("%s?categories=%s&filter=place:%s&limit=%d&apiKey=%s",
                PLACES_URL,
                categories,
                placeId,
                Math.min(limit, 22),
                geoapifyApiKey);

        log.info("Searching places with URL: {}", url.replace(geoapifyApiKey, "***"));

        try {
            PlacesResponse response = restTemplate.getForObject(url, PlacesResponse.class);
            if (response == null || response.features == null) {
                return List.of();
            }

            return response.features.stream()
                    .map(this::mapToPointOfInterest)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Places search failed", e);
            throw new RuntimeException("Failed to search places: " + e.getMessage(), e);
        }
    }

    private PointOfInterest mapToPointOfInterest(PlaceFeature feature) {
        PlaceProperties props = feature.properties;
        
        PointOfInterest poi = new PointOfInterest();
        poi.setId(props.placeId != null ? props.placeId : "unknown");
        poi.setName(props.name != null ? props.name : "Unknown Place");
        String historicType = props.historic != null ? props.historic.type : null;
        String description = extractDescription(props);
        poi.setCategory(PlaceCategoryMapper.extractCategory(props.categories, props.name, historicType, description));
        poi.setDescription(extractDescription(props));
        poi.setAddress(props.formatted != null ? props.formatted : props.addressLine2);
        poi.setWebsite(props.website);
        poi.setWikipedia(extractWikipediaUrl(props));
        
        // Extract coordinates
        if (feature.geometry != null && feature.geometry.coordinates != null 
                && feature.geometry.coordinates.size() >= 2) {
            poi.setLongitude(feature.geometry.coordinates.get(0));
            poi.setLatitude(feature.geometry.coordinates.get(1));
        }

        return poi;
    }


    private String extractDescription(PlaceProperties props) {
        StringBuilder desc = new StringBuilder();
        
        if (props.historic != null && props.historic.type != null) {
            desc.append("Historic ").append(props.historic.type);
            if (props.historic.startDate != null) {
                desc.append(" from ").append(props.historic.startDate);
            }
        }
        
        if (props.wikiAndMedia != null && props.wikiAndMedia.wikipedia != null) {
            if (desc.length() > 0) desc.append(". ");
            desc.append("See Wikipedia for more details.");
        }

        return desc.length() > 0 ? desc.toString() : null;
    }

    private String extractWikipediaUrl(PlaceProperties props) {
        if (props.wikiAndMedia != null && props.wikiAndMedia.wikipedia != null) {
            String[] parts = props.wikiAndMedia.wikipedia.split(":");
            if (parts.length >= 2) {
                String article = parts[1];
                String articleWithUnderscores = article.replace(" ", "_");
                String encodedArticle = URLEncoder.encode(articleWithUnderscores, StandardCharsets.UTF_8)
                        .replace("+", "_");
                return String.format("https://en.wikipedia.org/wiki/%s", encodedArticle);
            }
        }
        return null;
    }

    // RESPONSE DTOs

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class GeocodeResponse {
        private List<GeocodeFeature> features;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class GeocodeFeature {
        private GeocodeProperties properties;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class GeocodeProperties {
        @JsonProperty("place_id")
        private String placeId;
        private String name;
        private String city;
        private String country;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class PlacesResponse {
        private List<PlaceFeature> features;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class PlaceFeature {
        private PlaceProperties properties;
        private PlaceGeometry geometry;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class PlaceGeometry {
        private List<Double> coordinates;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class PlaceProperties {
        private String name;
        @JsonProperty("place_id")
        private String placeId;
        private String formatted;
        @JsonProperty("address_line1")
        private String addressLine1;
        @JsonProperty("address_line2")
        private String addressLine2;
        private List<String> categories;
        private String website;
        @JsonProperty("opening_hours")
        private String openingHours;
        @JsonProperty("wiki_and_media")
        private WikiAndMedia wikiAndMedia;
        private Historic historic;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class WikiAndMedia {
        private String wikidata;
        private String wikipedia;
        @JsonProperty("wikimedia_commons")
        private String wikimediaCommons;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class Historic {
        private String type;
        @JsonProperty("start_date")
        private String startDate;
        @JsonProperty("castle_type")
        private String castleType;
    }

    // PUBLIC DTO

    @Data
    public static class PointOfInterest {
        private String id;
        private String name;
        private String category;
        private String description;
        private String address;
        private String website;
        private String wikipedia;
        private Double latitude;
        private Double longitude;
    }
}

