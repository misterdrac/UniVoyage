package com.univoyage.auth.security;

import com.univoyage.user.model.UserEntity;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Encoders;
import io.jsonwebtoken.security.Keys;

import java.security.Key;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;

/** Service for handling JWT (JSON Web Tokens) and CSRF (Cross-Site Request Forgery) tokens.
 * This service generates, validates, and extracts claims from JWTs.
 */
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

    /** Generating CSRF(Cross-Site Request Forgery) token
     * we call it Token A
     * */
    public String generateCsrfSecret() {
        byte[] bytes = new byte[32];
        new SecureRandom().nextBytes(bytes);
        return Encoders.BASE64URL.encode(bytes);
    }

    /** Generating JWT(JSON Web Token) with CSRF claim
     * we call it Token B, JWT is issued by user ID
     * */
    public String generateJwtToken(String subject, Map<String, Object> claims, String csrfSecret) {

        claims.put(CSRF_CLAIM, csrfSecret);
        Instant now = Instant.now();

        return Jwts.builder()
                .setId(UUID.randomUUID().toString())
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

    /** Convenience - function that returns JWT token with CSRF token as TokenPair
     * claims are put into HashMap -> used for testing
     * Only importaint information which token holds is:
     * 1) subject - user ID
     * 2) issuer - univoyage
     * 3) audiance - web
     * 4) CSRF Token - for user
     * 5) issued at - time of issue
     * 6) issued not before - issue is not set before this time
     * 7) experies at - time of issue + TTL of token
     * */
    public TokenPair generateForUser(UserEntity user) {
        String csrfSecret = generateCsrfSecret();
        Map<String, Object> claims = new HashMap<>();

        // Here we add additional claims if needed, but they are more for testing purposes
        //claims.put("uid", user.getId());
        //claims.put("username", user.getUsername()); // will be commented out if necessary
        //claims.put("email", user.getEmail()); // will be commented out if necessary
        //claims.put("role", user.getRole().name()); // will be commented out if necessary

        String subject = String.valueOf(user.getId());
        // no longer issueing email as subject, using user ID instead -> better security
        String jwt = generateJwtToken(subject, claims, csrfSecret);
        return new TokenPair(jwt, csrfSecret);
    }

    /** Method for parsing token - checks if token is really valid, if mismatched returns error
     *  - importaint is that we issue token with field issuer and check that field when validating the token
     *  - if not, attackers might use some other token not issued by us
     *  */
    private Claims parse(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(key)
                    .requireIssuer(issuer)
                    .requireAudience(audience)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (JwtException | IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid JWT: " + e.getMessage());
        }
    }

    /** Extracting claim from token using resolver function
     *  - this is used for extracting subject, CSRF secret and other claims
     *  */
    public <T> T extractClaim(String token, Function<Claims, T> resolver) {
        return resolver.apply(parse(token));
    }

    /** Extracting subject from token
     *  - subject is user ID, so we can use it to load user details
     *  */
    public String extractSubject(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /** Extracting CSRF secret from token
     *  - this is used for checking if CSRF token matches the one in JWT
     *  */
    public String extractCsrfSecret(String token) {
        return extractClaim(token, c -> c.get(CSRF_CLAIM, String.class));
    }

    /** JWT ID claim ({@code jti}); unique per issued access token (e.g. for future revocation or audit). */
    public String extractJti(String token) {
        return extractClaim(token, Claims::getId);
    }

    /** Validating token
     *  - this method checks if token is valid, not expired and has correct issuer
     *  - it does not check if CSRF secret matches, that is done separately
     *  */
    public boolean isValid(String token) {
        parse(token);
        return true;
    }

    /** Simple holder */
    public record TokenPair(String jwt, String csrfSecret) {}
}
