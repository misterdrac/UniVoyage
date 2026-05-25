package com.univoyage.auth.dto;

import com.univoyage.auth.validation.ValidPassword;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PasswordResetRequestDto {

  @NotBlank
  private String token;

  @NotBlank
  @ValidPassword
  private String newPassword;
}
