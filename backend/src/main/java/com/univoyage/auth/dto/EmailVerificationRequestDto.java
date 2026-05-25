package com.univoyage.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class EmailVerificationRequestDto {

  @NotBlank
  @Email
  private String email;
}
