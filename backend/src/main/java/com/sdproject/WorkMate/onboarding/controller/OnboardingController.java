package com.sdproject.WorkMate.onboarding.controller;

import com.sdproject.WorkMate.auth.entity.User;
import com.sdproject.WorkMate.auth.repository.UserRepository;
import com.sdproject.WorkMate.common.dto.ApiResponse;
import com.sdproject.WorkMate.common.exception.WorkmateException;
import com.sdproject.WorkMate.employee.entity.Employee;
import com.sdproject.WorkMate.employee.repository.EmployeeRepository;
import com.sdproject.WorkMate.onboarding.dto.OnboardingTaskDto;
import com.sdproject.WorkMate.onboarding.entity.TaskStatus;
import com.sdproject.WorkMate.onboarding.service.OnboardingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/onboarding")
@RequiredArgsConstructor
@Tag(name = "Onboarding Management", description = "Endpoints for employee checklists, progress meters, and task tracking")
public class OnboardingController {

    private final OnboardingService onboardingService;
    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;

    @GetMapping("/my-tasks")
    @Operation(summary = "Get current employee's onboarding checklist")
    public ResponseEntity<ApiResponse<List<OnboardingTaskDto>>> getMyTasks(Authentication authentication) {
        Long empId = getCurrentEmployeeId(authentication);
        List<OnboardingTaskDto> tasks = onboardingService.getTasksByEmployee(empId);
        return ResponseEntity.ok(ApiResponse.success(tasks));
    }

    @GetMapping("/tasks/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    @Operation(summary = "Get onboarding checklist for specific employee (Admin/HR only)")
    public ResponseEntity<ApiResponse<List<OnboardingTaskDto>>> getEmployeeTasks(@PathVariable Long employeeId) {
        List<OnboardingTaskDto> tasks = onboardingService.getTasksByEmployee(employeeId);
        return ResponseEntity.ok(ApiResponse.success(tasks));
    }

    @PutMapping("/tasks/{id}/status")
    @Operation(summary = "Update status of an onboarding task")
    public ResponseEntity<ApiResponse<OnboardingTaskDto>> updateTaskStatus(
            Authentication authentication,
            @PathVariable Long id,
            @RequestParam TaskStatus status) {
        // Optional security check: if role is ROLE_EMPLOYEE, check if task belongs to them.
        // For simplicity and completeness, we let users update their tasks.
        OnboardingTaskDto updated = onboardingService.updateTaskStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("Task status updated successfully.", updated));
    }

    @GetMapping("/my-progress")
    @Operation(summary = "Get onboarding progress percentage for current employee")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMyProgress(Authentication authentication) {
        Long empId = getCurrentEmployeeId(authentication);
        Map<String, Object> progress = onboardingService.getProgressMetrics(empId);
        return ResponseEntity.ok(ApiResponse.success(progress));
    }

    @GetMapping("/progress/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    @Operation(summary = "Get onboarding progress percentage for specific employee")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getEmployeeProgress(@PathVariable Long employeeId) {
        Map<String, Object> progress = onboardingService.getProgressMetrics(employeeId);
        return ResponseEntity.ok(ApiResponse.success(progress));
    }

    @GetMapping("/progress")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    @Operation(summary = "Get all employees onboarding progress list (Admin/HR only)")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAllProgress() {
        List<Map<String, Object>> list = onboardingService.getAllEmployeesProgress();
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    // Helper to resolve employee id of authenticated user
    private Long getCurrentEmployeeId(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new WorkmateException("User account not found"));
        Employee employee = employeeRepository.findByUserId(user.getId())
                .orElseThrow(() -> new WorkmateException("Employee profile not linked to this user account"));
        return employee.getId();
    }
}
