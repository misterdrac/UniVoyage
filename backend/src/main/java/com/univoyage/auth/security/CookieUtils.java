package com.univoyage.auth.security;

import jakarta.servlet.http.Cookie;

public final class CookieUtils {

    private CookieUtils() {}

    public static final String JWT_COOKIE_NAME = "auth_token";
    public static final String CSRF_COOKIE_NAME = "csrf_token";

    /**
     * HttpOnly cookie for the JWT (Token A).
     * The frontend CANNOT read it; the browser sends it automatically.
     */
    public static Cookie createJwtCookie(String token, int maxAgeSeconds, boolean secure) {
        Cookie cookie = new Cookie(JWT_COOKIE_NAME, token);
        cookie.setHttpOnly(true);
        cookie.setSecure(secure);
        cookie.setPath("/");
        cookie.setMaxAge(maxAgeSeconds);
        // SameSite cannot be set directly through the Cookie API in Java,
        // but Spring Boot will add it when using ResponseCookie.
        return cookie;
    }

    /**
     * Readable cookie for the CSRF secret (Token B).
     * The frontend must read this value and send it in the X-CSRF-TOKEN header.
     */
    public static Cookie createCsrfCookie(String csrfSecret, int maxAgeSeconds, boolean secure) {
        Cookie cookie = new Cookie(CSRF_COOKIE_NAME, csrfSecret);
        cookie.setHttpOnly(false); // must be readable by the frontend
        cookie.setSecure(secure);
        cookie.setPath("/");
        cookie.setMaxAge(maxAgeSeconds);
        return cookie;
    }

    /**
     * Expired cookie used for deletion (logout / invalid token).
     */
    public static Cookie createExpiredCookie(String name) {
        Cookie cookie = new Cookie(name, "");
        cookie.setPath("/");
        cookie.setMaxAge(0);
        cookie.setHttpOnly(true);
        return cookie;
    }
}
