package com.univoyage.admin.user.service;

import com.univoyage.admin.user.dto.AdminUserResponse;
import com.univoyage.exception.ResourceNotFoundException;
import com.univoyage.user.model.Role;
import com.univoyage.user.model.UserEntity;
import com.univoyage.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Pageable;

@Service
@RequiredArgsConstructor
public class AdminUserService {

    private final UserRepository userRepository;

    public Page<AdminUserResponse> listUsers(String search, Pageable pageable) {

        Page<UserEntity> users;
        if (search == null || search.isBlank()) {
            users = userRepository.findAll(pageable);
        } else {
            users = userRepository.searchAdminUsers(search.toLowerCase(), pageable);
        }

        return users.map(this::toDto);
    }

    public AdminUserResponse getUser(long id) {
        return userRepository.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
    }

    @Transactional
    public AdminUserResponse updateRole(long targetUserId, Role newRole, Long actingAdminId) {
        // Safety: admin cant remove his own admin role
        if (actingAdminId != null && actingAdminId.equals(targetUserId) && newRole != Role.ADMIN) {
            throw new IllegalArgumentException("You cannot remove your own admin role.");
        }

        UserEntity user = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + targetUserId));

        user.setRole(newRole);
        userRepository.save(user);

        return toDto(user);
    }

    private AdminUserResponse toDto(UserEntity u) {
        return new AdminUserResponse(
                u.getId(),
                u.getName(),
                u.getSurname(),
                u.getEmail(),
                u.getRole(),
                u.getDateOfRegister(),
                u.getDateOfLastSignin()
        );
    }
}
