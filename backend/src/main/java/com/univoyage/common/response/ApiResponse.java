package com.univoyage.common.response;

import lombok.AllArgsConstructor;
import lombok.Value;

/**
 * Generic API response wrapper.
 * Contains success status, data payload, and error message.
 */
@Value @AllArgsConstructor(staticName = "of")
public class ApiResponse<T> {
    boolean success;
    T data;
    String error;

    public static <T> ApiResponse<T> ok(T data){ return ApiResponse.of(true, data, null); }
    public static <T> ApiResponse<T> fail(String error){ return ApiResponse.of(false, null, error); }
}