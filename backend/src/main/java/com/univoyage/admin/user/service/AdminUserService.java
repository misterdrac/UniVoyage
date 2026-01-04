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
    public AdminUserResponse updateRole(long targetUserId, Role newRole, Long actingUserId) {
        if (actingUserId == null) {
            throw new IllegalArgumentException("Missing acting user id.");
        }

        UserEntity actor = userRepository.findById(actingUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Acting user not found: " + actingUserId));

        UserEntity target = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + targetUserId));

        // Nobody can change their own role
        if (actingUserId.equals(targetUserId)) {
            throw new IllegalArgumentException("You cannot change your own role.");
        }

        Role actorRole = actor.getRole();
        Role targetRole = target.getRole();

        // HEAD_ADMIN: can change anyone except himself (already blocked above)
        if (actorRole == Role.HEAD_ADMIN) {
            if (targetRole == newRole) return toDto(target);
            target.setRole(newRole);
            userRepository.save(target);
            return toDto(target);
        }

        // ADMIN: can ONLY promote USER -> ADMIN
        if (actorRole == Role.ADMIN) {
            if (targetRole != Role.USER) {
                throw new IllegalArgumentException("Admin can modify only USER accounts.");
            }
            if (newRole != Role.ADMIN) {
                throw new IllegalArgumentException("Admin can only promote USER to ADMIN.");
            }

            target.setRole(Role.ADMIN);
            userRepository.save(target);
            return toDto(target);
        }

        // USER (or anything else): no permissions
        throw new IllegalArgumentException("You are not allowed to change roles.");
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
