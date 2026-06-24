package com.sdproject.WorkMate.auth.controller;

import com.sdproject.WorkMate.auth.dto.AuthResponse;
import com.sdproject.WorkMate.auth.dto.LoginRequest;
import com.sdproject.WorkMate.auth.dto.RegisterRequest;
import com.sdproject.WorkMate.auth.service.AuthService;
import com.sdproject.WorkMate.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Login and Register endpoints")
public class AuthController {

    private final AuthService authService;

    // ── POST /api/auth/login ───────────────────────────────────────────────
    // Public — anyone can call this
    @PostMapping("/login")
    @Operation(
        summary = "Login",
        description = "Send email + password, get JWT token back"
    )
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request) {

        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(
                ApiResponse.success("Login successful", response));
    }

    // ── POST /api/auth/register ────────────────────────────────────────────
    // Only ADMIN can create new user accounts
    @PostMapping("/register")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
        summary = "Register new user",
        description = "Admin only — creates a login account. " +
                      "Use POST /api/employees to create the employee profile."
    )
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request) {

        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(
                ApiResponse.success("User registered successfully", response));
    }

    // ── GET /api/auth/me ───────────────────────────────────────────────────
    // Any logged-in user can call this to get their own info
    @GetMapping("/me")
    @Operation(
        summary = "Get current user",
        description = "Returns the profile of the currently logged-in user"
    )
    public ResponseEntity<ApiResponse<AuthResponse>> getCurrentUser(
            @RequestHeader("Authorization") String authHeader) {

        // Extract token and return user info
        String token = authHeader.substring(7);
        String email = authService.getEmailFromToken(token);
        AuthResponse response = authService.getUserByEmail(email);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
