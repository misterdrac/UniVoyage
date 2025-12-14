package com.univoyage.auth.user;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String userIdString) throws UsernameNotFoundException {

        /*
        // JWT subject = email, that's why we search by email here
        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UsernameNotFoundException("User not found with email: " + email));
        */
        // JWT subject is user ID, so we search by user Id
        Long userId;
        try{
            userId = Long.parseLong(userIdString);
        } catch(NumberFormatException e) {
            // If the userIdString is not a valid Long, throw an exception
            throw new UsernameNotFoundException("Invalid user ID in JWT subject: " + userIdString);
        }
        // return UserEntity by ID
        // If user not found, throw UsernameNotFoundException
        // This will be caught by Spring Security and return 401 Unauthorized
        // to the client, which will then redirect to /login or show an error message
        return userRepository.findById(userId).orElseThrow(() -> new UsernameNotFoundException("User not found with ID: " + userId));
    }
}
