package com.univoyage.auth.dto;

/** Uniform body for successful OTP request/resend (no email enumeration). */
public record OtpAcceptedResponseDto(String message) {
  public static OtpAcceptedResponseDto standard() {
    return new OtpAcceptedResponseDto(
        "If this email can receive messages, a verification code has been sent.");
  }
}
