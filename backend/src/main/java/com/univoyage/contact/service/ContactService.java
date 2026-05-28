package com.univoyage.contact.service;

import com.univoyage.contact.dto.ContactRequest;
import com.univoyage.contact.dto.ContactResponse;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@Log4j2
public class ContactService {

  public ContactResponse submitContactForm(ContactRequest request) {
    String referenceId = UUID.randomUUID().toString().substring(0, 8).toUpperCase();

    log.info("Contact form submission [ref={}]: from={}, email={}, subject={}", referenceId,
        request.getName(), request.getEmail(), request.getSubject());

    return new ContactResponse(
        "Thank you for reaching out! We'll get back to you within 24-48 hours.", referenceId);
  }
}
