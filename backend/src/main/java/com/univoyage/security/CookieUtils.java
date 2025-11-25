package com.univoyage.security;

import jakarta.servlet.http.Cookie;

public final class CookieUtils {

    private CookieUtils() {}

    public static final String JWT_COOKIE_NAME = "auth_token";
    public static final String CSRF_COOKIE_NAME = "csrf_token";

    /**
     * HttpOnly cookie za JWT (Token A).
     * Frontend ga NE može čitati, browser ga automatski šalje.
     */
    public static Cookie createJwtCookie(String token, int maxAgeSeconds, boolean secure) {
        Cookie cookie = new Cookie(JWT_COOKIE_NAME, token);
        cookie.setHttpOnly(true);
        cookie.setSecure(secure);
        cookie.setPath("/");
        cookie.setMaxAge(maxAgeSeconds);
        // SameSite se ne može direktno preko Cookie API-ja u Javi,
        // ali Spring Boot će ga dodati kad se koristi ResponseCookie.
        return cookie;
    }

    /**
     * Readable cookie za CSRF secret (Token B).
     * Frontend ga mora pročitati i slati u headeru X-CSRF-TOKEN.
     */
    public static Cookie createCsrfCookie(String csrfSecret, int maxAgeSeconds, boolean secure) {
        Cookie cookie = new Cookie(CSRF_COOKIE_NAME, csrfSecret);
        cookie.setHttpOnly(false); // mora biti čitljiv na frontendu
        cookie.setSecure(secure);
        cookie.setPath("/");
        cookie.setMaxAge(maxAgeSeconds);
        return cookie;
    }

    /**
     * Expired cookie za brisanje (logout / invalid token).
     */
    public static Cookie createExpiredCookie(String name) {
        Cookie cookie = new Cookie(name, "");
        cookie.setPath("/");
        cookie.setMaxAge(0);
        cookie.setHttpOnly(true);
        return cookie;
    }
}
