package com.univoyage.auth.security;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

/**
 * Sets and clears auth-related cookies using shared application cookie settings.
 */
@Component
public class AuthCookieWriter {

    @Value("${app.jwt.ttl-seconds}")
    private long accessTokenTtlSeconds;

    @Value("${app.jwt.refresh-ttl-seconds}")
    private long refreshTokenTtlSeconds;

    @Value("${app.cookies.secure:false}")
    private boolean cookieSecure;

    @Value("${app.cookies.same-site:Lax}")
    private String cookieSameSite;

    @Value("${app.cookies.domain:}")
    private String cookieDomain;

    public void writeAuthCookies(HttpServletResponse response, String accessJwt, String csrfToken, String refreshTokenRaw) {
        if (accessJwt != null && !accessJwt.isBlank()) {
            response.addHeader(HttpHeaders.SET_COOKIE, buildCookie(CookieUtils.JWT_COOKIE_NAME, accessJwt, accessTokenTtlSeconds, true).toString());
        }
        if (csrfToken != null && !csrfToken.isBlank()) {
            response.addHeader(HttpHeaders.SET_COOKIE, buildCookie(CookieUtils.CSRF_COOKIE_NAME, csrfToken, accessTokenTtlSeconds, false).toString());
        }
        if (refreshTokenRaw != null && !refreshTokenRaw.isBlank()) {
            response.addHeader(HttpHeaders.SET_COOKIE, buildCookie(CookieUtils.REFRESH_TOKEN_COOKIE_NAME, refreshTokenRaw, refreshTokenTtlSeconds, true).toString());
        }
    }

    public void clearAuthCookies(HttpServletResponse response) {
        response.addHeader(HttpHeaders.SET_COOKIE, buildCookie(CookieUtils.JWT_COOKIE_NAME, "", 0, true).toString());
        response.addHeader(HttpHeaders.SET_COOKIE, buildCookie(CookieUtils.CSRF_COOKIE_NAME, "", 0, false).toString());
        response.addHeader(HttpHeaders.SET_COOKIE, buildCookie(CookieUtils.REFRESH_TOKEN_COOKIE_NAME, "", 0, true).toString());
    }

    private ResponseCookie buildCookie(String name, String value, long maxAgeSeconds, boolean httpOnly) {
        ResponseCookie.ResponseCookieBuilder b = ResponseCookie.from(name, value)
                .httpOnly(httpOnly)
                .secure(cookieSecure)
                .path("/")
                .maxAge(maxAgeSeconds)
                .sameSite(cookieSameSite);

        if (cookieDomain != null && !cookieDomain.isBlank()) {
            b.domain(cookieDomain);
        }

        return b.build();
    }
}
