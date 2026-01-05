package com.univoyage.admin.user.dto;

import com.univoyage.user.model.Role;
import jakarta.validation.constraints.NotNull;

/**
 * Request DTO for updating a user's role in the admin panel.
 * Contains the new role to be assigned to the user.
 */
public record UpdateUserRoleRequest(
        @NotNull Role role
) {}
