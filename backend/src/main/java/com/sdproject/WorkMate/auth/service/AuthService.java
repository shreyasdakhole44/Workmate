package com.sdproject.WorkMate.auth.service;

import com.sdproject.WorkMate.auth.dto.AuthResponse;
import com.sdproject.WorkMate.auth.dto.LoginRequest;
import com.sdproject.WorkMate.auth.dto.RegisterRequest;
import com.sdproject.WorkMate.auth.entity.User;
import com.sdproject.WorkMate.auth.repository.UserRepository;
import com.sdproject.WorkMate.common.exception.WorkmateException;
import com.sdproject.WorkMate.config.JwtUtil;
import com.sdproject.WorkMate.employee.entity.Employee;
import com.sdproject.WorkMate.employee.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    // ── LOGIN ──────────────────────────────────────────────────────────────

    public AuthResponse login(LoginRequest request) {

        // Step 1: Authenticate — throws BadCredentialsException if wrong
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        // Step 2: Load user from DB
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new WorkmateException("User not found"));

        // Step 3: Generate JWT token
        String token = jwtUtil.generateToken(
                user.getEmail(),
                user.getRole().name()
        );

        // Step 4: Try to find employee profile linked to this user
        Optional<Employee> employeeOpt =
                employeeRepository.findByUserId(user.getId());

        // Step 5: Build and return response
        return AuthResponse.builder()
                .token(token)
                .email(user.getEmail())
                .role(user.getRole())
                .userId(user.getId())
                .employeeId(employeeOpt.map(Employee::getId).orElse(null))
                .fullName(employeeOpt.map(Employee::getFullName).orElse(null))
                .build();
    }

    // ── REGISTER ───────────────────────────────────────────────────────────
    // Only Admin can call this endpoint (enforced in controller)

    public AuthResponse register(RegisterRequest request) {

        // Step 1: Check if user already exists
        Optional<User> existingUserOpt = userRepository.findByEmail(request.getEmail());
        if (existingUserOpt.isPresent()) {
            User existingUser = existingUserOpt.get();
            // If the user is already linked to an employee profile, block duplicate registration
            if (employeeRepository.findByUserId(existingUser.getId()).isPresent()) {
                throw new WorkmateException("Email already registered: " + request.getEmail());
            }
            // Otherwise, return the existing user (self-healing from a previous half-failed creation)
            String token = jwtUtil.generateToken(
                    existingUser.getEmail(),
                    existingUser.getRole().name()
            );
            return AuthResponse.builder()
                    .token(token)
                    .email(existingUser.getEmail())
                    .role(existingUser.getRole())
                    .userId(existingUser.getId())
                    .build();
        }

        // Step 2: Hash password with BCrypt
        String hashedPassword = passwordEncoder.encode(request.getPassword());

        // Step 3: Save new user
        User newUser = User.builder()
                .email(request.getEmail())
                .passwordHash(hashedPassword)
                .role(request.getRole())
                .isActive(true)
                .build();

        User savedUser = userRepository.save(newUser);

        // Step 4: Generate token for the new user
        String token = jwtUtil.generateToken(
                savedUser.getEmail(),
                savedUser.getRole().name()
        );

        return AuthResponse.builder()
                .token(token)
                .email(savedUser.getEmail())
                .role(savedUser.getRole())
                .userId(savedUser.getId())
                .build();
    }

    // ── GET CURRENT USER HELPERS ───────────────────────────────────────────

    public String getEmailFromToken(String token) {
        return jwtUtil.extractEmail(token);
    }

    public AuthResponse getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new WorkmateException("User not found"));

        Optional<Employee> employeeOpt =
                employeeRepository.findByUserId(user.getId());

        return AuthResponse.builder()
                .email(user.getEmail())
                .role(user.getRole())
                .userId(user.getId())
                .employeeId(employeeOpt.map(Employee::getId).orElse(null))
                .fullName(employeeOpt.map(Employee::getFullName).orElse(null))
                .build();
    }
}
