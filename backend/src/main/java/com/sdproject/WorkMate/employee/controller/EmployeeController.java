package com.sdproject.WorkMate.employee.controller;

import com.sdproject.WorkMate.common.dto.ApiResponse;
import com.sdproject.WorkMate.employee.dto.EmployeeRequest;
import com.sdproject.WorkMate.employee.dto.EmployeeResponse;
import com.sdproject.WorkMate.employee.dto.EmployeeSummary;
import com.sdproject.WorkMate.employee.service.EmployeeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
@Tag(name = "Employee Management", description = "Endpoints for managing employee profiles")
public class EmployeeController {

    private final EmployeeService employeeService;

    // ── POST /api/employees ────────────────────────────────────────────────
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create Employee Profile", description = "Admin only. Link user account to employee profile.")
    public ResponseEntity<ApiResponse<EmployeeResponse>> createEmployee(
            @Valid @RequestBody EmployeeRequest request) {
        EmployeeResponse response = employeeService.createEmployee(request);
        return ResponseEntity.ok(ApiResponse.success("Employee profile created successfully", response));
    }

    // ── GET /api/employees/{id} ────────────────────────────────────────────
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER') or @employeeService.isSelf(#id, authentication.name)")
    @Operation(summary = "Get Employee Profile", description = "Admin, HR_Manager, or the employee themselves can fetch profile.")
    public ResponseEntity<ApiResponse<EmployeeResponse>> getEmployeeById(
            @PathVariable Long id) {
        EmployeeResponse response = employeeService.getEmployeeById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // ── GET /api/employees/user/{userId} ───────────────────────────────────
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER') or @employeeService.isSelfByUserId(#userId, authentication.name)")
    @Operation(summary = "Get Employee Profile by User ID", description = "Admin, HR_Manager, or the employee themselves can fetch profile by User ID.")
    public ResponseEntity<ApiResponse<EmployeeResponse>> getEmployeeByUserId(
            @PathVariable Long userId) {
        EmployeeResponse response = employeeService.getEmployeeByUserId(userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // ── GET /api/employees ─────────────────────────────────────────────────
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    @Operation(summary = "Get All Employees (Paginated)", description = "Admin or HR_Manager only.")
    public ResponseEntity<ApiResponse<Page<EmployeeResponse>>> getAllEmployees(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name())
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<EmployeeResponse> response = employeeService.getAllEmployees(pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // ── GET /api/employees/summaries ───────────────────────────────────────
    @GetMapping("/summaries")
    @Operation(summary = "Get Employee Summaries", description = "Get list of active employee summaries for dropdown dropdown selections.")
    public ResponseEntity<ApiResponse<List<EmployeeSummary>>> getAllEmployeeSummaries() {
        List<EmployeeSummary> response = employeeService.getAllEmployeeSummaries();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // ── PUT /api/employees/{id} ────────────────────────────────────────────
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    @Operation(summary = "Update Employee Profile", description = "Admin or HR_Manager only.")
    public ResponseEntity<ApiResponse<EmployeeResponse>> updateEmployee(
            @PathVariable Long id,
            @Valid @RequestBody EmployeeRequest request) {
        EmployeeResponse response = employeeService.updateEmployee(id, request);
        return ResponseEntity.ok(ApiResponse.success("Employee profile updated successfully", response));
    }

    // ── DELETE /api/employees/{id} ─────────────────────────────────────────
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete (Deactivate) Employee Profile", description = "Admin only. Soft deletes employee and deactivates linked user account.")
    public ResponseEntity<ApiResponse<Void>> deleteEmployee(
            @PathVariable Long id) {
        employeeService.deleteEmployee(id);
        return ResponseEntity.ok(ApiResponse.success("Employee profile deactivated successfully", null));
    }
}
