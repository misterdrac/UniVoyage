package com.univoyage.quiz.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizRecommendationResponse {

    private String intro;
    private List<RecommendedDestination> recommendations;
    private String closingNote;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecommendedDestination {
        private Long destinationId;
        private String name;
        private String location;
        private String continent;
        private String imageUrl;
        private Integer budgetPerDay;
        private String matchReason;
        private List<String> highlights;
    }
}
