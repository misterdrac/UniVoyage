package com.univoyage.exception;

import com.univoyage.auth.security.CurrentUser;
import com.univoyage.trip.service.GeoapifyService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Integration tests for issue #203: normalized JSON errors from {@link GlobalExceptionHandler}
 * for common failure modes (validation, bad types, missing params). {@link IllegalArgumentException}
 * mapping is covered by {@link GlobalExceptionHandlerIllegalArgumentWebMvcTest}.
 */
@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
@Transactional
class GlobalExceptionHandlerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CurrentUser currentUser;

    @MockBean
    private GeoapifyService geoapifyService;

    @Test
    @DisplayName("MethodArgumentTypeMismatchException maps to 400 with ApiResponse")
    void typeMismatch_mapsTo400Json() throws Exception {
        when(currentUser.id()).thenReturn(1L);

        mockMvc.perform(get("/api/trips/not-a-number/budget"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").value("Invalid value for parameter 'tripId'."));
    }

    @Test
    @DisplayName("MissingServletRequestParameterException maps to 400 with ApiResponse")
    void missingRequestParam_mapsTo400Json() throws Exception {
        mockMvc.perform(get("/api/places/search"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").value("Required request parameter 'city' is missing."));
    }

    @Test
    @DisplayName("MethodArgumentNotValidException maps to 400 with field errors in data")
    void validationFailed_mapsTo400JsonWithData() throws Exception {
        when(currentUser.id()).thenReturn(1L);

        mockMvc.perform(post("/api/trips")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"destinationId\":1}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").value("Validation failed for the request payload."))
                .andExpect(jsonPath("$.data").exists());
    }

    @Test
    @DisplayName("HttpMessageNotReadableException maps to 400 with ApiResponse")
    void malformedJson_mapsTo400Json() throws Exception {
        when(currentUser.id()).thenReturn(1L);

        mockMvc.perform(put("/api/trips/1/budget")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"x\":"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").value("Malformed JSON request payload."));
    }

    @Test
    @DisplayName("ResourceNotFoundException maps to 404 with ApiResponse")
    void notFound_mapsTo404Json() throws Exception {
        when(currentUser.id()).thenReturn(1L);

        mockMvc.perform(get("/api/trips/999999999/budget"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").value("Trip not found"));
    }

}
