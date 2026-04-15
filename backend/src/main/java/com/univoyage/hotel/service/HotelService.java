package com.univoyage.hotel.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.univoyage.hotel.dto.HotelResponse;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Service for interacting with the Amadeus Hotel API.
 * Handles authentication, token management, and hotel searches by city.
 */
@Service
@Log4j2
public class HotelService {

    private static final String AMADEUS_AUTH_URL = "https://test.api.amadeus.com/v1/security/oauth2/token";
    private static final String AMADEUS_HOTEL_LIST_URL = "https://test.api.amadeus.com/v1/reference-data/locations/hotels/by-city";
    private static final String AMADEUS_CITY_SEARCH_URL = "https://test.api.amadeus.com/v1/reference-data/locations/cities";
    private static final long TOKEN_EXPIRY_BUFFER = 60; // 1 minute buffer before expiry
    
    // Common city codes for fast lookup (most frequently searched cities)
    private static final Map<String, String> COMMON_CITY_CODES = new HashMap<>();
    
    static {
        COMMON_CITY_CODES.put("london", "LON");
        COMMON_CITY_CODES.put("paris", "PAR");
        COMMON_CITY_CODES.put("new york", "NYC");
        COMMON_CITY_CODES.put("new york city", "NYC");
        COMMON_CITY_CODES.put("nyc", "NYC");
        COMMON_CITY_CODES.put("los angeles", "LAX");
        COMMON_CITY_CODES.put("la", "LAX");
        COMMON_CITY_CODES.put("tokyo", "TYO");
        COMMON_CITY_CODES.put("sydney", "SYD");
        COMMON_CITY_CODES.put("dubai", "DXB");
        COMMON_CITY_CODES.put("singapore", "SIN");
        COMMON_CITY_CODES.put("hong kong", "HKG");
        COMMON_CITY_CODES.put("barcelona", "BCN");
        COMMON_CITY_CODES.put("rome", "ROM");
        COMMON_CITY_CODES.put("roma", "ROM");
        COMMON_CITY_CODES.put("amsterdam", "AMS");
        COMMON_CITY_CODES.put("berlin", "BER");
        COMMON_CITY_CODES.put("madrid", "MAD");
        COMMON_CITY_CODES.put("milan", "MIL");
        COMMON_CITY_CODES.put("milano", "MIL");
        COMMON_CITY_CODES.put("vienna", "VIE");
        COMMON_CITY_CODES.put("wien", "VIE");
        COMMON_CITY_CODES.put("prague", "PRG");
        COMMON_CITY_CODES.put("praha", "PRG");
        COMMON_CITY_CODES.put("budapest", "BUD");
        COMMON_CITY_CODES.put("lisbon", "LIS");
        COMMON_CITY_CODES.put("lisboa", "LIS");
        COMMON_CITY_CODES.put("athens", "ATH");
        COMMON_CITY_CODES.put("istanbul", "IST");
        COMMON_CITY_CODES.put("bangkok", "BKK");
        COMMON_CITY_CODES.put("mumbai", "BOM");
        COMMON_CITY_CODES.put("bombay", "BOM");
        COMMON_CITY_CODES.put("delhi", "DEL");
        COMMON_CITY_CODES.put("new delhi", "DEL");
        COMMON_CITY_CODES.put("seoul", "SEL");
        COMMON_CITY_CODES.put("beijing", "BJS");
        COMMON_CITY_CODES.put("shanghai", "SHA");
        COMMON_CITY_CODES.put("chicago", "CHI");
        COMMON_CITY_CODES.put("san francisco", "SFO");
        COMMON_CITY_CODES.put("miami", "MIA");
        COMMON_CITY_CODES.put("toronto", "YTO");
        COMMON_CITY_CODES.put("vancouver", "YVR");
        COMMON_CITY_CODES.put("mexico city", "MEX");
        COMMON_CITY_CODES.put("buenos aires", "BUE");
        COMMON_CITY_CODES.put("rio de janeiro", "RIO");
        COMMON_CITY_CODES.put("rio", "RIO");
        COMMON_CITY_CODES.put("cape town", "CPT");
        COMMON_CITY_CODES.put("cairo", "CAI");
        COMMON_CITY_CODES.put("moscow", "MOW");
        COMMON_CITY_CODES.put("moskva", "MOW");
        COMMON_CITY_CODES.put("dublin", "DUB");
        COMMON_CITY_CODES.put("edinburgh", "EDI");
        COMMON_CITY_CODES.put("brussels", "BRU");
        COMMON_CITY_CODES.put("bruxelles", "BRU");
        COMMON_CITY_CODES.put("zurich", "ZRH");
        COMMON_CITY_CODES.put("zürich", "ZRH");
        COMMON_CITY_CODES.put("geneva", "GVA");
        COMMON_CITY_CODES.put("genève", "GVA");
        COMMON_CITY_CODES.put("stockholm", "STO");
        COMMON_CITY_CODES.put("oslo", "OSL");
        COMMON_CITY_CODES.put("copenhagen", "CPH");
        COMMON_CITY_CODES.put("københavn", "CPH");
        COMMON_CITY_CODES.put("helsinki", "HEL");
        COMMON_CITY_CODES.put("warsaw", "WAW");
        COMMON_CITY_CODES.put("warszawa", "WAW");
        COMMON_CITY_CODES.put("krakow", "KRK");
        COMMON_CITY_CODES.put("kraków", "KRK");
        COMMON_CITY_CODES.put("zagreb", "ZAG");
        COMMON_CITY_CODES.put("split", "SPU");
        COMMON_CITY_CODES.put("dubrovnik", "DBV");
    }
    
    // Cache for dynamically fetched city codes
    private final Map<String, String> cityCodeCache = new ConcurrentHashMap<>();

    @Value("${AMADEUS_API_KEY:}")
    private String apiKey;

    @Value("${AMADEUS_API_SECRET:}")
    private String apiSecret;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    private String cachedToken;
    private Instant tokenExpiresAt;

    public HotelService() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    public boolean isConfigured() {
        return apiKey != null && !apiKey.isBlank()
            && apiSecret != null && !apiSecret.isBlank();
    }

    public List<HotelResponse> searchHotels(String city) {
        if (!isConfigured()) {
            throw new IllegalStateException("Hotel API is not configured. Please set AMADEUS_API_KEY and AMADEUS_API_SECRET.");
        }

        String token = getValidToken();
        return fetchHotels(city, token);
    }

    private String getValidToken() {
        if (cachedToken != null && tokenExpiresAt != null && Instant.now().isBefore(tokenExpiresAt)) {
            log.debug("Using cached Amadeus token");
            return cachedToken;
        }
        return refreshToken();
    }

    private String refreshToken() {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("grant_type", "client_credentials");
            body.add("client_id", apiKey);
            body.add("client_secret", apiSecret);

            HttpEntity<MultiValueMap<String, String>> entity = new HttpEntity<>(body, headers);

            log.info("Authenticating with Amadeus API...");
            ResponseEntity<String> response = restTemplate.exchange(
                AMADEUS_AUTH_URL,
                HttpMethod.POST,
                entity,
                String.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                String token = root.path("access_token").asText();
                int expiresIn = root.path("expires_in").asInt(1799);

                if (token != null && !token.isBlank()) {
                    cachedToken = token;
                    tokenExpiresAt = Instant.now().plusSeconds(expiresIn - TOKEN_EXPIRY_BUFFER);
                    log.info("Successfully obtained Amadeus access token (expires in {} seconds)", expiresIn);
                    return token;
                }
            }

            throw new RuntimeException("Failed to obtain access token from Amadeus API");
        } catch (HttpClientErrorException e) {
            log.error("Amadeus auth HTTP error status={}", e.getStatusCode());
            log.debug("Amadeus auth error body (truncated): {}", bodyPreviewForDebug(e.getResponseBodyAsString(), 512));
            throw new RuntimeException("Failed to authenticate with Amadeus API: " + e.getMessage());
        } catch (Exception e) {
            log.error("Error getting Amadeus access token", e);
            throw new RuntimeException("Failed to authenticate with Amadeus API: " + e.getMessage());
        }
    }

    private List<HotelResponse> fetchHotels(String city, String token) {
        try {
            String cityCode = getCityCode(city);
            String url = AMADEUS_HOTEL_LIST_URL + "?cityCode=" + cityCode + "&radius=10&radiusUnit=KM&hotelSource=ALL";

            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(token);
            headers.set("Accept", "application/json");

            HttpEntity<Void> entity = new HttpEntity<>(headers);

            log.info("Fetching hotels from Amadeus API for city: {} (code: {})", city, cityCode);
            ResponseEntity<String> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                entity,
                String.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return parseHotelListResponse(response.getBody());
            }

            log.warn("Amadeus API returned empty response or non-2xx status");
            return List.of();
        } catch (HttpClientErrorException e) {
            log.error("Amadeus hotel API HTTP error status={}", e.getStatusCode());
            log.debug("Amadeus hotel API error body (truncated): {}", bodyPreviewForDebug(e.getResponseBodyAsString(), 512));
            
            if (e.getStatusCode() == HttpStatus.UNAUTHORIZED) {
                log.info("Token expired, refreshing and retrying...");
                cachedToken = null;
                tokenExpiresAt = null;
                String newToken = refreshToken();
                return fetchHotels(city, newToken);
            }
            
            throw new RuntimeException("Failed to fetch hotels: " + e.getMessage());
        } catch (Exception e) {
            log.error("Error fetching hotels from Amadeus", e);
            throw new RuntimeException("Failed to fetch hotels: " + e.getMessage());
        }
    }

    private List<HotelResponse> parseHotelListResponse(String responseBody) {
        List<HotelResponse> hotels = new ArrayList<>();

        try {
            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode dataArray = root.path("data");

            if (dataArray.isArray()) {
                for (JsonNode hotelNode : dataArray) {
                    String hotelName = hotelNode.path("name").asText(null);
                    String hotelId = hotelNode.path("hotelId").asText(null);
                    
                    if (hotelName == null || hotelName.isBlank()) {
                        continue;
                    }

                    hotels.add(HotelResponse.builder()
                        .hotelName(hotelName)
                        .hotelId(hotelId)
                        .build());

                    if (hotels.size() >= 30) {
                        break;
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error parsing Amadeus hotel list response", e);
        }

        log.info("Parsed {} hotels from Amadeus response", hotels.size());
        return hotels;
    }

    private String getCityCode(String city) {
        String normalized = city.toLowerCase().trim();
        
        // Check common cities first (fast lookup, no API call needed)
        String commonCode = COMMON_CITY_CODES.get(normalized);
        if (commonCode != null) {
            return commonCode;
        }
        
        // Check cache for previously fetched codes
        String cached = cityCodeCache.get(normalized);
        if (cached != null) {
            return cached;
        }
        
        // Fetch from Amadeus API
        String token = getValidToken();
        String cityCode = fetchCityCodeFromAmadeus(city, token);
        
        if (cityCode != null && !cityCode.isBlank()) {
            // Cache the result for future use
            cityCodeCache.put(normalized, cityCode);
            log.debug("Cached IATA code for {}: {}", city, cityCode);
            return cityCode;
        }
        
        // Fallback: use first 3 characters (better than nothing, but may not work)
        String fallbackCode = normalized.length() >= 3 
            ? normalized.substring(0, 3).toUpperCase() 
            : normalized.toUpperCase();
        log.warn("Could not find IATA code for city: {}. Using fallback: {}", city, fallbackCode);
        return fallbackCode;
    }
    
    private String fetchCityCodeFromAmadeus(String city, String token) {
        try {
            String url = AMADEUS_CITY_SEARCH_URL + "?keyword=" + 
                URLEncoder.encode(city, StandardCharsets.UTF_8) + 
                "&max=1";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(token);
            headers.set("Accept", "application/json");
            
            HttpEntity<Void> entity = new HttpEntity<>(headers);
            
            log.debug("Searching for IATA code for city: {}", city);
            ResponseEntity<String> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                entity,
                String.class
            );
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                JsonNode dataArray = root.path("data");
                
                if (dataArray.isArray() && dataArray.size() > 0) {
                    JsonNode cityNode = dataArray.get(0);
                    String iataCode = cityNode.path("iataCode").asText(null);
                    if (iataCode != null && !iataCode.isBlank()) {
                        log.debug("Found IATA code for {}: {}", city, iataCode);
                        return iataCode;
                    }
                    
                    // Some cities don't have IATA code, try geocode ID as alternative
                    String geocodeId = cityNode.path("geocodeId").asText(null);
                    if (geocodeId != null && !geocodeId.isBlank()) {
                        log.debug("Found geocodeId for {}: {}", city, geocodeId);
                        return geocodeId;
                    }
                }
            }
            
            log.warn("No IATA code found in Amadeus response for city: {}", city);
            return null;
        } catch (HttpClientErrorException e) {
            if (e.getStatusCode() == HttpStatus.UNAUTHORIZED) {
                log.info("Token expired during city search, refreshing...");
                cachedToken = null;
                tokenExpiresAt = null;
                String newToken = refreshToken();
                return fetchCityCodeFromAmadeus(city, newToken);
            }
            log.error("Amadeus city search API HTTP error status={}", e.getStatusCode());
            log.debug("Amadeus city search error body (truncated): {}", bodyPreviewForDebug(e.getResponseBodyAsString(), 512));
            return null;
        } catch (Exception e) {
            log.error("Error fetching city code from Amadeus for city: {}", city, e);
            return null;
        }
    }

    private static String bodyPreviewForDebug(String body, int maxLen) {
        if (body == null || body.isBlank()) {
            return "";
        }
        String singleLine = body.replace('\n', ' ').replace('\r', ' ');
        return singleLine.length() > maxLen ? singleLine.substring(0, maxLen) + "…" : singleLine;
    }
}
