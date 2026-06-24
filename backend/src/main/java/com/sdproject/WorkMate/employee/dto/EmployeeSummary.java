package com.sdproject.WorkMate.employee.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeSummary {

    private Long id;
    private String empCode;
    private String fullName;
    private String department;
    private String designation;
    private String profilePicUrl;
}
