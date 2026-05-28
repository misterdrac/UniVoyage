package com.univoyage.contact.controller;

import com.univoyage.auth.security.ClientIpResolver;
import com.univoyage.common.response.ApiResponse;
import com.univoyage.contact.dto.ContactRequest;
import com.univoyage.contact.dto.ContactResponse;
import com.univoyage.contact.security.ContactIpRateLimiter;
import com.univoyage.contact.service.ContactService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/contact")
@RequiredArgsConstructor
public class ContactController {

  private static final String RATE_LIMIT_MSG = "Too many contact submissions. Please try again later.";

  private final ContactService contactService;
  private final ContactIpRateLimiter contactIpRateLimiter;

  @PostMapping
  public ResponseEntity<ApiResponse<ContactResponse>> submitContactForm(
      @Valid @RequestBody ContactRequest request, HttpServletRequest httpRequest) {
    String ip = ClientIpResolver.resolve(httpRequest);
    long retryAfterSec = contactIpRateLimiter.tryConsumeOrRetryAfterSeconds(ip);
    if (retryAfterSec > 0) {
      return ResponseEntity.status(429)
          .header(HttpHeaders.RETRY_AFTER, String.valueOf(retryAfterSec))
          .body(ApiResponse.fail(RATE_LIMIT_MSG));
    }

    ContactResponse response = contactService.submitContactForm(request);
    return ResponseEntity.ok(ApiResponse.ok(response));
  }
}
