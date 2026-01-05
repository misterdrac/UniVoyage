package com.univoyage.admin.user.dto;

import com.univoyage.user.model.Role;
import jakarta.validation.constraints.NotNull;

public record UpdateUserRoleRequest(
        @NotNull Role role
) {}
