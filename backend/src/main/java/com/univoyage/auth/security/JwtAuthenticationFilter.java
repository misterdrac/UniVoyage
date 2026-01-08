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

import java.io.IOException;

/**
 * Filter that authenticates requests based on JWT stored in HttpOnly cookies
 * and performs double-submit CSRF protection.
 * Applies to all requests except public endpoints.
 * Extracts JWT from cookie and CSRF secret from header.
 * Validates JWT and CSRF secret, and sets authentication in the security context.
 * Clears authentication cookies on failure.
 */
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    // Cookie name for the HttpOnly JWT (Token A)
    private static final String JWT_COOKIE_NAME = CookieUtils.JWT_COOKIE_NAME;

    // Header name for the client-sent CSRF secret (Token B)
    private static final String CSRF_HEADER_NAME = "X-CSRF-TOKEN";

    // Public endpoints that don't require authentication
    private static final String[] PUBLIC_PATHS = {
            "/api/auth/register",
            "/api/auth/login",
            "/api/auth/google",
            "/api/auth/google/callback"
    };

    private boolean csrfRequired(HttpServletRequest request) {
        String method = request.getMethod();
        return !(method.equals("GET") || method.equals("HEAD") || method.equals("OPTIONS"));
    }

    private void clearAuthCookies(HttpServletResponse response) {
        // Expire both cookies so FE doesn't keep stale CSRF/JWT pair
        response.addCookie(CookieUtils.createExpiredCookie(CookieUtils.JWT_COOKIE_NAME));
        response.addCookie(CookieUtils.createExpiredCookie(CookieUtils.CSRF_COOKIE_NAME));
    }

    /**
     * Main filter method that processes each request.
     * Bypasses public paths, extracts and validates JWT and CSRF tokens,
     * and sets authentication in the security context.
     * Clears cookies and responds with 401/403 on failure.
     */
    @Override
    protected void doFilterInternal(
            @SuppressWarnings("null") HttpServletRequest request,
            @SuppressWarnings("null") HttpServletResponse response,
            @SuppressWarnings("null") FilterChain filterChain
    ) throws ServletException, IOException {

        // 1) Public paths bypass
        String servletPath = request.getServletPath();
        for (String publicPath : PUBLIC_PATHS) {
            if (servletPath.equals(publicPath)) {
                filterChain.doFilter(request, response);
                return;
            }
        }

        // 2) Extract JWT from HttpOnly cookie
        Cookie jwtCookie = WebUtils.getCookie(request, JWT_COOKIE_NAME);
        final String jwt = (jwtCookie != null) ? jwtCookie.getValue() : null;

        if (jwt == null || jwt.isBlank()) {
            // No JWT present - let Spring Security handle the 401/403
            filterChain.doFilter(request, response);
            return;
        }

        // 3) Extract CSRF secret from header
        final String headerCsrfSecret = request.getHeader(CSRF_HEADER_NAME);

        final String userIdString;
        final String jwtCsrfSecret;

        try {
            userIdString = jwtService.extractSubject(jwt);
            jwtCsrfSecret = jwtService.extractCsrfSecret(jwt);
        } catch (IllegalArgumentException e) {
            // Invalid token (expired, tampered, malformed)
            clearAuthCookies(response);
            SecurityContextHolder.clearContext();
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        // 4) Double submit CSRF check (only for state-changing)
        if (csrfRequired(request)) {
            if (headerCsrfSecret == null || !headerCsrfSecret.equals(jwtCsrfSecret)) {
                clearAuthCookies(response);
                SecurityContextHolder.clearContext();
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                return;
            }
        }

        // 5) Authenticate (load user by ID)
        try {
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(userIdString);

            UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                    userDetails,
                    null,
                    userDetails.getAuthorities()
            );
            authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authToken);

            System.out.println("Authentication set for user [" + userIdString + "] with authorities: " + userDetails.getAuthorities());
        } catch (UsernameNotFoundException ex) {
            // user deleted / db reset / stale token
            clearAuthCookies(response);
            SecurityContextHolder.clearContext();
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        filterChain.doFilter(request, response);
    }
}