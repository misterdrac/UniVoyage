package com.univoyage.quiz.controller;

import com.univoyage.quiz.dto.QuizRecommendationResponse;
import com.univoyage.quiz.service.QuizService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class QuizRateLimitIntegrationTest {

  @Autowired
  private MockMvc mockMvc;

  @MockitoBean
  private QuizService quizService;

  @Test
  @DisplayName("POST /api/quiz/recommend returns 429 when IP rate limit exceeded")
  void quizRecommend_rateLimited() throws Exception {
    when(quizService.recommend(any())).thenReturn(QuizRecommendationResponse.builder().intro("Hi")
        .recommendations(List.of()).closingNote("ok").build());

    String body = """
        {"continent":"Europe","budget":"medium","climate":"warm","activityType":"culture","travelStyle":"relaxed"}
        """;

    for (int i = 0; i < 10; i++) {
      mockMvc
          .perform(
              post("/api/quiz/recommend").contentType(MediaType.APPLICATION_JSON).content(body))
          .andExpect(status().isOk());
    }

    mockMvc
        .perform(post("/api/quiz/recommend").contentType(MediaType.APPLICATION_JSON).content(body))
        .andExpect(status().isTooManyRequests()).andExpect(header().exists("Retry-After"))
        .andExpect(jsonPath("$.success").value(false))
        .andExpect(jsonPath("$.error").value("Too many quiz requests. Please try again later."));
  }
}
