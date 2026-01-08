package com.univoyage.exception;

import com.univoyage.common.response.ApiResponse;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

import java.util.HashMap;
import java.util.Map;

/**
 * Global exception handler for the application.
 * Catches specific exceptions and returns appropriate HTTP responses.
 * Handles ResourceNotFoundException and MethodArgumentNotValidException.
 * Returns responses wrapped in ApiResponse for consistent API structure.
 */
@ControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Handles ResourceNotFoundException and returns a 404 Not Found response.
     *
     * @param ex      The ResourceNotFoundException instance.
     * @param request The current web request.
     * @return A ResponseEntity containing the ApiResponse with error message.
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Object>> handleResourceNotFoundException(
            ResourceNotFoundException ex, WebRequest request) {

        String message = ex.getMessage();

        ApiResponse<Object> response = ApiResponse.fail(message);

        return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
    }

    /**
     * Handles MethodArgumentNotValidException and returns a 400 Bad Request response.
     *
     * @param ex      The MethodArgumentNotValidException instance.
     * @param request The current web request.
     * @return A ResponseEntity containing the ApiResponse with validation errors.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleValidationExceptions(
            MethodArgumentNotValidException ex, WebRequest request) {

        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((org.springframework.validation.FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        ApiResponse<Map<String, String>> response =
                ApiResponse.of(false, errors, "Validation failed for the request payload.");

        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }
}
