package com.univoyage.auth.service;

import com.univoyage.auth.dto.AuthPayload;
import com.univoyage.auth.model.RefreshTokenEntity;
import com.univoyage.auth.repository.RefreshTokenRepository;
import com.univoyage.auth.security.JwtService;
import com.univoyage.user.dto.UserDto;
import com.univoyage.user.model.UserEntity;
import com.univoyage.user.repository.UserRepository;
import io.jsonwebtoken.io.Encoders;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Clock;
import java.time.Instant;
import java.util.HexFormat;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final Clock clock;

    @Value("${app.jwt.refresh-ttl-seconds}")
    private long refreshTtlSeconds;

    /**
     * Persists a new refresh token for the user and returns the raw secret to store in an HttpOnly cookie.
     */
    @Transactional
    public String issueRefreshToken(UserEntity user) {
        Instant now = clock.instant();
        String raw = newRawToken();
        RefreshTokenEntity entity = RefreshTokenEntity.builder()
                .user(user)
                .tokenHash(sha256Hex(raw))
                .expiresAt(now.plusSeconds(refreshTtlSeconds))
                .createdAt(now)
                .build();
        refreshTokenRepository.save(entity);
        return raw;
    }

    /**
     * Validates the presented refresh token, revokes it (rotation), issues new access + CSRF payload and a new refresh raw value.
     */
    @Transactional
    public Optional<RefreshRotationResult> rotate(String rawRefreshToken) {
        if (rawRefreshToken == null || rawRefreshToken.isBlank()) {
            return Optional.empty();
        }
        String hash = sha256Hex(rawRefreshToken);
        Optional<RefreshTokenEntity> rowOpt = refreshTokenRepository.findByTokenHash(hash);
        if (rowOpt.isEmpty()) {
            return Optional.empty();
        }
        RefreshTokenEntity row = rowOpt.get();
        Instant now = clock.instant();
        if (!row.getExpiresAt().isAfter(now)) {
            refreshTokenRepository.delete(row);
            return Optional.empty();
        }
        Long userId = row.getUser().getId();
        refreshTokenRepository.delete(row);

        UserEntity user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return Optional.empty();
        }

        JwtService.TokenPair pair = jwtService.generateForUser(user);
        AuthPayload payload = AuthPayload.ok(UserDto.from(user), pair.jwt(), pair.csrfSecret());
        String newRefreshRaw = issueRefreshToken(user);
        return Optional.of(new RefreshRotationResult(payload, newRefreshRaw));
    }

    @Transactional
    public void revokeByRawToken(String rawRefreshToken) {
        if (rawRefreshToken == null || rawRefreshToken.isBlank()) {
            return;
        }
        refreshTokenRepository.findByTokenHash(sha256Hex(rawRefreshToken))
                .ifPresent(refreshTokenRepository::delete);
    }

    @Transactional
    public void revokeAllForUser(Long userId) {
        if (userId == null) {
            return;
        }
        refreshTokenRepository.deleteAllByUserId(userId);
    }

    private static String newRawToken() {
        byte[] bytes = new byte[32];
        SECURE_RANDOM.nextBytes(bytes);
        return Encoders.BASE64URL.encode(bytes);
    }

    private static String sha256Hex(String raw) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] digest = md.digest(raw.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }

    public record RefreshRotationResult(AuthPayload payload, String newRefreshTokenRaw) {}
}
