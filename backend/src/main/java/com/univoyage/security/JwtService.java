package com.univoyage.security;

import com.univoyage.auth.user.UserEntity;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Encoders;
import io.jsonwebtoken.security.Keys;
import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Date;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {

    private final Key key;
    private final long ttlSeconds;
    private final String issuer;
    private final String audience;

    private static final String CSRF_CLAIM = "csrf";

    @Getter // add getter for headerPrefix
    private final String headerPrefix = "Bearer ";

    public JwtService(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.ttl-seconds}") long ttlSeconds,
            @Value("${app.jwt.issuer:univoyage}") String issuer,
            @Value("${app.jwt.audience:web}") String audience
    ) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes());
        this.ttlSeconds = ttlSeconds;
        this.issuer = issuer;
        this.audience = audience;
    }

    // generates CSRF secret for inclusion in JWT claims
    // called later when generating JWT
    public String generateCsrfSecret() {
        SecureRandom random = new SecureRandom();
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        return Encoders.BASE64URL.encode(bytes);
    }

    // generate JWT with subject, claims and CSRF secret
    // called in next method
    // returns JWT and includes CSRF secret in claims
    public String generate(String subject, Map<String, Object> claims, String csrfSecret) {
        claims.put(CSRF_CLAIM, csrfSecret);

        Instant now = Instant.now();
        return Jwts.builder()
                .setSubject(subject)
                .setIssuer(issuer)
                .setAudience(audience)
                .addClaims(claims)
                .setIssuedAt(Date.from(now))
                .setNotBefore(Date.from(now.minusSeconds(5)))
                .setExpiration(Date.from(now.plusSeconds(ttlSeconds)))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    // generate JWT with subject and claims, generates CSRF secret internally
    public String generate(String subject, Map<String, Object> claims) {
        return generate(subject, claims, generateCsrfSecret());
    }

    // generate JWT for given user, user is identified by email, claims
    // returns JWT with user ID, role, csrf secret and whole JWT
    // This method generates JWT by calling the previous generate method that calls the one before it
    // method before wraps user info with JWT claims
    public String generateToken(UserEntity user) {
        Map<String, Object> claims = Map.of(
                "uid", user.getId(),
                "role", user.getRole().name()
        );

        return generate(user.getEmail(), claims);
    }

    // parse and validate JWT, return claims
    private Claims parse(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(key)
                    .requireIssuer(issuer)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (JwtException | IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid JWT token: " + e.getMessage());
        }
    }

    // extract specific claim using resolver function
    public <T> T extractClaim(String token, Function<Claims, T> resolver) {
        return resolver.apply(parse(token));
    }
    // extract subject (email) from JWT
    public String extractSubject(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    // extract CSRF secret from JWT
    public String extractCsrfSecret(String token) {
        return extractClaim(token, c -> c.get(CSRF_CLAIM, String.class));
    }

    // validate JWT for given user
    public boolean isTokenValid(String token, UserEntity user) {
        String subject = extractSubject(token);
        return subject.equals(user.getEmail()) && !isExpired(token);
    }

    // check if JWT is expired
    private boolean isExpired(String token) {
        Date exp = extractClaim(token, Claims::getExpiration);
        return exp.before(new Date());
    }
}
