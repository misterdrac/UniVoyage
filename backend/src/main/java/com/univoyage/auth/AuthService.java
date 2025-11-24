package com.univoyage.auth;

import com.univoyage.auth.dto.AuthPayload;
import com.univoyage.auth.dto.RegisterRequestDto;
import com.univoyage.auth.repository.CountryRepository;
import com.univoyage.auth.repository.HobbyRepository;
import com.univoyage.auth.repository.LanguageRepository;
import com.univoyage.auth.user.UserDto;
import com.univoyage.auth.user.UserEntity;
import com.univoyage.auth.user.UserRepository;
import com.univoyage.auth.user.relations.*;
import com.univoyage.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Collections;
import java.util.Optional;
import java.util.Set;
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

        // 1) email unique
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email is already in use");
        }

        // 2) country of origin by ISO
        Country country = countryRepository.findByIsoCode(request.getCountryCode())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Invalid country code: " + request.getCountryCode()
                ));

        // 3) create user
        UserEntity newUser = UserEntity.builder()
                .name(request.getName())
                .surname(request.getSurname())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .country(country)
                .dateOfRegister(Instant.now())
                .role(Role.USER)
                .build();

        // 4) hobbies
        Set<Hobby> hobbyEntities = Optional.ofNullable(request.getHobbyIds())
                .orElse(Collections.emptySet())
                .stream()
                .map(id -> hobbyRepository.findById(id)
                        .orElseThrow(() -> new IllegalArgumentException("Invalid hobby id: " + id)))
                .collect(Collectors.toSet());

        Set<UserHobby> userHobbies = hobbyEntities.stream()
                .map(h -> UserHobby.builder()
                        .user(newUser)
                        .hobby(h)
                        .build())
                .collect(Collectors.toSet());

        newUser.setUserHobbies(userHobbies);

        // 5) languages
        Set<Language> languageEntities = Optional.ofNullable(request.getLanguageCodes())
                .orElse(Collections.emptySet())
                .stream()
                .map(code -> languageRepository.findById(code)
                        .orElseThrow(() -> new IllegalArgumentException("Invalid language code: " + code)))
                .collect(Collectors.toSet());

        Set<UserLanguage> userLanguages = languageEntities.stream()
                .map(l -> UserLanguage.builder()
                        .user(newUser)
                        .language(l)
                        .build())
                .collect(Collectors.toSet());

        newUser.setUserLanguages(userLanguages);

        // 6) visited countries (2-char ISO)
        Set<Country> visitedCountries = Optional.ofNullable(request.getVisitedCountryCodes())
                .orElse(Collections.emptySet())
                .stream()
                .map(code -> countryRepository.findByIsoCode(code)
                        .orElseThrow(() -> new IllegalArgumentException("Invalid visited country code: " + code)))
                .collect(Collectors.toSet());

        Set<UserVisitedCountry> uvc = visitedCountries.stream()
                .map(vc -> UserVisitedCountry.builder()
                        .user(newUser)
                        .country(vc)
                        .dateOfVisit(null)
                        .build())
                .collect(Collectors.toSet());

        newUser.setVisitedCountries(uvc);

        // 7) save
        UserEntity savedUser = userRepository.save(newUser);

        // 8) jwt + csrf inside
        String token = jwtService.generateToken(savedUser);

        // 9) payload
        return new AuthPayload(token, UserDto.from(savedUser));
    }
}
