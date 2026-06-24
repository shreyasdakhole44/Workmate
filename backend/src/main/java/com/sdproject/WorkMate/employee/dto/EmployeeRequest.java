package com.sdproject.WorkMate.employee.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class EmployeeRequest {

    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    @NotBlank(message = "Department is required")
    private String department;

    private String designation;

    @Pattern(regexp = "^[0-9]{10}$", message = "Phone must be 10 digits")
    private String phone;

    private String address;

    private LocalDate joinDate;

    @DecimalMin(value = "0.0", message = "Salary cannot be negative")
    private BigDecimal salary;

    private String profilePicUrl;

    // ID of the user account to link to this employee
    @NotNull(message = "User ID is required")
    private Long userId;

    // Optional — employee's reporting manager
    private Long managerId;

    // Optional — role of the user (e.g., ADMIN, HR_MANAGER, EMPLOYEE)
    private String role;
}
