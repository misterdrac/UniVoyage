package com.univoyage.trip.util;

import com.univoyage.user.model.UserEntity;

/**
 * Public-safe display name for review cards (first name + surname initial).
 */
public final class ReviewerDisplayNameFormatter {

    private ReviewerDisplayNameFormatter() {
    }

    public static String format(UserEntity u) {
        if (u == null) {
            return "Traveller";
        }
        String first = u.getName() != null ? u.getName().trim() : "";
        if (first.isEmpty()) {
            return "Traveller";
        }
        String sur = u.getSurname() != null ? u.getSurname().trim() : "";
        if (sur.isEmpty()) {
            return first;
        }
        return first + " " + Character.toUpperCase(sur.charAt(0)) + ".";
    }
}
