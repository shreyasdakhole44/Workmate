package com.sdproject.WorkMate.payroll.controller;

import com.sdproject.WorkMate.auth.entity.User;
import com.sdproject.WorkMate.auth.repository.UserRepository;
import com.sdproject.WorkMate.common.dto.ApiResponse;
import com.sdproject.WorkMate.common.exception.WorkmateException;
import com.sdproject.WorkMate.employee.entity.Employee;
import com.sdproject.WorkMate.employee.repository.EmployeeRepository;
import com.sdproject.WorkMate.payroll.dto.SalaryStructureRequest;
import com.sdproject.WorkMate.payroll.dto.PromotionRequest;
import com.sdproject.WorkMate.payroll.entity.*;
import com.sdproject.WorkMate.payroll.service.PayrollService;
import com.sdproject.WorkMate.payroll.util.PayslipPDFGenerator;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payroll")
@RequiredArgsConstructor
@Tag(name = "Payroll Management", description = "Endpoints for salary structures, monthly payslips, and promotions history")
public class PayrollController {

    private final PayrollService payrollService;
    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final PayslipPDFGenerator payslipPDFGenerator;

    // ── SALARY STRUCTURES ─────────────────────────────────────────

    @PostMapping("/salary-structure/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    @Operation(summary = "Save Salary Structure", description = "Admin or HR Manager only. Defines salary configuration for an employee.")
    public ResponseEntity<ApiResponse<SalaryStructure>> saveSalaryStructure(
            @PathVariable Long employeeId,
            @Valid @RequestBody SalaryStructureRequest req) {
        
        SalaryStructure response = payrollService.saveSalaryStructure(
                employeeId, req.getBasicSalary(), req.getHra(),
                req.getMedicalAllowance(), req.getOtherAllowances(),
                req.getSpecialAllowance(), req.getConveyanceAllowance(),
                req.getPerformanceBonus(), req.getProvidentFund(),
                req.getProfessionalTax(), req.getIncomeTax(), req.getEsi());
        return ResponseEntity.ok(ApiResponse.success("Salary structure saved successfully.", response));
    }

    @GetMapping("/salary-structure/{employeeId}")
    @Operation(summary = "Get Salary Structure", description = "Fetches compensation structure for an employee.")
    public ResponseEntity<ApiResponse<SalaryStructure>> getSalaryStructure(
            Authentication authentication,
            @PathVariable Long employeeId) {
        
        // Optional safety check: Employees can only view their own structure
        if (hasRole(authentication, "ROLE_EMPLOYEE")) {
            Long empId = getCurrentEmployeeId(authentication);
            if (!empId.equals(employeeId)) {
                throw new WorkmateException("Access denied. You can only view your own salary structure.");
            }
        }

        SalaryStructure response = payrollService.getSalaryStructure(employeeId)
                .orElseThrow(() -> new WorkmateException("Salary structure not defined for employee ID: " + employeeId));
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // ── PAYSLIPS ──────────────────────────────────────────────────

    @PostMapping("/payslips/generate")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    @Operation(summary = "Generate Monthly Payslip", description = "Admin or HR Manager only. Generates payslip entry for employee.")
    public ResponseEntity<ApiResponse<Payslip>> generatePayslip(
            @RequestParam Long employeeId,
            @RequestParam Integer year,
            @RequestParam Integer month) {
        
        Payslip response = payrollService.generatePayslip(employeeId, year, month);
        return ResponseEntity.ok(ApiResponse.success("Payslip generated successfully.", response));
    }

    @GetMapping("/payslips/my-payslips")
    @Operation(summary = "Get My Payslips", description = "Retrieve list of all generated payslips for current logged-in employee.")
    public ResponseEntity<ApiResponse<List<Payslip>>> getMyPayslips(Authentication authentication) {
        Long empId = getCurrentEmployeeId(authentication);
        List<Payslip> response = payrollService.getEmployeePayslips(empId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/payslips/{employeeId}/history")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    @Operation(summary = "Get Employee Payslips History", description = "Admin or HR Manager only. Retrieve payslips for a specific employee.")
    public ResponseEntity<ApiResponse<List<Payslip>>> getEmployeePayslips(
            @PathVariable Long employeeId) {
        List<Payslip> response = payrollService.getEmployeePayslips(employeeId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/payslips")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    @Operation(summary = "Get All Payslips", description = "Admin or HR Manager only. Retrieve all generated payslips.")
    public ResponseEntity<ApiResponse<List<Payslip>>> getAllPayslips() {
        List<Payslip> response = payrollService.getAllPayslips();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/payslips/{id}/download")
    @Operation(summary = "Download Payslip PDF", description = "Generates and streams iText PDF binary download of the salary slip.")
    public ResponseEntity<byte[]> downloadPayslip(
            Authentication authentication,
            @PathVariable Long id) {
        
        Payslip payslip = payrollService.getPayslip(id);

        // Security check: Employees can only download their own payslips
        if (hasRole(authentication, "ROLE_EMPLOYEE")) {
            Long empId = getCurrentEmployeeId(authentication);
            if (!payslip.getEmployee().getId().equals(empId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null);
            }
        }

        byte[] pdfBytes = payslipPDFGenerator.generatePayslip(payslip, payslip.getEmployee());

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDisposition(ContentDisposition.attachment()
                .filename("payslip-" + payslip.getYear() + "-" + payslip.getMonth() + ".pdf")
                .build());
        headers.setContentLength(pdfBytes.length);

        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }

    // ── PROMOTIONS ─────────────────────────────────────────────────

    @PostMapping("/promotions/{employeeId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Promote Employee", description = "Admin only. Record role, designation adjustments, and update salary structure.")
    public ResponseEntity<ApiResponse<PromotionHistory>> promoteEmployee(
            @PathVariable Long employeeId,
            @Valid @RequestBody PromotionRequest req) {
        
        PromotionHistory response = payrollService.promoteEmployee(
                employeeId, req.getNewRole(), req.getNewDesignation(), req.getNewSalary(), req.getNotes());
        return ResponseEntity.ok(ApiResponse.success("Employee promoted successfully.", response));
    }

    @GetMapping("/promotions/{employeeId}/history")
    @Operation(summary = "Get Employee Promotion History", description = "Fetches promotion timeline history for an employee.")
    public ResponseEntity<ApiResponse<List<PromotionHistory>>> getPromotionHistory(
            Authentication authentication,
            @PathVariable Long employeeId) {
        
        // Security check: Employees can only view their own promotion logs
        if (hasRole(authentication, "ROLE_EMPLOYEE")) {
            Long empId = getCurrentEmployeeId(authentication);
            if (!empId.equals(employeeId)) {
                throw new WorkmateException("Access denied. You can only view your own promotion history.");
            }
        }

        List<PromotionHistory> response = payrollService.getEmployeePromotionHistory(employeeId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/promotions/history")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    @Operation(summary = "Get All Employees Promotion History", description = "Admin or HR Manager only. Fetches all career timeline history.")
    public ResponseEntity<ApiResponse<List<PromotionHistory>>> getAllPromotionHistory() {
        List<PromotionHistory> response = payrollService.getAllPromotionHistory();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // ── HELPERS ───────────────────────────────────────────────────

    private Long getCurrentEmployeeId(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new WorkmateException("User account not found"));
        Employee employee = employeeRepository.findByUserId(user.getId())
                .orElseThrow(() -> new WorkmateException("Employee profile not linked to this user account"));
        return employee.getId();
    }

    private boolean hasRole(Authentication authentication, String roleName) {
        return authentication.getAuthorities().stream()
                .anyMatch(grantedAuthority -> grantedAuthority.getAuthority().equals(roleName));
    }
}
