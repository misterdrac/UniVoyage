package com.univoyage.auth.security;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.WebUtils;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

/**
 * Filter that authenticates requests based on JWT stored in HttpOnly cookies
 * and performs double-submit CSRF protection. Applies to all requests except
 * public endpoints. Extracts JWT from cookie and CSRF secret from header.
 * Validates JWT and CSRF secret, and sets authentication in the security
 * context. Clears authentication cookies on failure.
 */
@Component
@RequiredArgsConstructor
@Log4j2
public class JwtAuthenticationFilter extends OncePerRequestFilter {

  private final JwtService jwtService;
  private final UserDetailsService userDetailsService;
  private final AuthCookieWriter authCookieWriter;
  private final PublicApiRequestMatcher publicApiRequestMatcher;

  public static final String TFA_REQUEST_ATTRIBUTE = "univoyage.tfa.verified";

  private static final String JWT_COOKIE_NAME = CookieUtils.JWT_COOKIE_NAME;
  private static final String CSRF_HEADER_NAME = "X-CSRF-TOKEN";

  private boolean csrfRequired(HttpServletRequest request) {
    String method = request.getMethod();
    return !(method.equals("GET") || method.equals("HEAD") || method.equals("OPTIONS"));
  }

  private void clearAuthCookies(HttpServletResponse response) {
    authCookieWriter.clearAuthCookies(response);
  }

  private static boolean csrfSecretsMatch(String headerCsrfSecret, String jwtCsrfSecret) {
    if (headerCsrfSecret == null || jwtCsrfSecret == null) {
      return false;
    }
    return MessageDigest.isEqual(headerCsrfSecret.getBytes(StandardCharsets.UTF_8),
        jwtCsrfSecret.getBytes(StandardCharsets.UTF_8));
  }

  @Override
  protected void doFilterInternal(@SuppressWarnings("null") HttpServletRequest request,
      @SuppressWarnings("null") HttpServletResponse response,
      @SuppressWarnings("null") FilterChain filterChain) throws ServletException, IOException {

    if (publicApiRequestMatcher.shouldSkipJwtProcessing(request)) {
      filterChain.doFilter(request, response);
      return;
    }

    Cookie jwtCookie = WebUtils.getCookie(request, JWT_COOKIE_NAME);
    final String jwt = (jwtCookie != null) ? jwtCookie.getValue() : null;

    if (jwt == null || jwt.isBlank()) {
      filterChain.doFilter(request, response);
      return;
    }

    final String headerCsrfSecret = request.getHeader(CSRF_HEADER_NAME);

    final String userIdString;
    final String jwtCsrfSecret;

    try {
      userIdString = jwtService.extractSubject(jwt);
      jwtCsrfSecret = jwtService.extractCsrfSecret(jwt);
    } catch (IllegalArgumentException e) {
      log.debug("JWT rejected: invalid or unparseable token");
      clearAuthCookies(response);
      SecurityContextHolder.clearContext();
      response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
      return;
    }

    if (csrfRequired(request)) {
      if (!csrfSecretsMatch(headerCsrfSecret, jwtCsrfSecret)) {
        log.debug("JWT rejected: CSRF header mismatch for state-changing request");
        clearAuthCookies(response);
        SecurityContextHolder.clearContext();
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        return;
      }
    }

    try {
      UserDetails userDetails = this.userDetailsService.loadUserByUsername(userIdString);

      UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
          userDetails, null, userDetails.getAuthorities());
      authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
      SecurityContextHolder.getContext().setAuthentication(authToken);

      boolean tfaVerified = jwtService.extractTwoFactorVerified(jwt);
      request.setAttribute(TFA_REQUEST_ATTRIBUTE, tfaVerified);

      log.debug("Authentication set for user [{}] with authorities: {}", userIdString,
          userDetails.getAuthorities());
    } catch (UsernameNotFoundException ex) {
      log.debug("JWT rejected: user not found for token subject");
      clearAuthCookies(response);
      SecurityContextHolder.clearContext();
      response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
      return;
    }

    filterChain.doFilter(request, response);
  }
}
