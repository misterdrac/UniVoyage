package com.univoyage.auth.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;

/**
 * Blocks access to /api/admin/** for ADMIN/HEAD_ADMIN users who have not
 * completed two-factor authentication (missing tfa claim in JWT).
 */
@Component
@RequiredArgsConstructor
public class AdminTwoFactorFilter extends OncePerRequestFilter {

  private static final String ADMIN_PATH_PREFIX = "/api/admin/";
  private final ObjectMapper objectMapper;

  @Override
  protected boolean shouldNotFilter(HttpServletRequest request) {
    String path = request.getRequestURI();
    return !path.startsWith(ADMIN_PATH_PREFIX) && !path.equals("/api/admin");
  }

  @Override
  protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
      FilterChain filterChain) throws ServletException, IOException {

    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    if (auth == null || !auth.isAuthenticated()) {
      filterChain.doFilter(request, response);
      return;
    }

    boolean isAdmin = auth.getAuthorities().stream().map(GrantedAuthority::getAuthority)
        .anyMatch(a -> a.equals("ROLE_ADMIN") || a.equals("ROLE_HEAD_ADMIN"));

    if (!isAdmin) {
      filterChain.doFilter(request, response);
      return;
    }

    Boolean tfaVerified =
        (Boolean) request.getAttribute(JwtAuthenticationFilter.TFA_REQUEST_ATTRIBUTE);

    if (!Boolean.TRUE.equals(tfaVerified)) {
      response.setStatus(HttpServletResponse.SC_FORBIDDEN);
      response.setContentType(MediaType.APPLICATION_JSON_VALUE);
      Map<String, Object> body = Map.of("success", false, "data", Map.of(), "error",
          "Two-factor authentication required. Please complete 2FA verification.");
      objectMapper.writeValue(response.getOutputStream(), body);
      return;
    }

    filterChain.doFilter(request, response);
  }
}
