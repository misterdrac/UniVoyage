package com.univoyage.auth.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.univoyage.email.EmailAddressMasker;
import lombok.RequiredArgsConstructor;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Emits structured JSON security event log lines for all auth operations. Uses
 * a dedicated Log4j2 logger ("security-events") routed to a separate JSON Lines
 * file for incident response and log aggregation.
 */
@Service
@RequiredArgsConstructor
public class AuthSecurityEventLogger {

  private static final Logger SECURITY_LOG = LogManager.getLogger("security-events");
  private final ObjectMapper objectMapper;

  public enum EventType {
    AUTH_LOGIN_SUCCESS, AUTH_LOGIN_FAILED, AUTH_LOGOUT, AUTH_OTP_REQUESTED, AUTH_OTP_VERIFIED, AUTH_OTP_FAILED, AUTH_OAUTH_SUCCESS, AUTH_OAUTH_FAILED, AUTH_PASSWORD_RESET_REQUESTED, AUTH_PASSWORD_RESET_COMPLETED, AUTH_2FA_CHALLENGED, AUTH_2FA_VERIFIED, AUTH_2FA_FAILED, AUTH_RATE_LIMITED
  }

  public enum Result {
    SUCCESS, FAILURE
  }

  public void log(EventType eventType, Result result, Long userId, String email, String ip,
      String method) {
    log(eventType, result, userId, email, ip, method, null);
  }

  public void log(EventType eventType, Result result, Long userId, String email, String ip,
      String method, String detail) {
    Map<String, Object> event = new LinkedHashMap<>();
    event.put("timestamp", Instant.now().toString());
    event.put("eventType", eventType.name());
    event.put("result", result.name());
    event.put("userId", userId);
    event.put("email", EmailAddressMasker.mask(email));
    event.put("ip", ip);
    event.put("method", method);
    if (detail != null) {
      event.put("detail", detail);
    }

    try {
      String json = objectMapper.writeValueAsString(event);
      SECURITY_LOG.info(json);
    } catch (Exception e) {
      SECURITY_LOG.warn("Failed to serialize security event: {}", eventType);
    }
  }
}
