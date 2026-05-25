package com.univoyage.quiz.controller;

import com.univoyage.auth.security.ClientIpResolver;
import com.univoyage.common.response.ApiResponse;
import com.univoyage.quiz.dto.QuizRecommendationResponse;
import com.univoyage.quiz.dto.QuizRequest;
import com.univoyage.quiz.security.QuizIpRateLimiter;
import com.univoyage.quiz.service.QuizService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/quiz")
@RequiredArgsConstructor
public class QuizController {

  private static final String RATE_LIMIT_MSG = "Too many quiz requests. Please try again later.";

  private final QuizService quizService;
  private final QuizIpRateLimiter quizIpRateLimiter;

  @PostMapping("/recommend")
  public ResponseEntity<ApiResponse<QuizRecommendationResponse>> recommend(
      @Valid @RequestBody QuizRequest request, HttpServletRequest httpRequest) {
    String ip = ClientIpResolver.resolve(httpRequest);
    long retryAfterSec = quizIpRateLimiter.tryConsumeOrRetryAfterSeconds(ip);
    if (retryAfterSec > 0) {
      return ResponseEntity.status(429)
          .header(HttpHeaders.RETRY_AFTER, String.valueOf(retryAfterSec))
          .body(ApiResponse.fail(RATE_LIMIT_MSG));
    }

    QuizRecommendationResponse response = quizService.recommend(request);

    if (response.getRecommendations() != null && !response.getRecommendations().isEmpty()) {
      return ResponseEntity.ok(ApiResponse.ok(response));
    }

    return ResponseEntity.ok(ApiResponse.fail(response.getClosingNote() != null
        ? response.getClosingNote()
        : "Unable to generate recommendations."));
  }
}
