package com.univoyage.auth.security;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;

import static org.junit.jupiter.api.Assertions.assertEquals;

class ClientIpResolverTest {

    @Test
    @DisplayName("Uses first address from X-Forwarded-For")
    void xForwardedForFirstHop() {
        MockHttpServletRequest req = new MockHttpServletRequest();
        req.addHeader("X-Forwarded-For", "198.51.100.2, 10.0.0.1");
        req.setRemoteAddr("127.0.0.1");
        assertEquals("198.51.100.2", ClientIpResolver.resolve(req));
    }

    @Test
    @DisplayName("Falls back to X-Real-IP when X-Forwarded-For is absent")
    void xRealIpFallback() {
        MockHttpServletRequest req = new MockHttpServletRequest();
        req.addHeader("X-Real-IP", "203.0.113.5");
        req.setRemoteAddr("127.0.0.1");
        assertEquals("203.0.113.5", ClientIpResolver.resolve(req));
    }

    @Test
    @DisplayName("Uses remote address when proxy headers are missing")
    void remoteAddrFallback() {
        MockHttpServletRequest req = new MockHttpServletRequest();
        req.setRemoteAddr("192.168.4.4");
        assertEquals("192.168.4.4", ClientIpResolver.resolve(req));
    }
}
