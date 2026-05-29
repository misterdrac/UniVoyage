package com.univoyage.auth.security;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;

/**
 * Paths aligned with {@link com.univoyage.config.SecurityConfiguration} where
 * the JWT filter must not run (avoids {@code path.contains} false positives
 * such as {@code /api/admin/destinations}).
 */
@Component
public class PublicApiRequestMatcher {

  private static final AntPathMatcher MATCHER = new AntPathMatcher();

  private static final String[] PUBLIC_PATH_PATTERNS = {"/api/auth/login", "/api/auth/login/**",
      "/api/auth/register", "/api/auth/register/**", "/api/auth/refresh", "/api/auth/refresh/",
      "/api/auth/google/**", "/api/auth/github/**", "/api/auth/linkedin/**", "/api/auth/otp/**",
      "/api/auth/password/**", "/api/auth/email/verification/**", "/api/quiz/**", "/api/contact",
      "/error", "/actuator/health", "/actuator/health/**"};

  private static final String[] PUBLIC_GET_PATTERNS = {"/api/destinations/**", "/api/reference/**",
      "/api/heatmap/**"};

  public boolean shouldSkipJwtProcessing(HttpServletRequest request) {
    String path = resolvePath(request);
    for (String pattern : PUBLIC_PATH_PATTERNS) {
      if (MATCHER.match(pattern, path)) {
        return true;
      }
    }
    if (HttpMethod.GET.matches(request.getMethod())) {
      for (String pattern : PUBLIC_GET_PATTERNS) {
        if (MATCHER.match(pattern, path)) {
          return true;
        }
      }
    }
    return false;
  }

  private static String resolvePath(HttpServletRequest request) {
    String path = request.getRequestURI();
    String contextPath = request.getContextPath();
    if (contextPath != null && !contextPath.isEmpty() && path.startsWith(contextPath)) {
      return path.substring(contextPath.length());
    }
    return path;
  }
}
