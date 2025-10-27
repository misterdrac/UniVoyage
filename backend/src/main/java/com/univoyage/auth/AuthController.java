package com.univoyage.auth;

import com.univoyage.auth.dto.AuthPayload;
import com.univoyage.auth.dto.RegisterRequestDto;
import com.univoyage.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = {"http://localhost:5173","http://127.0.0.1:5173"}, allowCredentials = "true")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthPayload>> register(@Valid @RequestBody RegisterRequestDto request) {

        // binds request data (JSON) to RegisterRequest object automatically
        // @Valid triggers validation based on annotations in RegisterRequest
        // if validation fails, Spring returns 400 Bad Request with error details
        // if validation passes, we proceed to register the user
        // call AuthService to handle registration login
        AuthPayload payload = authService.register(request);

        int status = payload.isSuccess() ? 200 : 409;

        // we create ApiResponse instance that will print response if it failed or succeeded
        ApiResponse<AuthPayload> body;
        if (payload.isSuccess()) {
            body = ApiResponse.ok(payload);
        } else {
            body = ApiResponse.fail(payload.getError());
        }

        // return HTTP response with appropriate status and body
        return ResponseEntity.status(status).body(body);
    }
}