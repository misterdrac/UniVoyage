package com.univoyage.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.util.List;


// DTO for user registration request
// used in AuthController
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class RegisterRequestDto {
    @Email @NotBlank private String email;
    @NotBlank private String password;
    @NotBlank private String name;         // required by your table
    private String country;
    private List<String> hobbies;
    private List<String> languages;
    private List<String> visited;          // optional; UI can ignore
}