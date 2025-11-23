package com.univoyage.auth;

import com.univoyage.auth.dto.AuthPayload;
import com.univoyage.auth.dto.RegisterRequestDto;
import com.univoyage.auth.repository.CountryRepository;
import com.univoyage.auth.repository.HobbyRepository;
import com.univoyage.auth.repository.LanguageRepository;
import com.univoyage.auth.user.UserDto;
import com.univoyage.auth.user.UserEntity;
import com.univoyage.auth.user.UserRepository;
import com.univoyage.auth.user.relations.Country;
import com.univoyage.auth.user.relations.Hobby;
import com.univoyage.auth.user.relations.Language;
import com.univoyage.auth.user.relations.UserHobby;
import com.univoyage.auth.user.relations.UserLanguage;
import com.univoyage.auth.user.relations.UserVisitedCountry;
import com.univoyage.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Collections;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.Optional;

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

        // 1. Check if email is already in use
        if(userRepository.findByEmail(request.getEmail()).isPresent()){
            throw new IllegalArgumentException("Email is already in use");
        }

        // 2. Fetch Country of Origin Entity
        Country country = countryRepository.findByIsoCode(request.getCountryCode())
                .orElseThrow(() -> new IllegalArgumentException("Invalid country code: " + request.getCountryCode()));

        // 3. Create initial User Entity and hash password
        UserEntity newUser = UserEntity.builder()
                .name(request.getName())
                .surname(request.getSurname())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword())) // Correct field name
                .country(country)
                .dateOfRegister(Instant.now())
                .build();

        // 4. Handle Hobbies: Fetch, validate, and map to UserHobby join entities
        Set<Hobby> hobbyEntities = Optional.ofNullable(request.getHobbyIds())
                .orElse(Collections.emptySet()).stream()
                .map(id -> hobbyRepository.findById(id)
                        .orElseThrow(() -> new IllegalArgumentException("Invalid hobby id: " + id)))
                .collect(Collectors.toSet());

        Set<UserHobby> userHobbies = hobbyEntities.stream()
                .map(hobby -> UserHobby.builder().user(newUser).hobby(hobby).build())
                .collect(Collectors.toSet());
        newUser.setUserHobbies(userHobbies);


        // 5. Handle Languages: Fetch by code, validate, and map to UserLanguage join entities
        Set<Language> languageEntities = Optional.ofNullable(request.getLanguageCodes())
                .orElse(Collections.emptySet()).stream()
                .map(code -> languageRepository.findById(code) // Languages use String codes as PK
                        .orElseThrow(() -> new IllegalArgumentException("Invalid language code: " + code)))
                .collect(Collectors.toSet());

        Set<UserLanguage> userLanguages = languageEntities.stream()
                .map(language -> UserLanguage.builder().user(newUser).language(language).build())
                .collect(Collectors.toSet());
        newUser.setUserLanguages(userLanguages);


        // 6. Handle Visited Countries: Fetch by code and map to UserVisitedCountry join entities
        Set<Country> visitedCountryEntities = Optional.ofNullable(request.getVisitedCountryCodes())
                .orElse(Collections.emptySet()).stream()
                .map(code -> countryRepository.findByIsoCode(code)
                        .orElseThrow(() -> new IllegalArgumentException("Invalid visited country code: " + code)))
                .collect(Collectors.toSet());

        Set<UserVisitedCountry> userVisitedCountries = visitedCountryEntities.stream()
                .map(visitedCountry -> UserVisitedCountry.builder()
                        .user(newUser)
                        .country(visitedCountry)
                        .dateOfVisit(null) // Date set to null during registration
                        .build())
                .collect(Collectors.toSet());
        newUser.setVisitedCountries(userVisitedCountries);


        // 7. Save user (ID is generated here)
        UserEntity savedUser = userRepository.save(newUser);

        // 8. Generate JWT token
        String token = jwtService.generateToken(savedUser);

        // 9. Return standard AuthPayload response
        return new AuthPayload(token, UserDto.from(savedUser));
    }
}