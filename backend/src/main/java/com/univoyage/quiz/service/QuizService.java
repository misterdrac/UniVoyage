package com.univoyage.quiz.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.univoyage.ai.dto.GeminiResponse;
import com.univoyage.ai.service.GeminiService;
import com.univoyage.destination.model.DestinationEntity;
import com.univoyage.destination.repository.DestinationRepository;
import com.univoyage.quiz.dto.QuizRecommendationResponse;
import com.univoyage.quiz.dto.QuizRecommendationResponse.RecommendedDestination;
import com.univoyage.quiz.dto.QuizRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class QuizService {

    private final DestinationRepository destinationRepository;
    private final GeminiService geminiService;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public QuizRecommendationResponse recommend(QuizRequest request) {
        List<DestinationEntity> destinations = destinationRepository.findAll();

        if (destinations.isEmpty()) {
            return QuizRecommendationResponse.builder()
                    .intro("We couldn't find any destinations at the moment.")
                    .recommendations(List.of())
                    .closingNote("Please try again later.")
                    .build();
        }

        String prompt = buildPrompt(request, destinations);
        GeminiResponse aiResponse = geminiService.generateFromPrompt(prompt);

        if (!aiResponse.isSuccess() || aiResponse.getContent() == null) {
            log.error("Gemini quiz recommendation failed: {}", aiResponse.getError());
            return QuizRecommendationResponse.builder()
                    .intro("We had trouble generating your recommendations.")
                    .recommendations(List.of())
                    .closingNote(aiResponse.getError() != null
                            ? aiResponse.getError()
                            : "Please try again in a moment.")
                    .build();
        }

        return parseResponse(aiResponse.getContent(), destinations);
    }

    private String buildPrompt(QuizRequest request, List<DestinationEntity> destinations) {
        StringBuilder catalog = new StringBuilder();
        for (DestinationEntity d : destinations) {
            catalog.append(String.format(
                    "{\"id\":%d,\"name\":\"%s\",\"location\":\"%s\",\"continent\":\"%s\",\"budgetPerDay\":%s,\"overview\":\"%s\"},\n",
                    d.getId(),
                    escape(d.getName()),
                    escape(d.getLocation()),
                    escape(d.getContinent()),
                    d.getBudgetPerDay() != null ? d.getBudgetPerDay() : "null",
                    escape(truncate(d.getOverview(), 120))
            ));
        }

        return """
            You are a travel recommendation engine for UniVoyage, a student travel platform.
            A user just completed a quiz about their travel preferences. Based on their answers,
            select the 3 BEST matching destinations from the catalog below.
            
            USER PREFERENCES:
            - Budget (daily): %s
            - Preferred climate: %s
            - Activity type: %s
            - Preferred continent: %s
            - Travel style: %s
            
            DESTINATION CATALOG (JSON array):
            [%s]
            
            INSTRUCTIONS:
            - Pick exactly 3 destinations from the catalog that best match the user's preferences.
            - Use real destination IDs from the catalog. Do NOT invent new destinations.
            - If the user chose "any" for continent, consider all continents.
            - For budget: "low" means prefer destinations with budgetPerDay <= 30, "medium" means 30-60, "high" means 60+.
            - Provide a personalized matchReason (why this destination suits THIS user) and 3 highlights per destination.
            
            Return STRICT JSON ONLY using this exact schema:
            {
              "intro": "1-2 sentence personalized greeting based on their preferences",
              "recommendations": [
                {
                  "destinationId": 1,
                  "matchReason": "Why this destination is perfect for the user (2-3 sentences)",
                  "highlights": ["Highlight 1", "Highlight 2", "Highlight 3"]
                }
              ],
              "closingNote": "Encouraging 1-sentence send-off"
            }
            
            Rules:
            - Return exactly 3 recommendations ordered by best match.
            - destinationId MUST be a valid id from the catalog.
            - Each matchReason should reference specific user preferences.
            - Each highlight must be under 100 characters.
            - No markdown, no commentary, no extra keys — JSON only.
            """.formatted(
                request.getBudget(),
                request.getClimate(),
                request.getActivityType(),
                request.getContinent(),
                request.getTravelStyle(),
                catalog.toString().trim()
        ).trim();
    }

    private QuizRecommendationResponse parseResponse(String content, List<DestinationEntity> destinations) {
        try {
            String json = content.strip();
            if (json.startsWith("```")) {
                json = json.replaceAll("^```[a-zA-Z]*\\n?", "").replaceAll("```$", "").strip();
            }

            JsonNode root = objectMapper.readTree(json);

            Map<Long, DestinationEntity> destMap = destinations.stream()
                    .collect(Collectors.toMap(DestinationEntity::getId, Function.identity()));

            String intro = root.path("intro").asText("Here are your top destination picks!");
            String closingNote = root.path("closingNote").asText("Happy travels!");

            List<RecommendedDestination> recs = new ArrayList<>();
            JsonNode recsNode = root.path("recommendations");

            if (recsNode.isArray()) {
                for (JsonNode recNode : recsNode) {
                    long destId = recNode.path("destinationId").asLong();
                    DestinationEntity entity = destMap.get(destId);

                    if (entity == null) continue;

                    List<String> highlights = new ArrayList<>();
                    JsonNode hlNode = recNode.path("highlights");
                    if (hlNode.isArray()) {
                        for (JsonNode h : hlNode) {
                            highlights.add(h.asText());
                        }
                    }

                    recs.add(RecommendedDestination.builder()
                            .destinationId(entity.getId())
                            .name(entity.getName())
                            .location(entity.getLocation())
                            .continent(entity.getContinent())
                            .imageUrl(entity.getImageUrl())
                            .budgetPerDay(entity.getBudgetPerDay())
                            .matchReason(recNode.path("matchReason").asText("A great match for your preferences!"))
                            .highlights(highlights)
                            .build());
                }
            }

            return QuizRecommendationResponse.builder()
                    .intro(intro)
                    .recommendations(recs)
                    .closingNote(closingNote)
                    .build();

        } catch (Exception e) {
            log.error("Failed to parse quiz recommendation response from Gemini", e);
            return QuizRecommendationResponse.builder()
                    .intro("We generated recommendations but had trouble formatting them.")
                    .recommendations(List.of())
                    .closingNote("Please try the quiz again.")
                    .build();
        }
    }

    private static String escape(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", " ").replace("\r", "");
    }

    private static String truncate(String s, int maxLen) {
        if (s == null) return "";
        return s.length() <= maxLen ? s : s.substring(0, maxLen) + "...";
    }
}
