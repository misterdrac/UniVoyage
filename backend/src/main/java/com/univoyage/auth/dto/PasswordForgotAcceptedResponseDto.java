package com.univoyage.auth.dto;

public record PasswordForgotAcceptedResponseDto(String message) {

  public static PasswordForgotAcceptedResponseDto standard() {
    return new PasswordForgotAcceptedResponseDto(
        "If an account exists for this email, password reset instructions have been sent.");
  }
}
