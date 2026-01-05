package com.univoyage.auth.service;

import com.univoyage.auth.dto.AuthPayload;
import com.univoyage.auth.dto.LoginRequestDto;
import com.univoyage.auth.dto.RegisterRequestDto;
import com.univoyage.auth.security.JwtService;
import com.univoyage.reference.country.model.Country;
import com.univoyage.reference.country.repository.CountryRepository;
import com.univoyage.reference.hobby.model.Hobby;
import com.univoyage.reference.hobby.repository.HobbyRepository;
import com.univoyage.reference.language.model.Language;
import com.univoyage.reference.language.repository.LanguageRepository;
import com.univoyage.user.dto.UpdateProfileRequestDto;
import com.univoyage.user.dto.UserDto;
import com.univoyage.user.model.Role;
import com.univoyage.user.model.UserEntity;
import com.univoyage.user.model.UserHobby;
import com.univoyage.user.model.UserHobbyId;
import com.univoyage.user.model.UserLanguage;
import com.univoyage.user.model.UserLanguageId;
import com.univoyage.user.model.UserVisitedCountry;
import com.univoyage.user.model.UserVisitedCountryId;
import com.univoyage.user.repository.UserRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Collections;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Service for handling authentication-related operations such as registration, login, and profile updates.
 * Interacts with UserRepository for user data access and JwtService for token generation.
 * Handles business logic for user management including password encoding and validation.
 * Uses DTOs for request and response payloads.
 * All methods that modify data are transactional.
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    private final CountryRepository countryRepository;
    private final HobbyRepository hobbyRepository;
    private final LanguageRepository languageRepository;

    /**
     * Registers a new user with the provided registration details.
     *
     * @param request The registration request containing user details.
     * @return An AuthPayload containing the registered user info and JWT tokens, or an error message.
     */
    @Transactional
    public AuthPayload register(RegisterRequestDto request) {

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return AuthPayload.fail("Email is already in use");
        }

        if (request.getCountryCode() == null || request.getCountryCode().isBlank()) {
            return AuthPayload.fail("Country code is required");
        }

        Country homeCountry = countryRepository.findByIsoCode(request.getCountryCode())
                .orElseThrow(() -> new IllegalArgumentException("Invalid country code: " + request.getCountryCode()));

        Instant now = Instant.now();

        UserEntity newUser = UserEntity.builder()
                .name(request.getName())
                .surname(request.getSurname())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .country(homeCountry)
                .dateOfRegister(now)
                .dateOfLastSignin(now)
                .role(Role.USER)
                .build();

        // ---- HOBBIES ----
        Set<Hobby> hobbyEntities = Optional.ofNullable(request.getHobbyIds())
                .orElse(Collections.emptySet())
                .stream()
                .map(id -> hobbyRepository.findById(id)
                        .orElseThrow(() -> new IllegalArgumentException("Invalid hobby id: " + id)))
                .collect(Collectors.toSet());

        newUser.setUserHobbies(
                hobbyEntities.stream()
                        .map(h -> {
                            UserHobby uh = new UserHobby();
                            uh.setUser(newUser);
                            uh.setHobby(h);
                            uh.setId(new UserHobbyId(newUser.getId(), h.getId()));
                            return uh;
                        })
                        .collect(Collectors.toSet())
        );

        // ---- LANGUAGES ----
        Set<Language> languageEntities = Optional.ofNullable(request.getLanguageCodes())
                .orElse(Collections.emptySet())
                .stream()
                .map(code -> languageRepository.findById(code)
                        .orElseThrow(() -> new IllegalArgumentException("Invalid language code: " + code)))
                .collect(Collectors.toSet());

        newUser.setUserLanguages(
                languageEntities.stream()
                        .map(lang -> {
                            UserLanguage ul = new UserLanguage();
                            ul.setUser(newUser);
                            ul.setLanguage(lang);
                            // assumes UserLanguageId(userId, langCode)
                            ul.setId(new UserLanguageId(newUser.getId(), lang.getLangCode()));
                            return ul;
                        })
                        .collect(Collectors.toSet())
        );

        // ---- VISITED COUNTRIES ----
        Set<UserVisitedCountry> visitedCountries = Optional.ofNullable(request.getVisitedCountryCodes())
                .orElse(Collections.emptySet())
                .stream()
                .map(code -> {
                    Country visited = countryRepository.findByIsoCode(code)
                            .orElseThrow(() -> new IllegalArgumentException("Invalid visited country code: " + code));

                    UserVisitedCountry uvc = new UserVisitedCountry();
                    uvc.setUser(newUser);
                    uvc.setCountry(visited);
                    uvc.setDateOfVisit(LocalDate.now());
                    // assumes UserVisitedCountryId(userId, isoCode)
                    uvc.setId(new UserVisitedCountryId(newUser.getId(), visited.getIsoCode()));
                    return uvc;
                })
                .collect(Collectors.toSet());

        newUser.setVisitedCountries(visitedCountries);

        UserEntity savedUser = userRepository.save(newUser);
        JwtService.TokenPair pair = jwtService.generateForUser(savedUser);

        return AuthPayload.ok(UserDto.from(savedUser), pair.jwt(), pair.csrfSecret());
    }

    /**
     * Authenticates a user with the provided login credentials.
     *
     * @param request The login request containing email and password.
     * @return An AuthPayload containing the authenticated user info and JWT tokens, or an error message.
     */
    @Transactional
    public AuthPayload login(LoginRequestDto request) {

        UserEntity user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            return AuthPayload.fail("Invalid credentials");
        }

        user.setDateOfLastSignin(Instant.now());
        userRepository.save(user);

        JwtService.TokenPair pair = jwtService.generateForUser(user);

        return AuthPayload.ok(UserDto.from(user), pair.jwt(), pair.csrfSecret());
    }

    /**
     * Updates the profile of an existing user with the provided details.
     *
     * @param userId  The ID of the user to update.
     * @param request The profile update request containing new user details.
     * @return A UserDto representing the updated user profile.
     */
    @Transactional
    public UserDto updateProfile(Long userId, UpdateProfileRequestDto request) {

        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        // BASIC FIELDS
        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName());
        }
        if (request.getSurname() != null && !request.getSurname().isBlank()) {
            user.setSurname(request.getSurname());
        }

        // COUNTRY
        if (request.getCountryCode() != null && !request.getCountryCode().isBlank()) {
            Country country = countryRepository.findByIsoCode(request.getCountryCode())
                    .orElseThrow(() -> new IllegalArgumentException("Invalid country code: " + request.getCountryCode()));
            user.setCountry(country);
        }

        // HOBBIES
        if (request.getHobbyIds() != null) {
            Set<Long> newHobbyIds = request.getHobbyIds();

            user.getUserHobbies().removeIf(uh -> !newHobbyIds.contains(uh.getHobby().getId()));

            Set<Long> existingHobbyIds = user.getUserHobbies().stream()
                    .map(uh -> uh.getHobby().getId())
                    .collect(Collectors.toSet());

            Set<Hobby> newHobbies = newHobbyIds.stream()
                    .filter(id -> !existingHobbyIds.contains(id))
                    .map(id -> hobbyRepository.findById(id)
                            .orElseThrow(() -> new IllegalArgumentException("Invalid hobby id: " + id)))
                    .collect(Collectors.toSet());

            for (Hobby hobby : newHobbies) {
                UserHobby uh = new UserHobby();
                uh.setUser(user);
                uh.setHobby(hobby);
                uh.setId(new UserHobbyId(user.getId(), hobby.getId()));
                user.getUserHobbies().add(uh);
            }
        }

        // LANGUAGES
        if (request.getLanguageCodes() != null) {
            Set<String> newLanguageCodes = request.getLanguageCodes();

            user.getUserLanguages().removeIf(ul -> !newLanguageCodes.contains(ul.getLanguage().getLangCode()));

            Set<String> existingLanguageCodes = user.getUserLanguages().stream()
                    .map(ul -> ul.getLanguage().getLangCode())
                    .collect(Collectors.toSet());

            Set<Language> newLanguages = newLanguageCodes.stream()
                    .filter(code -> !existingLanguageCodes.contains(code))
                    .map(code -> languageRepository.findById(code)
                            .orElseThrow(() -> new IllegalArgumentException("Invalid language code: " + code)))
                    .collect(Collectors.toSet());

            for (Language language : newLanguages) {
                UserLanguage ul = new UserLanguage();
                ul.setUser(user);
                ul.setLanguage(language);
                ul.setId(new UserLanguageId(user.getId(), language.getLangCode()));
                user.getUserLanguages().add(ul);
            }
        }

        // VISITED COUNTRIES
        if (request.getVisitedCountryCodes() != null) {
            Set<String> newCountryCodes = request.getVisitedCountryCodes();

            user.getVisitedCountries().removeIf(uvc -> !newCountryCodes.contains(uvc.getCountry().getIsoCode()));

            Set<String> existingCountryCodes = user.getVisitedCountries().stream()
                    .map(uvc -> uvc.getCountry().getIsoCode())
                    .collect(Collectors.toSet());

            Set<UserVisitedCountry> newVisitedCountries = newCountryCodes.stream()
                    .filter(code -> !existingCountryCodes.contains(code))
                    .map(code -> {
                        Country visited = countryRepository.findByIsoCode(code)
                                .orElseThrow(() -> new IllegalArgumentException("Invalid visited country code: " + code));

                        UserVisitedCountry uvc = new UserVisitedCountry();
                        uvc.setUser(user);
                        uvc.setCountry(visited);
                        uvc.setDateOfVisit(LocalDate.now());
                        uvc.setId(new UserVisitedCountryId(user.getId(), visited.getIsoCode()));
                        return uvc;
                    })
                    .collect(Collectors.toSet());

            user.getVisitedCountries().addAll(newVisitedCountries);
        }

        // PROFILE IMAGE PATH
        if (request.getProfileImagePath() != null) {
            // Validate avatar URL to prevent malicious or unauthorized image URLs
            String avatarPath = request.getProfileImagePath();
            if (!isValidAvatarUrl(avatarPath)) {
                throw new IllegalArgumentException("Invalid avatar URL. Only avatar-1.png to avatar-20.png from cdn.shadcnstudio.com are allowed.");
            }
            user.setProfileImagePath(avatarPath);
        }

        UserEntity savedUser = userRepository.save(user);
        return UserDto.from(savedUser);
    }

    /**
     * Validates that the avatar URL is from the allowed CDN and matches the expected pattern.
     * Only allows avatar-1.png through avatar-20.png from cdn.shadcnstudio.com
     * 
     * @param url The avatar URL to validate
     * @return true if the URL is valid, false otherwise
     */
    private boolean isValidAvatarUrl(String url) {
        if (url == null || url.isBlank()) {
            return false;
        }
        
        // Must start with the allowed CDN base URL
        String allowedBaseUrl = "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-";
        if (!url.startsWith(allowedBaseUrl)) {
            return false;
        }
        
        // Must end with .png
        if (!url.endsWith(".png")) {
            return false;
        }
        
        // Extract the avatar number
        String numberPart = url.substring(allowedBaseUrl.length(), url.length() - 4);
        
        try {
            int avatarNumber = Integer.parseInt(numberPart);
            // Only allow numbers 1-20
            return avatarNumber >= 1 && avatarNumber <= 20;
        } catch (NumberFormatException e) {
            return false;
        }
    }
}