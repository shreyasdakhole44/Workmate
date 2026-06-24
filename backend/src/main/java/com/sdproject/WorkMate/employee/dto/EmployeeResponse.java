package com.sdproject.WorkMate.employee.dto;

import com.sdproject.WorkMate.auth.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeResponse {

    private Long id;
    private String empCode;
    private String firstName;
    private String lastName;
    private String fullName;
    private String department;
    private String designation;
    private String phone;
    private String address;
    private LocalDate joinDate;
    private BigDecimal salary;
    private String profilePicUrl;
    private Boolean isActive;
    private LocalDateTime createdAt;

    // From linked User
    private Long userId;
    private String email;
    private Role role;

    // Manager info
    private Long managerId;
    private String managerName;
}
