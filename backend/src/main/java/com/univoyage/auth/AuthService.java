package com.univoyage.auth;

import com.univoyage.auth.dto.AuthPayload;
import com.univoyage.auth.dto.RegisterRequestDto;
import com.univoyage.auth.user.UserDto;
import com.univoyage.auth.user.UserEntity;
import com.univoyage.auth.user.UserRepository;
import com.univoyage.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.time.Instant;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final JwtService jwt;

    public AuthPayload register(RegisterRequestDto request){

        // check if email is used
        if (users.existsByEmail(request.getEmail())) {
            return AuthPayload.fail("Email already registered");
        }

        // if not, build user entity by sending data from JSON request
        // service maps request JSON data to User entity object
        var user = UserEntity.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(encoder.encode(request.getPassword())) // store hash in "password"
                .role("user") // keep lowercase to match DB default
                .country(request.getCountry())
                .hobbies(emptyIfNull(request.getHobbies()))
                .languages(emptyIfNull(request.getLanguages()))
                .visited(emptyIfNull(request.getVisited()))
                .dateOfRegister(Instant.now()) //sets current register time, it's return to frontend user, would show 1/1/1970
                .build();

        // save user to DB
        // instance of Repository saves user to database
        users.save(user);

        // generate JWT token, will be implemented once login works
        String token = jwt.generate(
                user.getEmail(),
                Map.of("uid", user.getId(), "role", user.getRole())
        );

        // return success with user data and token
        // returns user data from DB mapped to UserDto, UserDto is send thro AuthPayload that is also Dto
        return AuthPayload.ok(UserDto.from(user), token);
    }

    // helper to avoid null lists
    private static List<String> emptyIfNull(List<String> v){ return v == null ? List.of() : v; }
}
