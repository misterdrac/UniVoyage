package com.univoyage.auth;

import com.univoyage.auth.dto.AuthPayload;
import com.univoyage.auth.dto.LoginRequestDto;
import com.univoyage.auth.dto.RegisterRequestDto;
import com.univoyage.auth.dto.UpdateProfileRequestDto;
import com.univoyage.auth.repository.CountryRepository;
import com.univoyage.auth.repository.HobbyRepository;
import com.univoyage.auth.repository.LanguageRepository;
import com.univoyage.auth.user.UserEntity;
import com.univoyage.auth.user.UserRepository;
import com.univoyage.auth.user.dto.UserDto;
import com.univoyage.auth.user.relations.*;
import com.univoyage.auth.enumerations.Role;
import com.univoyage.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    private final CountryRepository countryRepository;
    private final HobbyRepository hobbyRepository;
    private final LanguageRepository languageRepository;

    @Transactional
    public AuthPayload register(RegisterRequestDto request) {

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return AuthPayload.fail("Email is already in use");
        }

        if (request.getCountryCode() == null || request.getCountryCode().isBlank()) {
            return AuthPayload.fail("Country code is required");
        }

        // home country (ISO code)
        Country country = countryRepository.findByIsoCode(request.getCountryCode())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Invalid country code: " + request.getCountryCode()
                ));

        Instant now = Instant.now();
        UserEntity newUser = UserEntity.builder()
                .name(request.getName())
                .surname(request.getSurname())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .country(country)
                .dateOfRegister(now)
                .dateOfLastSignin(now)
                .role(Role.USER)
                .build();

        // hobbies (Long IDs)
        Set<Hobby> hobbyEntities = Optional.ofNullable(request.getHobbyIds())
                .orElse(Collections.emptySet())
                .stream()
                .map(id -> hobbyRepository.findById(id)
                        .orElseThrow(() -> new IllegalArgumentException("Invalid hobby id: " + id)))
                .collect(Collectors.toSet());

        newUser.setUserHobbies(
                hobbyEntities.stream()
                        .map(h -> UserHobby.of(newUser, h))
                        .collect(Collectors.toSet())
        );

        // languages (ISO codes)
        Set<Language> languageEntities = Optional.ofNullable(request.getLanguageCodes())
                .orElse(Collections.emptySet())
                .stream()
                .map(code -> languageRepository.findById(code)
                        .orElseThrow(() -> new IllegalArgumentException("Invalid language code: " + code)))
                .collect(Collectors.toSet());

        newUser.setUserLanguages(
                languageEntities.stream()
                        .map(lang -> UserLanguage.of(newUser, lang))
                        .collect(Collectors.toSet())
        );

        // visited countries (ISO codes)
        Set<UserVisitedCountry> visitedCountries =
                Optional.ofNullable(request.getVisitedCountryCodes())
                        .orElse(Collections.emptySet())
                        .stream()
                        .map(code -> {
                            Country visited = countryRepository.findByIsoCode(code)
                                    .orElseThrow(() -> new IllegalArgumentException(
                                            "Invalid visited country code: " + code
                                    ));
                            return UserVisitedCountry.of(newUser, visited, LocalDate.now());
                        })
                        .collect(Collectors.toSet());

        newUser.setVisitedCountries(visitedCountries);

        UserEntity savedUser = userRepository.save(newUser);
        JwtService.TokenPair pair = jwtService.generateForUser(savedUser);

        return AuthPayload.ok(UserDto.from(savedUser), pair.jwt(), pair.csrfSecret());
    }

    @Transactional
    public AuthPayload login(LoginRequestDto request) {

        UserEntity user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            return AuthPayload.fail("Invalid credentials");
        }

        // Update last sign in date
        user.setDateOfLastSignin(Instant.now());
        userRepository.save(user);

        JwtService.TokenPair pair = jwtService.generateForUser(user);

        return AuthPayload.ok(UserDto.from(user), pair.jwt(), pair.csrfSecret());
    }

    @Transactional
    public UserDto updateProfile(Long userId, UpdateProfileRequestDto request) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        // Update basic fields if provided
        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName());
        }
        if (request.getSurname() != null && !request.getSurname().isBlank()) {
            user.setSurname(request.getSurname());
        }

        // Update country if provided
        if (request.getCountryCode() != null && !request.getCountryCode().isBlank()) {
            Country country = countryRepository.findByIsoCode(request.getCountryCode())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Invalid country code: " + request.getCountryCode()
                    ));
            user.setCountry(country);
        }

        // Update hobbies if provided
        if (request.getHobbyIds() != null) {
            // Remove existing hobbies that are not in the new list
            Set<Long> newHobbyIds = request.getHobbyIds();
            user.getUserHobbies().removeIf(uh -> !newHobbyIds.contains(uh.getHobby().getId()));
            
            // Add new hobbies that don't exist yet
            Set<Long> existingHobbyIds = user.getUserHobbies().stream()
                    .map(uh -> uh.getHobby().getId())
                    .collect(Collectors.toSet());
            
            Set<Hobby> newHobbies = newHobbyIds.stream()
                    .filter(id -> !existingHobbyIds.contains(id))
                    .map(id -> hobbyRepository.findById(id)
                            .orElseThrow(() -> new IllegalArgumentException("Invalid hobby id: " + id)))
                    .collect(Collectors.toSet());

            for (Hobby hobby : newHobbies) {
                user.getUserHobbies().add(UserHobby.of(user, hobby));
            }
        }

        // Update languages if provided
        if (request.getLanguageCodes() != null) {
            // Remove existing languages that are not in the new list
            Set<String> newLanguageCodes = request.getLanguageCodes();
            user.getUserLanguages().removeIf(ul -> !newLanguageCodes.contains(ul.getLanguage().getLangCode()));
            
            // Add new languages that don't exist yet
            Set<String> existingLanguageCodes = user.getUserLanguages().stream()
                    .map(ul -> ul.getLanguage().getLangCode())
                    .collect(Collectors.toSet());
            
            Set<Language> newLanguages = newLanguageCodes.stream()
                    .filter(code -> !existingLanguageCodes.contains(code))
                    .map(code -> languageRepository.findById(code)
                            .orElseThrow(() -> new IllegalArgumentException("Invalid language code: " + code)))
                    .collect(Collectors.toSet());

            for (Language language : newLanguages) {
                user.getUserLanguages().add(UserLanguage.of(user, language));
            }
        }

        // Update visited countries if provided
        if (request.getVisitedCountryCodes() != null) {
            // Remove existing visited countries that are not in the new list
            Set<String> newCountryCodes = request.getVisitedCountryCodes();
            user.getVisitedCountries().removeIf(uvc -> !newCountryCodes.contains(uvc.getCountry().getIsoCode()));
            
            // Add new visited countries that don't exist yet
            Set<String> existingCountryCodes = user.getVisitedCountries().stream()
                    .map(uvc -> uvc.getCountry().getIsoCode())
                    .collect(Collectors.toSet());
            
            Set<UserVisitedCountry> newVisitedCountries = newCountryCodes.stream()
                    .filter(code -> !existingCountryCodes.contains(code))
                    .map(code -> {
                        Country visited = countryRepository.findByIsoCode(code)
                                .orElseThrow(() -> new IllegalArgumentException(
                                        "Invalid visited country code: " + code
                                ));
                        return UserVisitedCountry.of(user, visited, LocalDate.now());
                    })
                    .collect(Collectors.toSet());

            user.getVisitedCountries().addAll(newVisitedCountries);
        }

        UserEntity savedUser = userRepository.save(user);
        return UserDto.from(savedUser);
    }
}
