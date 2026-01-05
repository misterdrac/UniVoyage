package com.univoyage.user.dto;

import com.univoyage.user.dto.UserDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO for updating user profile.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileResponseDto {
    private UserDto user;
}

