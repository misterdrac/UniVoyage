package com.univoyage.exception.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.univoyage.common.response.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * Custom AccessDeniedHandler that returns a JSON response
 * when a user tries to access a resource they do not have permission for.
 * Responds with HTTP 403 Forbidden status and a standardized error message.
 */
@Component
public class RestAccessDeniedHandler implements AccessDeniedHandler {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void handle(
            HttpServletRequest request,
            HttpServletResponse response,
            AccessDeniedException accessDeniedException
    ) throws IOException {

        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        ApiResponse<Object> body = ApiResponse.fail("Forbidden. You do not have permission to access this resource.");
        response.getWriter().write(objectMapper.writeValueAsString(body));
    }
}
