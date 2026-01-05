package com.univoyage.admin.user.dto;

import com.univoyage.user.model.Role;

import java.time.Instant;

public record AdminUserResponse(
        Long id,
        String name,
        String surname,
        String email,
        Role role,
        Instant dateOfRegister,
        Instant dateOfLastSignin
) {}
