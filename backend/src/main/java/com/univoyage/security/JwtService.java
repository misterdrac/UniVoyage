package com.univoyage.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.time.Instant;
import java.util.Date;
import java.util.Map;

@Service
public class JwtService {
    private final Key key;
    private final long ttlSeconds;
    private final String issuer;
    private final String audience;

    public JwtService(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.ttl-seconds}") long ttlSeconds,
            @Value("${app.jwt.issuer:univoyage}") String issuer,
            @Value("${app.jwt.audience:web}") String audience
    ) {
        // For HS256 the key MUST be >= 256 bits (~32+ bytes). Use a long random string.
        this.key = Keys.hmacShaKeyFor(secret.getBytes());
        this.ttlSeconds = ttlSeconds;
        this.issuer = issuer;
        this.audience = audience;
    }

    // Generate a JWT token with given subject and claims
    public String generate(String subject, Map<String,Object> claims){
        Instant now = Instant.now();
        return Jwts.builder()
                .setSubject(subject)                 // usually email
                .setIssuer(issuer)
                .setAudience(audience)
                .addClaims(claims)                   // e.g., uid, role
                .setIssuedAt(Date.from(now))
                .setNotBefore(Date.from(now.minusSeconds(5)))   // small skew tolerance
                .setExpiration(Date.from(now.plusSeconds(ttlSeconds)))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }
}