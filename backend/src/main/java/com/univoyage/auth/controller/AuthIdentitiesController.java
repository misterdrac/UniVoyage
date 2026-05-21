package com.univoyage.auth.controller;

import com.univoyage.auth.dto.LinkedIdentityDto;
import com.univoyage.auth.model.UserIdentity;
import com.univoyage.auth.service.UserIdentityService;
import com.univoyage.common.response.ApiResponse;
import com.univoyage.user.model.UserEntity;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

/**
 * Exposes linked OAuth providers for the authenticated user (read-only).
 */
@CrossOrigin(origins = {"http://localhost:5173",
    "http://127.0.0.1:5173"}, allowCredentials = "true")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthIdentitiesController {

  private final UserIdentityService userIdentityService;

  @GetMapping("/identities")
  @Transactional(readOnly = true)
  public ResponseEntity<ApiResponse<List<LinkedIdentityDto>>> listIdentities() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    if (authentication == null || !authentication.isAuthenticated()) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
          .body(ApiResponse.fail("Not authenticated"));
    }

    Object principal = authentication.getPrincipal();
    if (!(principal instanceof UserEntity user)) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
          .body(ApiResponse.fail("Invalid authentication"));
    }

    List<LinkedIdentityDto> result = new ArrayList<>();
    result.add(LinkedIdentityDto.password(user.getDateOfRegister()));

    List<UserIdentity> identities = userIdentityService.listIdentitiesForUser(user.getId());
    identities.stream().sorted(Comparator.comparing(UserIdentity::getCreatedAt))
        .map(LinkedIdentityDto::from).forEach(result::add);

    return ResponseEntity.ok(ApiResponse.ok(result));
  }
}
