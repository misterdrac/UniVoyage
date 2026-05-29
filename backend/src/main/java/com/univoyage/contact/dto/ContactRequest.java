package com.univoyage.contact.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Value;

@Value
public class ContactRequest {

  @NotBlank(message = "Name is required")
  @Size(max = 100, message = "Name must be at most 100 characters")
  String name;

  @NotBlank(message = "Email is required")
  @Email(message = "Must be a valid email address")
  String email;

  @NotBlank(message = "Subject is required")
  @Size(max = 200, message = "Subject must be at most 200 characters")
  String subject;

  @NotBlank(message = "Message is required")
  @Size(min = 10, max = 5000, message = "Message must be between 10 and 5000 characters")
  String message;
}
