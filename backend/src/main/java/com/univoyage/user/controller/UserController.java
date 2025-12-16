package com.univoyage.user.controller;

import com.univoyage.auth.AuthService;
import com.univoyage.auth.dto.UpdateProfileRequestDto;
import com.univoyage.auth.dto.UpdateProfileResponseDto;
import com.univoyage.auth.user.dto.UserDto;
import com.univoyage.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(
        origins = {"http://localhost:5173","http://127.0.0.1:5173"},
        allowCredentials = "true"
)
@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final AuthService authService;

    @PatchMapping("/profile")
    @Transactional
    public ResponseEntity<ApiResponse<UpdateProfileResponseDto>> updateProfile(
            @Valid @RequestBody UpdateProfileRequestDto request
    ) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.fail("Not authenticated"));
        }

        Object principal = authentication.getPrincipal();
        if (!(principal instanceof UserEntity)) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.fail("Invalid authentication"));
        }

        UserEntity userEntity = (UserEntity) principal;
        Long userId = userEntity.getId();

        try {
            UserDto updatedUser = authService.updateProfile(userId, request);
            UpdateProfileResponseDto response = new UpdateProfileResponseDto(updatedUser);
            return ResponseEntity.ok(ApiResponse.ok(response));
        } catch (IllegalArgumentException e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.fail(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.fail("Failed to update profile: " + e.getMessage()));
        }
    }
}

