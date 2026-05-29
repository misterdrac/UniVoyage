package com.univoyage.auth.dto;

import lombok.*;

/**
 * DTO for handling Google OAuth callback requests.
 */
@Getter
@Setter
public class GoogleCallbackRequestDto {
  private String code;
  /** Signed OAuth state from the authorize redirect (CSRF protection). */
  private String state;
}
