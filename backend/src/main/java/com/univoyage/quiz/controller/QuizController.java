package com.univoyage.quiz.controller;

import com.univoyage.common.response.ApiResponse;
import com.univoyage.quiz.dto.QuizRecommendationResponse;
import com.univoyage.quiz.dto.QuizRequest;
import com.univoyage.quiz.service.QuizService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/quiz")
@RequiredArgsConstructor
public class QuizController {

    private final QuizService quizService;

    @PostMapping("/recommend")
    public ResponseEntity<ApiResponse<QuizRecommendationResponse>> recommend(
            @Valid @RequestBody QuizRequest request
    ) {
        QuizRecommendationResponse response = quizService.recommend(request);

        if (response.getRecommendations() != null && !response.getRecommendations().isEmpty()) {
            return ResponseEntity.ok(ApiResponse.ok(response));
        }

        return ResponseEntity.ok(ApiResponse.fail(
                response.getClosingNote() != null ? response.getClosingNote() : "Unable to generate recommendations."
        ));
    }
}
