package com.sdproject.WorkMate.auth.dto;

import com.sdproject.WorkMate.auth.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    private String token;
    private String email;
    private Role role;
    private Long userId;

    // Populated if the user has an employee profile
    private Long employeeId;
    private String fullName;
}
