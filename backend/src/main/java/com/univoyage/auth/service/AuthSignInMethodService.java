package com.univoyage.auth.service;

import com.univoyage.user.model.UserEntity;
import com.univoyage.user.repository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

/**
 * Records how the user last authenticated (password, OAuth provider, OTP, …).
 */
@Service
@RequiredArgsConstructor
public class AuthSignInMethodService {

  public static final String METHOD_PASSWORD = "password";
  public static final String METHOD_EMAIL_OTP = "email_otp";

  private final UserRepository userRepository;

  @Transactional
  public void record(UserEntity user, String method) {
    if (user == null || method == null || method.isBlank()) {
      return;
    }
    user.setLastSignInMethod(method.trim().toLowerCase());
    userRepository.save(user);
  }
}
