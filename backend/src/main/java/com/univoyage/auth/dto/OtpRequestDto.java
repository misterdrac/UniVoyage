package com.univoyage.auth.dto;

import com.univoyage.auth.otp.EmailOtpPurpose;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OtpRequestDto {

  @NotNull
  @Email
  private String email;

  @NotNull
  private EmailOtpPurpose purpose;
}
