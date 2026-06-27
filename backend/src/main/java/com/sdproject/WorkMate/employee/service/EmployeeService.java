package com.sdproject.WorkMate.employee.service;

import com.sdproject.WorkMate.auth.entity.User;
import com.sdproject.WorkMate.auth.repository.UserRepository;
import com.sdproject.WorkMate.common.exception.ResourceNotFoundException;
import com.sdproject.WorkMate.common.exception.WorkmateException;
import com.sdproject.WorkMate.employee.dto.EmployeeRequest;
import com.sdproject.WorkMate.employee.dto.EmployeeResponse;
import com.sdproject.WorkMate.employee.dto.EmployeeSummary;
import com.sdproject.WorkMate.employee.entity.Employee;
import com.sdproject.WorkMate.employee.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;

    // ── CREATE ─────────────────────────────────────────────────────────────

    public EmployeeResponse createEmployee(EmployeeRequest request) {

        // 0. Enforce userId presence on creation
        if (request.getUserId() == null) {
            throw new WorkmateException("User ID is required to create employee profile");
        }

        // 1. Check linked user exists
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getUserId()));

        // 2. Check user not already linked to another employee
        if (employeeRepository.findByUserId(request.getUserId()).isPresent()) {
            throw new WorkmateException("User is already linked to an employee profile");
        }

        // 3. Resolve manager if provided
        Employee manager = null;
        if (request.getManagerId() != null) {
            manager = employeeRepository.findById(request.getManagerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Manager", "id", request.getManagerId()));
        }

        // 4. Generate sequential employee code (e.g. WM-001)
        long count = employeeRepository.count();
        String empCode = String.format("WM-%03d", count + 1);
        int suffix = 1;
        while (employeeRepository.existsByEmpCode(empCode)) {
            empCode = String.format("WM-%03d", count + 1 + suffix);
            suffix++;
        }

        // 5. Create employee entity
        Employee employee = Employee.builder()
                .empCode(empCode)
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .department(request.getDepartment())
                .designation(request.getDesignation())
                .phone(request.getPhone())
                .address(request.getAddress())
                .joinDate(request.getJoinDate())
                .salary(request.getSalary())
                .profilePicUrl(request.getProfilePicUrl())
                .user(user)
                .manager(manager)
                .isActive(true)
                .build();

        if (request.getRole() != null && !request.getRole().trim().isEmpty()) {
            try {
                com.sdproject.WorkMate.auth.entity.Role roleEnum = com.sdproject.WorkMate.auth.entity.Role.valueOf(request.getRole().toUpperCase());
                user.setRole(roleEnum);
                userRepository.save(user);
            } catch (IllegalArgumentException e) {
                throw new WorkmateException("Invalid role value: " + request.getRole());
            }
        }

        Employee savedEmployee = employeeRepository.save(employee);
        return mapToResponse(savedEmployee);
    }

    // ── GET BY ID ──────────────────────────────────────────────────────────

    public EmployeeResponse getEmployeeById(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", id));
        return mapToResponse(employee);
    }

    // ── GET ALL (PAGINATED) ─────────────────────────────────────────────────

    public Page<EmployeeResponse> getAllEmployees(Pageable pageable) {
        return employeeRepository.findAll(pageable)
                .map(this::mapToResponse);
    }

    // ── GET ALL SUMMARIES ───────────────────────────────────────────────────

    public List<EmployeeSummary> getAllEmployeeSummaries() {
        return employeeRepository.findAll().stream()
                .filter(Employee::getIsActive)
                .map(this::mapToSummary)
                .collect(Collectors.toList());
    }

    // ── UPDATE ─────────────────────────────────────────────────────────────

    public EmployeeResponse updateEmployee(Long id, EmployeeRequest request) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", id));

        // Resolve manager if provided
        Employee manager = null;
        if (request.getManagerId() != null) {
            if (request.getManagerId().equals(id)) {
                throw new WorkmateException("An employee cannot report to themselves");
            }
            manager = employeeRepository.findById(request.getManagerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Manager", "id", request.getManagerId()));
        }

        employee.setFirstName(request.getFirstName());
        employee.setLastName(request.getLastName());
        employee.setDepartment(request.getDepartment());
        employee.setDesignation(request.getDesignation());
        employee.setPhone(request.getPhone());
        employee.setAddress(request.getAddress());
        employee.setJoinDate(request.getJoinDate());
        employee.setSalary(request.getSalary());
        employee.setProfilePicUrl(request.getProfilePicUrl());
        employee.setManager(manager);

        // Update linked user role if provided
        if (employee.getUser() != null && request.getRole() != null && !request.getRole().trim().isEmpty()) {
            try {
                com.sdproject.WorkMate.auth.entity.Role roleEnum = com.sdproject.WorkMate.auth.entity.Role.valueOf(request.getRole().toUpperCase());
                employee.getUser().setRole(roleEnum);
                userRepository.save(employee.getUser());
            } catch (IllegalArgumentException e) {
                throw new WorkmateException("Invalid role value: " + request.getRole());
            }
        }

        Employee updatedEmployee = employeeRepository.save(employee);
        return mapToResponse(updatedEmployee);
    }

    // ── DELETE (SOFT-DELETE DEACTIVATION) ───────────────────────────────────

    public void deleteEmployee(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", id));

        // Soft delete Employee
        employee.setIsActive(false);
        employeeRepository.save(employee);

        // Deactivate linked User account
        if (employee.getUser() != null) {
            User user = employee.getUser();
            user.setIsActive(false);
            userRepository.save(user);
        }
    }

    // ── HELPER CHECKS ──────────────────────────────────────────────────────

    public boolean isSelf(Long employeeId, String email) {
        Employee employee = employeeRepository.findById(employeeId).orElse(null);
        return employee != null && employee.getUser() != null && employee.getUser().getEmail().equals(email);
    }

    public boolean isSelfByUserId(Long userId, String email) {
        User user = userRepository.findByEmail(email).orElse(null);
        return user != null && user.getId().equals(userId);
    }

    public EmployeeResponse getEmployeeByUserId(Long userId) {
        Employee employee = employeeRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "userId", userId));
        return mapToResponse(employee);
    }

    // ── MAPPING HELPERS ────────────────────────────────────────────────────

    private EmployeeResponse mapToResponse(Employee employee) {
        EmployeeResponse.EmployeeResponseBuilder builder = EmployeeResponse.builder()
                .id(employee.getId())
                .empCode(employee.getEmpCode())
                .firstName(employee.getFirstName())
                .lastName(employee.getLastName())
                .fullName(employee.getFullName())
                .department(employee.getDepartment())
                .designation(employee.getDesignation())
                .phone(employee.getPhone())
                .address(employee.getAddress())
                .joinDate(employee.getJoinDate())
                .salary(employee.getSalary())
                .profilePicUrl(employee.getProfilePicUrl())
                .isActive(employee.getIsActive())
                .createdAt(employee.getCreatedAt());

        if (employee.getUser() != null) {
            builder.userId(employee.getUser().getId())
                   .email(employee.getUser().getEmail())
                   .role(employee.getUser().getRole());
        }

        if (employee.getManager() != null) {
            builder.managerId(employee.getManager().getId())
                   .managerName(employee.getManager().getFullName());
        }

        return builder.build();
    }

    private EmployeeSummary mapToSummary(Employee employee) {
        return EmployeeSummary.builder()
                .id(employee.getId())
                .empCode(employee.getEmpCode())
                .fullName(employee.getFullName())
                .department(employee.getDepartment())
                .designation(employee.getDesignation())
                .profilePicUrl(employee.getProfilePicUrl())
                .build();
    }
}
