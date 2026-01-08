package com.univoyage.auth.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

/**
 * Utility component to retrieve the currently authenticated user's ID.
 * Extracts user ID from the SecurityContext.
 */
@Component
public class CurrentUser {

    public Long id() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getPrincipal() == null) {
            throw new IllegalStateException("Unauthenticated");
        }

        Object principal = auth.getPrincipal();

        // In filter we set principal = userDetails, so this is the expected path.
        if (principal instanceof UserDetails ud) {
            // IMPORTANT: ud.getUsername() must be userId string
            return Long.parseLong(ud.getUsername());
        }

        // fallback (rare)
        return Long.parseLong(principal.toString());
    }
}
