package com.univoyage.auth.dto;

import com.univoyage.auth.validation.ValidPassword;

import lombok.Data;
import java.util.Set;

import jakarta.validation.constraints.NotBlank;

/**
 * Request DTO for user registration. Contains fields for user credentials and
 * profile information.
 */
@Data
public class RegisterRequestDto {

  private String email;

  @NotBlank
  @ValidPassword
  private String password;

  private String name;
  private String surname;

  private String countryCode;

  private Set<Long> hobbyIds;

  private Set<String> languageCodes;

  private Set<String> visitedCountryCodes;
}
