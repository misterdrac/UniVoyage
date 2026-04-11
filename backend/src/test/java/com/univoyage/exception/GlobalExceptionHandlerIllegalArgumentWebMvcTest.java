package com.univoyage.exception;

import com.univoyage.admin.user.service.AdminUserService;
import com.univoyage.auth.security.JwtAuthenticationFilter;
import com.univoyage.user.model.Role;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * {@link GlobalExceptionHandler} JSON for {@link IllegalArgumentException}; {@link AdminUserService} mocked
 * (same MockMvc style as {@link com.univoyage.trip.controller.TripControllerCurrencyWebMvcTest}).
 */
@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
@Import(GlobalExceptionHandler.class)
class GlobalExceptionHandlerIllegalArgumentWebMvcTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AdminUserService adminUserService;

    @MockitoBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    @DisplayName("IllegalArgumentException maps to 400 with ApiResponse error message")
    void illegalArgument_mapsTo400Json() throws Exception {
        when(adminUserService.updateRole(anyLong(), any(Role.class), any()))
                .thenThrow(new IllegalArgumentException("Business rule violated for test."));

        mockMvc.perform(patch("/api/admin/users/2/role")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"role\":\"USER\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").value("Business rule violated for test."));
    }
}
