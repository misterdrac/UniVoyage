package com.univoyage.auth.service;

import com.univoyage.auth.dto.AuthPayload;
import com.univoyage.auth.security.JwtService;
import com.univoyage.user.dto.UserDto;
import com.univoyage.user.model.Role;
import com.univoyage.user.model.UserEntity;
import com.univoyage.user.repository.UserRepository;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/** Service for handling Google OAuth 2.0 authentication.
 * This service builds the authorization URL, handles the callback,
 * exchanges authorization codes for access tokens, fetches user info,
 * and creates or updates user records in the database.
 */

@Service
@RequiredArgsConstructor
@Slf4j
public class GoogleOAuthService {

    // Optional in test environments. If not configured, the app should still start
    // (integration tests rely on Spring context loading).
    @Value("${GOOGLE_CLIENT_ID:}")
    private String clientId;

    @Value("${GOOGLE_CLIENT_SECRET:}")
    private String clientSecret;

    @Value("${GOOGLE_REDIRECT_URI:}")
    private String redirectUri;

    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final RestTemplate restTemplate = new RestTemplate();
    private final PasswordEncoder passwordEncoder;

    /** Build the Google OAuth 2.0 authorization URL.
     *
     * @return The authorization URL to redirect users for Google OAuth 2.0 authentication.
     */
    public String buildAuthorizationUrl() {
        if (clientId.isBlank() || redirectUri.isBlank()) {
            // Configuration missing; caller can decide how to handle this case.
            throw new IllegalStateException("Google OAuth is not configured");
        }
        return "https://accounts.google.com/o/oauth2/v2/auth"
                + "?response_type=code"
                + "&client_id=" + URLEncoder.encode(clientId, StandardCharsets.UTF_8)
                + "&redirect_uri=" + URLEncoder.encode(redirectUri, StandardCharsets.UTF_8)
                + "&scope=" + URLEncoder.encode("openid email profile", StandardCharsets.UTF_8)
                + "&access_type=offline"
                + "&prompt=consent";
    }

    /** Handle the OAuth 2.0 callback from Google.
     *
     * @param code The authorization code received from Google.
     * @return An AuthPayload containing user info and tokens, or an error message.
     */
    @Transactional
    public AuthPayload handleCallback(String code) {
        log.debug("Google OAuth token exchange starting");
        try {
            String accessToken = exchangeCodeForAccessToken(code);
            Map<String, Object> userInfo = fetchUserInfo(accessToken);

            String email = (String) userInfo.get("email");
            String givenName = (String) userInfo.getOrDefault("given_name", "");
            String familyName = (String) userInfo.getOrDefault("family_name", "");

            if (email == null || email.isBlank()) {
                return AuthPayload.fail("Google account has no email");
            }

            UserEntity user = createGoogleUser(email, givenName, familyName);

            // Generate JWT + CSRF the same way as login/register
            JwtService.TokenPair pair = jwtService.generateForUser(user);

            return AuthPayload.ok(UserDto.from(user), pair.jwt(), pair.csrfSecret());
        } catch (Exception e) {
            return AuthPayload.fail("Google login failed: " + e.getMessage());
        }
    }

    private static String safeNonNullTrim(String s) {
        return s == null ? "" : s.trim();
    }


    /** Insert or update a user based on Google account info.
     *
     * @param email The user's email address.
     * @param givenName The user's given name.
     * @param familyName The user's family name.
     * @return The upserted UserEntity.
     */
    private UserEntity createGoogleUser(String email, String givenName, String familyName) {
        Optional<UserEntity> existing = userRepository.findByEmail(email);

        if (existing.isPresent()) {
            UserEntity u = existing.get();
            u.setDateOfLastSignin(Instant.now());

            if(u.getName() == null || u.getName().isBlank()) {
                u.setName(safeNonNullTrim(givenName));
            }
            if(u.getSurname() == null || u.getSurname().isBlank()) {
                u.setSurname(safeNonNullTrim(familyName));
            }

            return userRepository.save(u);
        }

        String name = safeNonNullTrim(givenName);
        String surname = safeNonNullTrim(familyName);
        String randomPassword = UUID.randomUUID().toString(); // we need to ensure password is set, even if not used
        String passwordHash = passwordEncoder.encode(randomPassword);

        UserEntity u = UserEntity.builder()
                .email(email)
                .name(name)
                .surname(surname)
                .passwordHash(passwordHash)
                .dateOfRegister(Instant.now())
                .dateOfLastSignin(Instant.now())
                .role(Role.USER)
                .build();

        return userRepository.save(u);
    }

    /** Exchange the authorization code for an access token.
     *
     * @param code The authorization code received from Google.
     * @return The access token.
     */
    private String exchangeCodeForAccessToken(String code) {
        String tokenEndpoint = "https://oauth2.googleapis.com/token";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        String body =
                "code=" + enc(code) +
                        "&client_id=" + enc(clientId) +
                        "&client_secret=" + enc(clientSecret) +
                        "&redirect_uri=" + enc(redirectUri) +
                        "&grant_type=authorization_code";

        ResponseEntity<Map> res = restTemplate.exchange(
                tokenEndpoint,
                HttpMethod.POST,
                new HttpEntity<>(body, headers),
                Map.class
        );

        if (!res.getStatusCode().is2xxSuccessful() || res.getBody() == null) {
            throw new IllegalStateException("Token exchange failed");
        }

        String accessToken = (String) res.getBody().get("access_token");
        if (accessToken == null || accessToken.isBlank()) {
            throw new IllegalStateException("No access_token returned by Google");
        }

        return accessToken;
    }

    /** Fetch user info from Google using the access token.
     *
     * @param accessToken The access token.
     * @return A map containing user info.
     */
    private Map<String, Object> fetchUserInfo(String accessToken) {
        String userInfoEndpoint = "https://www.googleapis.com/oauth2/v3/userinfo";

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);

        ResponseEntity<Map> res = restTemplate.exchange(
                userInfoEndpoint,
                HttpMethod.GET,
                new HttpEntity<>(headers),
                Map.class
        );

        if (!res.getStatusCode().is2xxSuccessful() || res.getBody() == null) {
            throw new IllegalStateException("Failed to fetch Google user info");
        }

        return res.getBody();
    }

    private String enc(String s) {
        return URLEncoder.encode(s, StandardCharsets.UTF_8);
    }
}
