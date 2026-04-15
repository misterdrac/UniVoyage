package com.univoyage.exception;

import com.univoyage.common.response.ApiResponse;

import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.HashMap;
import java.util.Map;

/**
 * Global exception handler for the application.
 * Maps domain and framework exceptions to HTTP status codes and {@link ApiResponse} JSON bodies
 * so clients never receive raw stack traces or non-JSON error pages from the API layer.
 */
@ControllerAdvice
@Log4j2
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

    /**
     * Handles malformed JSON payloads and returns a consistent 400 response body.
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiResponse<Object>> handleHttpMessageNotReadableException(
            HttpMessageNotReadableException ex, WebRequest request) {
        ApiResponse<Object> response = ApiResponse.fail("Malformed JSON request payload.");
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handles illegal client input and business rule violations expressed as {@link IllegalArgumentException}.
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Object>> handleIllegalArgumentException(
            IllegalArgumentException ex, WebRequest request) {
        return new ResponseEntity<>(ApiResponse.fail(ex.getMessage()), HttpStatus.BAD_REQUEST);
    }

    /**
     * Handles invalid path or query parameter types (e.g. non-numeric path segment where a number is expected).
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiResponse<Object>> handleMethodArgumentTypeMismatchException(
            MethodArgumentTypeMismatchException ex, WebRequest request) {
        String msg = String.format(
                "Invalid value for parameter '%s'.",
                ex.getName() != null ? ex.getName() : "request");
        return new ResponseEntity<>(ApiResponse.fail(msg), HttpStatus.BAD_REQUEST);
    }

    /**
     * Handles missing required request parameters.
     */
    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ApiResponse<Object>> handleMissingServletRequestParameterException(
            MissingServletRequestParameterException ex, WebRequest request) {
        String msg = String.format("Required request parameter '%s' is missing.", ex.getParameterName());
        return new ResponseEntity<>(ApiResponse.fail(msg), HttpStatus.BAD_REQUEST);
    }

    /**
     * Handles IllegalStateException and returns a 500 Internal Server Error.
     *
     * @param ex      The IllegalStateException instance.
     * @param request The current web request.
     * @return A ResponseEntity containing the ApiResponse with error message.
     */
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ApiResponse<Object>> handleIllegalStateException(
            IllegalStateException ex, WebRequest request) {
        ApiResponse<Object> response = ApiResponse.fail(ex.getMessage());
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    /**
     * Fallback for uncaught runtime failures (e.g. external API errors). Response body stays generic;
     * details are logged server-side only.
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ApiResponse<Object>> handleRuntimeException(
            RuntimeException ex, WebRequest request) {
        log.error("Unhandled runtime exception", ex);
        return new ResponseEntity<>(
                ApiResponse.fail("An unexpected error occurred."),
                HttpStatus.INTERNAL_SERVER_ERROR);
    }

    /**
     * Last-resort handler so no exception escapes as a non-JSON servlet error for API requests.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleGenericException(Exception ex, WebRequest request) {
        log.error("Unhandled exception", ex);
        return new ResponseEntity<>(
                ApiResponse.fail("An unexpected error occurred."),
                HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
