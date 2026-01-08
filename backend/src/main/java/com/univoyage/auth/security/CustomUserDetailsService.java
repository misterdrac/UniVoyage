package com.univoyage.auth.security;

import com.univoyage.user.repository.UserRepository;

import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

/**
 * Custom UserDetailsService to load user details by user ID from JWT.
 * Implements Spring Security's UserDetailsService interface.
 * Retrieves user information from UserRepository.
 * Throws UsernameNotFoundException if user is not found.
 */
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    /**
     * Load user details by user ID string.
     * Parses user ID from string to Long.
     * Retrieves UserEntity from UserRepository.
     * @param userIdString
     * @return UserDetails
     * @throws UsernameNotFoundException if user not found
     */
    @Override
    public UserDetails loadUserByUsername(String userIdString) throws UsernameNotFoundException {

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