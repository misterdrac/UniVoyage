package com.univoyage.quiz.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class QuizRequest {

    @NotBlank
    private String budget;

    @NotBlank
    private String climate;

    @NotBlank
    private String activityType;

    @NotBlank
    private String continent;

    @NotBlank
    private String travelStyle;
}
