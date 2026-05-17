package com.univoyage.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class EmailVerificationConfirmDto {

  @NotBlank
  private String token;
}
