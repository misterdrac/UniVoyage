package com.univoyage.contact.controller;

import com.univoyage.common.response.ApiResponse;
import com.univoyage.contact.dto.ContactRequest;
import com.univoyage.contact.dto.ContactResponse;
import com.univoyage.contact.service.ContactService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/contact")
@RequiredArgsConstructor
public class ContactController {

  private final ContactService contactService;

  @PostMapping
  public ResponseEntity<ApiResponse<ContactResponse>> submitContactForm(
      @Valid @RequestBody ContactRequest request) {
    ContactResponse response = contactService.submitContactForm(request);
    return ResponseEntity.ok(ApiResponse.ok(response));
  }
}
