package com.univoyage.quiz.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.time.Duration;

/**
 * Per-IP limits for public {@code POST /api/quiz/recommend} (Gemini cost
 * protection).
 */
@ConfigurationProperties(prefix = "app.quiz")
@Getter
@Setter
public class QuizLimitProperties {

  private int ipMaxAttempts = 10;

  private Duration ipWindow = Duration.ofMinutes(1);
}
