package com.univoyage.auth.dto;

public record EmailVerificationAcceptedResponseDto(String message) {

  public static EmailVerificationAcceptedResponseDto standard() {
    return new EmailVerificationAcceptedResponseDto(
        "If an account exists for this email, verification instructions have been sent.");
  }
}
