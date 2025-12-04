package com.univoyage.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Set;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE) // run before Spring Security
public class CorsConfig extends OncePerRequestFilter {

    // Only allow your Vite dev origins (adjust if needed)
    private static final Set<String> ALLOWED = Set.of(
            "http://localhost:5173",
            "http://127.0.0.1:5173"
    );

    // For production, configure CORS properly in Spring Security or via a dedicated CORS filter.
    // This is a simple dev-time filter to allow Vite to access the backend.
    // created before Spring Security to ensure CORS headers are set correctly
    // CORS header made some problems with Spring Security defaults
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        // DEV: allow your Vite origins; to unblock quickly you can allow all:
        String origin = request.getHeader("Origin");
        if (origin == null) {
            origin = "http://localhost:5173"; // fallback so browser sees header
        }

        response.setHeader("Access-Control-Allow-Origin", origin);
        response.setHeader("Vary", "Origin");
        // If you plan to send cookies, keep true. If you later use wildcard origin, MUST set this to false.
        response.setHeader("Access-Control-Allow-Credentials", "true");
        response.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,PATCH,OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Authorization,Content-Type,Accept,Origin,X-Requested-With,X-CSRF-TOKEN");
        response.setHeader("Access-Control-Expose-Headers", "Authorization,Content-Type");
        response.setHeader("Access-Control-Max-Age", "3600");

        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            response.setStatus(HttpServletResponse.SC_OK);
            return; // short-circuit preflight
        }

        filterChain.doFilter(request, response);
    }
}