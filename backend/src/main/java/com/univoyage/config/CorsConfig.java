package com.univoyage.config;

import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.Set;

/**
 * CORS configuration filter to handle Cross-Origin Resource Sharing (CORS) settings.
 * Allows requests from specified origins and sets appropriate CORS headers.
 * Responds to preflight OPTIONS requests.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class CorsConfig extends OncePerRequestFilter {

    private static final Set<String> ALLOWED = Set.of(
            "http://localhost:5173",
            "http://127.0.0.1:5173"
    );

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String origin = request.getHeader("Origin");

        // Only set CORS headers for allowed origins
        if (origin != null && ALLOWED.contains(origin)) {
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
