package com.univoyage.ai.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.univoyage.ai.dto.GeminiResponse;
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

