package com.univoyage.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.WebUtils;

import java.io.IOException;

/**
 * JwtAuthenticationFilter is a Spring Security filter that processes JWT authentication.
 * It checks for a JWT in an HttpOnly cookie and a CSRF secret in a custom header.
 * If both are valid, it sets the authentication in the SecurityContext.
 * This filter is applied to all requests except public endpoints like register and login.
 */

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    // Cookie name for the HttpOnly JWT (Token A)
    private static final String JWT_COOKIE_NAME = "auth_token";

    // Header name for the client-sent CSRF secret (Token B)
    private static final String CSRF_HEADER_NAME = "X-CSRF-TOKEN";

    // Public endpoints that don't require authentication
    private static final String[] PUBLIC_PATHS = {
            "/api/auth/register",
            "/api/auth/login"
    };

    /**
     * This filter checks for the JWT in the HttpOnly cookie and the CSRF secret in the header.
     * It performs the following steps:
     * 1. Checks if the request is for a public path (register/login).
     * 2. Extracts the JWT from the HttpOnly cookie.
     * 3. Extracts the CSRF secret from the custom header.
     * 4. Validates the JWT and checks if the CSRF secret matches.
     * 5. Sets the authentication in the SecurityContext if valid.
     */
    @Override
    protected void doFilterInternal(
            @SuppressWarnings("null") HttpServletRequest request,
            @SuppressWarnings("null") HttpServletResponse response,
            @SuppressWarnings("null") FilterChain filterChain
    ) throws ServletException, IOException {

        // 1. Check for public paths (only register and login, NOT /api/auth/me)
        String servletPath = request.getServletPath();
        
        for (String publicPath : PUBLIC_PATHS) {
            if (servletPath.equals(publicPath)) {
                filterChain.doFilter(request, response);
                return;
            }
        }

        // 2. Extract JWT (Token A) from the HttpOnly Cookie
        Cookie jwtCookie = WebUtils.getCookie(request, JWT_COOKIE_NAME);
        final String jwt = (jwtCookie != null) ? jwtCookie.getValue() : null;

        if (jwt == null) {
            // No JWT present - let Spring Security handle the 401/403
            filterChain.doFilter(request, response);
            return;
        }

        // 3. Extract CSRF Secret (Token B) from the custom header
        final String headerCsrfSecret = request.getHeader(CSRF_HEADER_NAME);

        String userIdString = null;
        String jwtCsrfSecret = null;

        try {
            // Parse JWT, handles signature validation and expiration check internally
            userIdString = jwtService.extractSubject(jwt);
            jwtCsrfSecret = jwtService.extractCsrfSecret(jwt);

        } catch (IllegalArgumentException e) {
            // Invalid token (expired, tampered, or malformed)
            response.addCookie(CookieUtils.createExpiredCookie(JWT_COOKIE_NAME));
            filterChain.doFilter(request, response);
            return;
        }

        // 4. Double Submit Cookie Check: The Core CSRF Mitigation
        if (headerCsrfSecret == null || !headerCsrfSecret.equals(jwtCsrfSecret)) {
            // Mismatch: CSRF attack suspected OR frontend failed to send the header.
            response.addCookie(CookieUtils.createExpiredCookie(JWT_COOKIE_NAME));
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        // 5. Authentication: Set Security Context
        if (userIdString != null) {
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(userIdString);

            // Token is already verified and CSRF is checked, set the context
            // Always set authentication even if it exists (in case of token refresh)
            UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                    userDetails,
                    null,
                    userDetails.getAuthorities()
            );
            authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authToken);
            System.out.println("Authentication set for user [" + userIdString + "] with authorities: " + userDetails.getAuthorities());
        }

        filterChain.doFilter(request, response);
    }
}