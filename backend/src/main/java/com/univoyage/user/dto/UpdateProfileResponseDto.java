package com.univoyage.user.dto;

import com.univoyage.auth.user.dto.UserDto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileResponseDto {
    private UserDto user;
}

