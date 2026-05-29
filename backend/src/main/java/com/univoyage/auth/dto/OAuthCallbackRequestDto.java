package com.univoyage.auth.dto;

import lombok.Getter;
import lombok.Setter;

/** SPA callback body for OAuth providers (authorization code + state). */
@Getter
@Setter
public class OAuthCallbackRequestDto {
  private String code;
  private String state;
}
