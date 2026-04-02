package com.univoyage.ai.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.univoyage.ai.dto.GeminiResponse;
import com.univoyage.ai.dto.BudgetEstimateRequest;
import com.univoyage.ai.dto.ItineraryRequest;
import com.univoyage.ai.dto.PackingRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service for interacting with the Gemini AI API to generate travel itineraries and packing suggestions.
 * Handles prompt construction, API calls, and response parsing.
 * Manages error handling and configuration checks.
 * Uses RestTemplate for HTTP requests and Jackson for JSON processing.
 * Provides methods to generate itineraries and packing lists based on user input.
 * Validates configuration before making API calls.
 * Logs errors for troubleshooting and monitoring.
 */
@Service
@Slf4j
public class GeminiService {

    private static final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s";
    
    @Value("${GEMINI_API_KEY:}")
    private String geminiApiKey;
    
    @Value("${GEMINI_MODEL:}")
    private String geminiModel;
    
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    
    public GeminiService() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }
    
    public boolean isConfigured() {
        return geminiApiKey != null && !geminiApiKey.isBlank() 
            && geminiModel != null && !geminiModel.isBlank();
    }

    /**
     * Generates a travel itinerary based on the provided request details.
     *
     * @param request The itinerary request containing location, dates, and user preferences.
     * @return A GeminiResponse containing the generated itinerary or an error message.
     */
    public GeminiResponse generateItinerary(ItineraryRequest request) {
        if (!isConfigured()) {
            return GeminiResponse.error("AI features are temporarily unavailable. Please try again later.");
        }
        
        try {
            String prompt = buildItineraryPrompt(request);
            return callGeminiApi(prompt);
        } catch (Exception e) {
            log.error("Error generating itinerary", e);
            return GeminiResponse.error("Oops! Something went wrong while generating your itinerary. Please try again in a moment.");
        }
    }

    /**
     * Generates packing suggestions based on the provided request details.
     *
     * @param request The packing request containing destination, dates, and weather forecast.
     * @return A GeminiResponse containing the packing suggestions or an error message.
     */
    public GeminiResponse generatePackingSuggestions(PackingRequest request) {
        if (!isConfigured()) {
            return GeminiResponse.error("AI features are temporarily unavailable. Please try again later.");
        }
        
        try {
            String prompt = buildPackingPrompt(request);
            return callGeminiApi(prompt);
        } catch (Exception e) {
            log.error("Error generating packing suggestions", e);
            return GeminiResponse.error("Failed to generate packing suggestions. Please try again.");
        }
    }

    /**
     * Generates a budget estimate based on destination, trip duration, and time of year.
     *
     * @param request The budget estimate request containing destination and dates.
     * @return A GeminiResponse containing the estimated costs or an error message.
     */
    public GeminiResponse generateBudgetEstimate(BudgetEstimateRequest request) {
        if (!isConfigured()) {
            return GeminiResponse.error("AI features are temporarily unavailable. Please try again later.");
        }
        
        try {
            String prompt = buildBudgetEstimatePrompt(request);
            return callGeminiApi(prompt);
        } catch (Exception e) {
            log.error("Error generating budget estimate", e);
            return GeminiResponse.error("Failed to generate budget estimate. Please try again.");
        }
    }

    public GeminiResponse generateFromPrompt(String prompt) {
        if (!isConfigured()) {
            return GeminiResponse.error("AI features are temporarily unavailable. Please try again later.");
        }

        try {
            return callGeminiApi(prompt);
        } catch (Exception e) {
            log.error("Error generating AI response from prompt", e);
            return GeminiResponse.error("Something went wrong. Please try again in a moment.");
        }
    }

    /**
     * Calls the Gemini API with the given prompt and handles the response.
     *
     * @param prompt The prompt to send to the Gemini API.
     * @return A GeminiResponse containing the AI-generated content or an error message.
     */
    private GeminiResponse callGeminiApi(String prompt) {
        try {
            String url = String.format(GEMINI_API_URL, geminiModel, geminiApiKey);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                    Map.of("parts", List.of(
                        Map.of("text", prompt)
                    ))
                )
            );
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<String> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                entity,
                String.class
            );
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                String content = extractTextFromResponse(response.getBody());
                if (content != null && !content.isBlank()) {
                    return GeminiResponse.success(content);
                }
                return GeminiResponse.error("AI returned an empty response. Please try again.");
            }
            
            return GeminiResponse.error("Failed to get response from AI service.");
            
        } catch (HttpClientErrorException e) {
            log.error("Gemini API error: {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
            
            if (e.getStatusCode() == HttpStatus.TOO_MANY_REQUESTS) {
                return GeminiResponse.error("AI service is busy. Please wait a moment and try again.");
            } else if (e.getStatusCode() == HttpStatus.NOT_FOUND) {
                return GeminiResponse.error("AI features are temporarily unavailable. Please try again later.");
            } else if (e.getStatusCode() == HttpStatus.UNAUTHORIZED || e.getStatusCode() == HttpStatus.FORBIDDEN) {
                return GeminiResponse.error("AI features are temporarily unavailable. Please try again later.");
            }
            
            return GeminiResponse.error("Something went wrong. Please try again in a moment.");
        } catch (Exception e) {
            log.error("Error calling Gemini API", e);
            return GeminiResponse.error("Something went wrong. Please try again in a moment.");
        }
    }

    /**
     * Extracts the generated text content from the Gemini API response.
     *
     * @param responseBody The raw JSON response body from the Gemini API.
     * @return The extracted text content, or null if parsing fails.
     */
    private String extractTextFromResponse(String responseBody) {
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode candidates = root.path("candidates");
            if (candidates.isArray() && !candidates.isEmpty()) {
                JsonNode content = candidates.get(0).path("content");
                JsonNode parts = content.path("parts");
                if (parts.isArray() && !parts.isEmpty()) {
                    return parts.get(0).path("text").asText();
                }
            }
        } catch (Exception e) {
            log.error("Error parsing Gemini response", e);
        }
        return null;
    }

    /**
     * Builds the prompt for generating a travel itinerary.
     *
     * @param request The itinerary request containing location, dates, and user preferences.
     * @return The constructed prompt string.
     */
    private String buildItineraryPrompt(ItineraryRequest request) {
        String dateRange = formatDateLong(request.getDepartureDate()) + " – " + formatDateLong(request.getReturnDate());
        
        String dayAnchors = "";
        if (request.getItineraryDates() != null && !request.getItineraryDates().isEmpty()) {
            dayAnchors = request.getItineraryDates().stream()
                .map(d -> "Day " + (request.getItineraryDates().indexOf(d) + 1) + " (" + d.getLabel() + ")")
                .collect(Collectors.joining("\n"));
        } else {
            dayAnchors = "Day 1 (" + formatDateLong(request.getDepartureDate()) + ")";
        }
        
        int totalDays = Math.max(request.getItineraryDates() != null ? request.getItineraryDates().size() : 1, 1);
        
        String hobbiesContext = "";
        if (request.getUserHobbies() != null && !request.getUserHobbies().isEmpty()) {
            hobbiesContext = "\nTraveler interests: " + String.join(", ", request.getUserHobbies()) + 
                ". Prioritize activities, experiences, and venues that align with these interests throughout the itinerary.";
        }
        
        return """
            You are a modern travel designer crafting a %d-day roadmap itinerary for curious travelers visiting %s.
            
            Trip window: %s
            Daily anchors:
            %s%s
            
            Focus: mix culture, food, scenic walks, mindful pauses, and one memorable evening experience. Mention realistic neighborhoods, transport options, and dining cues for %s.
            
            Return STRICT JSON ONLY following:
            {
              "intro": "1 sentence welcome",
              "days": [
                {
                  "dayNumber": 1,
                  "dateLabel": "Mon, Jun 2",
                  "title": "Theme name",
                  "vibe": "Mood such as Culture / Coastline",
                  "summary": "1 sentence overview",
                  "segments": [
                    { "time": "Morning", "activity": "Key activity", "details": "Include why + transport or ticket tip" },
                    { "time": "Afternoon", "activity": "Second experience", "details": "Add local insight" },
                    { "time": "Evening", "activity": "Wrap-up idea", "details": "Include dining/nightlife cue" }
                  ],
                  "dining": ["Restaurant or cafe + signature dish"],
                  "tips": ["Action-focused reminder under 80 characters"]
                }
              ],
              "logistics": [
                { "title": "Transit", "detail": "Passes, ride-share, or walking notes" },
                { "title": "Reservations", "detail": "What needs booking" }
              ],
              "closingNote": "Friendly send-off"
            }
            
            Rules:
            - Provide exactly %d day objects.
            - Keep every string under 160 characters.
            - Tips must be practical, specific reminders (start with verbs or include concrete cues).
            - No markdown, bullet markers, or additional keys.
            - Mention rest/slow moments at least once.
            - Include diverse areas of %s across days.
            """.formatted(
                totalDays,
                request.getLocationLabel(),
                dateRange,
                dayAnchors,
                hobbiesContext,
                request.getLocationLabel(),
                totalDays,
                request.getLocationLabel()
            ).trim();
    }

    /**
     * Builds the prompt for generating packing suggestions.
     *
     * @param request The packing request containing destination, dates, and weather forecast.
     * @return The constructed prompt string.
     */
    private String buildPackingPrompt(PackingRequest request) {
        return """
            You are a concise travel packing assistant.
            Destination: %s
            Trip dates: %s to %s
            
            Weather forecast (max/min in °C):
            %s
            
            Return a tailored packing plan in valid JSON ONLY using this schema:
            {
              "summary": "short overview sentence",
              "categories": [
                { "title": "Clothing", "icon": "emoji", "items": [ "Item with explanation" ] },
                { "title": "Accessories", "icon": "emoji", "items": [ "Item with explanation" ] },
                { "title": "Documents & Electronics", "icon": "emoji", "items": [ "Item with explanation" ] },
                { "title": "Toiletries & Health", "icon": "emoji", "items": [ "Item with explanation" ] }
              ],
              "reminders": [
                "Short reminder"
              ]
            }
            
            Rules:
            - Use exactly the four categories above in that order, 3-4 items each.
            - Documents & Electronics must mention local plug type and voltage requirements.
            - Toiletries & Health must mention disease-related precautions (e.g., malaria prophylaxis or vaccinations) if relevant to the region.
            - Always include at least one reminder about documents or medications.
            - Do not add markdown, commentary, triple backticks, or extra keys—JSON string only.
            """.formatted(
                request.getDestinationName(),
                request.getDepartureDate(),
                request.getReturnDate(),
                request.getForecastSummary()
            ).trim();
    }

    /**
     * Builds the prompt for generating a budget estimate.
     *
     * @param request The budget estimate request containing destination and dates.
     * @return The constructed prompt string.
     */
    private String buildBudgetEstimatePrompt(BudgetEstimateRequest request) {
        long totalDays;
        try {
            LocalDate departure = LocalDate.parse(request.getDepartureDate());
            LocalDate returnDate = LocalDate.parse(request.getReturnDate());
            totalDays = java.time.temporal.ChronoUnit.DAYS.between(departure, returnDate);
            if (totalDays < 1) totalDays = 1;
        } catch (Exception e) {
            totalDays = 1;
        }

        String month = "";
        try {
            LocalDate departure = LocalDate.parse(request.getDepartureDate());
            month = departure.getMonth().getDisplayName(java.time.format.TextStyle.FULL, Locale.ENGLISH);
        } catch (Exception e) {
            month = "unknown";
        }

        return """
            You are a travel budget advisor for students and young travelers.
            Destination: %s, %s
            Trip duration: %d days
            Time of year: %s

            Estimate realistic daily and total costs for this trip. Exclude flights and airfare entirely.

            Return STRICT JSON ONLY using this schema:
            {
              "summary": "1-2 sentence overview of cost level for this destination",
              "categories": [
                { "name": "Accommodation", "icon": "🏨", "estimatedDailyCost": 50, "estimatedTotalCost": 250, "description": "Brief explanation of typical options and prices" },
                { "name": "Food & Dining", "icon": "🍽️", "estimatedDailyCost": 30, "estimatedTotalCost": 150, "description": "Brief explanation" },
                { "name": "Activities & Attractions", "icon": "🎯", "estimatedDailyCost": 20, "estimatedTotalCost": 100, "description": "Brief explanation" },
                { "name": "Local Transportation", "icon": "🚌", "estimatedDailyCost": 10, "estimatedTotalCost": 50, "description": "Brief explanation" }
              ],
              "totalEstimatedBudget": 550,
              "tips": [
                "Practical money-saving tip specific to this destination"
              ]
            }

            Rules:
            - All costs in USD.
            - Provide exactly the four categories above in that order.
            - estimatedTotalCost = estimatedDailyCost * %d (trip duration).
            - totalEstimatedBudget = sum of all estimatedTotalCost values.
            - Consider %s seasonality and pricing (high/low season).
            - Target budget-conscious travelers (hostels, street food, public transport options).
            - 2-3 tips, each under 120 characters, specific to %s.
            - Do NOT include flights, airfare, or travel insurance.
            - No markdown, commentary, triple backticks, or extra keys—JSON string only.
            """.formatted(
                request.getDestinationName(),
                request.getDestinationLocation(),
                totalDays,
                month,
                totalDays,
                month,
                request.getDestinationName()
            ).trim();
    }

    /**
     * Formats a date string from ISO format to a long, human-readable format.
     *
     * @param dateStr The date string in ISO format (yyyy-MM-dd).
     * @return The formatted date string (e.g., "Monday, January 1, 2024").
     */
    private String formatDateLong(String dateStr) {
        try {
            LocalDate date = LocalDate.parse(dateStr);
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("EEEE, MMMM d, yyyy", Locale.ENGLISH);
            return date.format(formatter);
        } catch (Exception e) {
            return dateStr;
        }
    }
}

