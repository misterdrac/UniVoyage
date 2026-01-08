package com.univoyage.config;

import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * CORS configuration filter to handle Cross-Origin Resource Sharing (CORS) settings.
 * Allows requests from specified origins and sets appropriate CORS headers.
 * Responds to preflight OPTIONS requests.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class CorsConfig extends OncePerRequestFilter {

    private final Set<String> allowedOrigins;

    public CorsConfig(Environment env) {
        // Default localhost origins for development
        Set<String> defaultOrigins = Set.of(
                "http://localhost:5173",
                "http://127.0.0.1:5173"
        );

        // Get allowed origins from environment variable (comma-separated)
        String corsOrigins = env.getProperty("CORS_ALLOWED_ORIGINS");
        if (corsOrigins != null && !corsOrigins.trim().isEmpty()) {
            // Combine environment origins with defaults
            allowedOrigins = Stream.concat(
                    Arrays.stream(corsOrigins.split(","))
                            .map(String::trim)
                            .filter(s -> !s.isEmpty()),
                    defaultOrigins.stream()
            ).collect(Collectors.toSet());
        } else {
            allowedOrigins = defaultOrigins;
        }
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String origin = request.getHeader("Origin");

        // Only set CORS headers for allowed origins
        if (origin != null && allowedOrigins.contains(origin)) {
            response.setHeader("Access-Control-Allow-Origin", origin);
            response.setHeader("Vary", "Origin");
            response.setHeader("Access-Control-Allow-Credentials", "true");

            response.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,PATCH,OPTIONS");

            // include your CSRF header + anything fetch might send
            response.setHeader(
                    "Access-Control-Allow-Headers",
                    "Authorization,Content-Type,Accept,Origin,X-Requested-With,X-CSRF-TOKEN"
            );

            // expose if you need to read something from response headers
            response.setHeader("Access-Control-Expose-Headers", "Authorization,Content-Type");
            response.setHeader("Access-Control-Max-Age", "3600");
        }

        // Preflight must be answered even when not authenticated
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            response.setStatus(HttpServletResponse.SC_OK);
            return;
        }

        filterChain.doFilter(request, response);
    }
}
