package com.univoyage.auth.security;

public final class CookieUtils {
    private CookieUtils() {}
    public static final String JWT_COOKIE_NAME = "auth_token";
    public static final String CSRF_COOKIE_NAME = "csrf_token";
    public static final String REFRESH_TOKEN_COOKIE_NAME = "refresh_token";
}
