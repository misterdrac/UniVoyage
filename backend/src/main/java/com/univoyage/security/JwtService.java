package com.univoyage.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureException;
import io.jsonwebtoken.UnsupportedJwtException;
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

    // The claim name used to embed the CSRF token in the JWT payload
    private static final String CSRF_CLAIM = "csrf";

    public JwtService(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.ttl-seconds}") long ttlSeconds,
            @Value("${app.jwt.issuer:univoyage}") String issuer,
            @Value("${app.jwt.audience:web}") String audience
    ) {
        // For HS256 the key MUST be >= 256 bits (~32+ bytes)
        this.key = Keys.hmacShaKeyFor(secret.getBytes());
        this.ttlSeconds = ttlSeconds;
        this.issuer = issuer;
        this.audience = audience;
    }


    // CSRF Secret Generation
    // Generate a cryptographically secure random string to use as the client-side CSRF token (Token B).
    public String generateCsrfSecret() {
        SecureRandom random = new SecureRandom();
        byte[] bytes = new byte[32]; // 256 bits
        random.nextBytes(bytes);
        return Decoders.BASE64URL.encode(bytes);
    }


    // JWT Generation (Includes CSRF Secret), including the CSRF secret in the claims for double-submit check
    public String generate(String subject, Map<String,Object> claims, String csrfSecret){
        claims.put(CSRF_CLAIM, csrfSecret); // Embed the CSRF secret (Token B) into the JWT (Token A)

        Instant now = Instant.now();
        return Jwts.builder()
                .setSubject(subject)                 // usually email
                .setIssuer(issuer)
                .setAudience(audience)
                .addClaims(claims)                   // e.g., uid, role, and 'csrf'
                .setIssuedAt(Date.from(now))
                .setNotBefore(Date.from(now.minusSeconds(5)))
                .setExpiration(Date.from(now.plusSeconds(ttlSeconds)))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    // Overload for convenience if CSRF is handled by a calling method
    public String generate(String subject, Map<String, Object> claims) {
        return generate(subject, claims, generateCsrfSecret());
    }


    // JWT Parsing and Validation, including signature, expiration, issuer checks
    private Claims parse(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(key)
                    .requireIssuer(issuer)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (SignatureException | MalformedJwtException | ExpiredJwtException | UnsupportedJwtException | IllegalArgumentException e) {
            // Log the error (e.g., logger.warn("JWT validation failed: {}", e.getMessage());)
            throw new IllegalArgumentException("Invalid JWT token: " + e.getMessage());
        }
    }


    // Generic method to extract any claim using a claims resolver function
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = parse(token);
        return claimsResolver.apply(claims);
    }


    // Subject Extraction
    public String extractSubject(String token) {
        return extractClaim(token, Claims::getSubject);
    }


    // Token A contains Token B in its claims, extract it here
    public String extractCsrfSecret(String token) {
        return extractClaim(token, claims -> claims.get(CSRF_CLAIM, String.class));
    }
}

