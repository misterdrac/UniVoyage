package com.univoyage.auth.service;

import com.univoyage.auth.config.LoginSecurityProperties;
import com.univoyage.auth.dto.AuthPayload;
import com.univoyage.auth.dto.LoginRequestDto;
import com.univoyage.auth.security.JwtService;
import com.univoyage.reference.country.repository.CountryRepository;
import com.univoyage.reference.hobby.repository.HobbyRepository;
import com.univoyage.reference.language.repository.LanguageRepository;
import com.univoyage.user.model.Role;
import com.univoyage.user.model.UserEntity;
import com.univoyage.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceLoginSecurityTest {

    private static final Instant NOW = Instant.parse("2026-04-08T12:00:00Z");

    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtService jwtService;
    @Mock
    private CountryRepository countryRepository;
    @Mock
    private HobbyRepository hobbyRepository;
    @Mock
    private LanguageRepository languageRepository;

    private Clock clock;
    private LoginSecurityProperties loginSecurityProperties;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        clock = Clock.fixed(NOW, ZoneOffset.UTC);
        loginSecurityProperties = new LoginSecurityProperties();
        loginSecurityProperties.setMaxFailedAttempts(5);
        loginSecurityProperties.setLockDuration(Duration.ofMinutes(15));

        authService = new AuthService(
                userRepository,
                passwordEncoder,
                jwtService,
                clock,
                loginSecurityProperties,
                countryRepository,
                hobbyRepository,
                languageRepository
        );

        lenient().when(userRepository.save(any(UserEntity.class))).thenAnswer(inv -> inv.getArgument(0));
        lenient().when(jwtService.generateForUser(any(UserEntity.class)))
                .thenReturn(new JwtService.TokenPair("jwt-token", "csrf-secret"));
    }

    private UserEntity baseUser() {
        return UserEntity.builder()
                .id(42L)
                .name("T")
                .surname("U")
                .email("user@example.com")
                .passwordHash("encoded-hash")
                .dateOfRegister(NOW)
                .role(Role.USER)
                .failedLoginAttempts(0)
                .lockedUntil(null)
                .build();
    }

    private LoginRequestDto loginRequest(String password) {
        LoginRequestDto dto = new LoginRequestDto();
        dto.setEmail("user@example.com");
        dto.setPassword(password);
        return dto;
    }

    @Test
    @DisplayName("After 5 wrong passwords in a row, locked_until is set and further attempts stay invalid")
    void locksAfterFiveWrongPasswords() {
        UserEntity user = baseUser();
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(any(), any())).thenReturn(false);

        for (int i = 0; i < 5; i++) {
            AuthPayload r = authService.login(loginRequest("wrong"));
            assertFalse(r.isSuccess());
            assertEquals("Invalid credentials", r.getError());
        }

        assertNotNull(user.getLockedUntil());
        assertEquals(5, user.getFailedLoginAttempts());
        assertTrue(user.getLockedUntil().isAfter(NOW));

        AuthPayload whileLocked = authService.login(loginRequest("any"));
        assertFalse(whileLocked.isSuccess());
        verify(passwordEncoder, times(5)).matches(any(), any());
    }

    @Test
    @DisplayName("While account is locked, password is not checked")
    void doesNotCheckPasswordWhenLocked() {
        UserEntity user = baseUser();
        user.setLockedUntil(NOW.plusSeconds(60));
        user.setFailedLoginAttempts(5);
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));

        AuthPayload r = authService.login(loginRequest("correct-or-not"));
        assertFalse(r.isSuccess());
        verify(passwordEncoder, never()).matches(any(), any());
    }

    @Test
    @DisplayName("When lock has expired, counters are cleared and a correct password succeeds")
    void expiredLockAllowsLoginWithCorrectPassword() {
        UserEntity user = baseUser();
        user.setLockedUntil(NOW.minusSeconds(1));
        user.setFailedLoginAttempts(5);
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("good", "encoded-hash")).thenReturn(true);

        AuthPayload r = authService.login(loginRequest("good"));
        assertTrue(r.isSuccess());
        assertEquals(0, user.getFailedLoginAttempts());
        assertNull(user.getLockedUntil());
    }

    @Test
    @DisplayName("Successful login resets failed_login_attempts and locked_until")
    void successResetsCounters() {
        UserEntity user = baseUser();
        user.setFailedLoginAttempts(3);
        user.setLockedUntil(null);
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("ok", "encoded-hash")).thenReturn(true);

        AuthPayload r = authService.login(loginRequest("ok"));
        assertTrue(r.isSuccess());
        assertEquals(0, user.getFailedLoginAttempts());
        assertNull(user.getLockedUntil());
    }

    @Test
    @DisplayName("Fourth wrong password does not lock yet; fifth does")
    void fourthFailureNoLockFifthLocks() {
        UserEntity user = baseUser();
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(any(), any())).thenReturn(false);

        for (int i = 0; i < 4; i++) {
            authService.login(loginRequest("bad"));
        }
        assertNull(user.getLockedUntil());
        assertEquals(4, user.getFailedLoginAttempts());

        authService.login(loginRequest("bad"));
        assertNotNull(user.getLockedUntil());
        assertEquals(5, user.getFailedLoginAttempts());
    }

    @Test
    @DisplayName("Unknown email still throws (controller maps to generic 401 message)")
    void unknownEmailThrows() {
        when(userRepository.findByEmail("missing@example.com")).thenReturn(Optional.empty());
        LoginRequestDto dto = new LoginRequestDto();
        dto.setEmail("missing@example.com");
        dto.setPassword("x");
        assertThrows(IllegalArgumentException.class, () -> authService.login(dto));
    }

    @Test
    @DisplayName("Lock duration matches configured lockDuration from the instant of the locking attempt")
    void lockUntilUsesConfiguredDuration() {
        UserEntity user = baseUser();
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(any(), any())).thenReturn(false);

        for (int i = 0; i < 5; i++) {
            authService.login(loginRequest("bad"));
        }

        ArgumentCaptor<UserEntity> captor = ArgumentCaptor.forClass(UserEntity.class);
        verify(userRepository, times(5)).save(captor.capture());
        UserEntity lastSaved = captor.getValue();
        Instant expected = NOW.plus(Duration.ofMinutes(15));
        assertEquals(expected, lastSaved.getLockedUntil());
    }
}
