package com.univoyage.admin.user.controller;

import com.univoyage.admin.user.dto.AdminUserResponse;
import com.univoyage.admin.user.dto.UpdateUserRoleRequest;
import com.univoyage.admin.user.service.AdminUserService;
import com.univoyage.common.response.ApiResponse;
import com.univoyage.user.model.UserEntity;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final AdminUserService adminUserService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<AdminUserResponse>>> list(
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20, sort = "dateOfRegister", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(ApiResponse.ok(adminUserService.listUsers(search, pageable)));
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
