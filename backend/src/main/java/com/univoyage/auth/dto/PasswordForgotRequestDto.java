package com.univoyage.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PasswordForgotRequestDto {

  @NotBlank
  @Email
  private String email;
}
