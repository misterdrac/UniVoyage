package com.univoyage.admin.user;

import com.univoyage.admin.user.dto.AdminUserResponse;
import com.univoyage.admin.user.dto.UpdateUserRoleRequest;
import com.univoyage.common.response.ApiResponse;
import com.univoyage.user.model.UserEntity;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final AdminUserService adminUserService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<AdminUserResponse>>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search
    ) {
        return ResponseEntity.ok(ApiResponse.ok(adminUserService.listUsers(page, size, search)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminUserResponse>> get(@PathVariable long id) {
        return ResponseEntity.ok(ApiResponse.ok(adminUserService.getUser(id)));
    }

    @PatchMapping("/{id}/role")
    public ResponseEntity<ApiResponse<AdminUserResponse>> updateRole(
            @PathVariable long id,
            @Valid @RequestBody UpdateUserRoleRequest req,
            Authentication authentication
    ) {
        Long actingAdminId = actingAdminId(authentication);

        return ResponseEntity.ok(ApiResponse.ok(
                adminUserService.updateRole(id, req.role(), actingAdminId)
        ));
    }

    private Long actingAdminId(Authentication authentication) {
        if (authentication == null) return null;
        Object principal = authentication.getPrincipal();
        if (principal instanceof UserEntity u) return u.getId();
        return null;
    }
}
