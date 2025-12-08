package com.univoyage.security;

import com.univoyage.auth.user.UserEntity;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Encoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {

    private final Key key;
    private final long ttlSeconds;
    private final String issuer;
    private final String audience;

    public static final String CSRF_CLAIM = "csrf";

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

    /** Token B: random CSRF secret (frontend šalje u headeru) */
    public String generateCsrfSecret() {
        byte[] bytes = new byte[32];
        new SecureRandom().nextBytes(bytes);
        return Encoders.BASE64URL.encode(bytes);
    }

    /** Generira JWT (Token A) s ugrađenim csrf claimom (Token B) */
    public String generate(String subject, Map<String, Object> claims, String csrfSecret) {
        claims.put(CSRF_CLAIM, csrfSecret);

        Instant now = Instant.now();
        return Jwts.builder()
                .setSubject(subject) // user ID
                .setIssuer(issuer)
                .setAudience(audience)
                .addClaims(claims)
                .setIssuedAt(Date.from(now))
                .setNotBefore(Date.from(now.minusSeconds(5)))
                .setExpiration(Date.from(now.plusSeconds(ttlSeconds)))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    /** Convenience: generiraj token za usera + vrati i csrfSecret */
    public TokenPair generateForUser(UserEntity user) {
        String csrfSecret = generateCsrfSecret();
        Map<String, Object> claims = new HashMap<>();
        claims.put("uid", user.getId());
        //claims.put("role", user.getRole().name()); // will be commented out if necessary
        // claims.put("email", user.getEmail()); // no longer issueing email as subject, using user ID instead -> better security

        String subject = String.valueOf(user.getId());
        // no longer issueing email as subject, using user ID instead -> better security
        String jwt = generate(subject, claims, csrfSecret);
        return new TokenPair(jwt, csrfSecret);
    }

    /** Parsiranje + validacija potpisa/issuer/exp */
    private Claims parse(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(key)
                    .requireIssuer(issuer)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (JwtException | IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid JWT: " + e.getMessage());
        }
    }

    public <T> T extractClaim(String token, Function<Claims, T> resolver) {
        return resolver.apply(parse(token));
    }

    public String extractSubject(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public String extractCsrfSecret(String token) {
        return extractClaim(token, c -> c.get(CSRF_CLAIM, String.class));
    }

    public boolean isValid(String token) {
        parse(token); // baca exception ako nije ok
        return true;
    }

    /** Simple holder */
    public record TokenPair(String jwt, String csrfSecret) {}
}
