package com.sdproject.WorkMate.notification.controller;

import com.sdproject.WorkMate.notification.service.EmailService;
import com.sdproject.WorkMate.notification.scheduler.MissingCheckoutScheduler;
import com.sdproject.WorkMate.auth.repository.UserRepository;
import com.sdproject.WorkMate.employee.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/test/notifications")
@RequiredArgsConstructor
public class NotificationTestController {

    private final EmailService emailService;
    private final MissingCheckoutScheduler missingCheckoutScheduler;
    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;

    @GetMapping("/send-direct")
    public ResponseEntity<String> sendDirectTestEmail(
            @RequestParam String to,
            @RequestParam(required = false, defaultValue = "Tester") String name) {
        
        String htmlBody = """
            <div style="background:#0B3D2E;padding:20px;text-align:center">
              <span style="color:white;font-size:18px;font-weight:700">
                Work<span style="color:#E8420A">Mate</span> Test
              </span>
            </div>
            <div style="padding:24px;font-family:Arial,sans-serif">
              <h2>Direct Test Email</h2>
              <p>Hi %s,</p>
              <p>This is a test email proving that the Brevo HTTPS API integration is configured and functioning correctly!</p>
            </div>
            <div style="padding:16px;text-align:center;color:#9CA3AF;
                 font-size:12px;border-top:1px solid #E5E7EB">
              This is a test message from WorkMate HRMS
            </div>
            """.formatted(name);

        boolean success = emailService.sendEmail(to, name, "WorkMate HTTPS API Test Email", htmlBody);
        
        if (success) {
            return ResponseEntity.ok("Test email successfully sent to: " + to);
        } else {
            return ResponseEntity.status(500).body("Failed to send test email to: " + to + ". Check application logs.");
        }
    }

    @PostMapping("/trigger-missing-checkouts")
    public ResponseEntity<String> triggerMissingCheckouts() {
        try {
            missingCheckoutScheduler.checkMissingCheckouts();
            return ResponseEntity.ok("Successfully executed missing checkout check job.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error executing missing checkout check: " + e.getMessage());
        }
    }

    @PostMapping("/submit-lead")
    public ResponseEntity<String> submitTrialLead(@RequestBody java.util.Map<String, String> request) {
        String email = request.get("email");
        String phone = request.get("phone");
        String size = request.get("size");

        String htmlBody = """
            <div style="max-width:600px;margin:0 auto;background:#ffffff;
                border-radius:12px;overflow:hidden;font-family:Arial,
                Helvetica,sans-serif;border:1px solid #E5E7EB">
              
              <!-- Branded Header -->
              <div style="background:#0B3D2E;padding:28px 32px;text-align:center">
                <table style="margin:0 auto" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="background:#E8420A;width:32px;height:32px;
                        border-radius:8px;text-align:center;vertical-align:middle">
                      <span style="color:#ffffff;font-weight:bold;font-size:15px">W</span>
                    </td>
                    <td style="padding-left:10px">
                      <span style="color:#ffffff;font-size:17px;font-weight:600">
                        Work<span style="color:#E8420A">Mate</span>
                      </span>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Main Body -->
              <div style="padding:32px">
                
                <!-- Status Badge -->
                <div style="display:inline-block;background:#FFEFEA;color:#E8420A;
                    font-size:12px;font-weight:600;padding:4px 12px;
                    border-radius:999px;margin-bottom:16px;
                    text-transform:uppercase;letter-spacing:0.03em">
                  New Free Trial Signup
                </div>

                <h2 style="font-size:20px;font-weight:700;color:#111827;margin:0 0 8px;line-height:1.3">
                  Lead Captured!
                </h2>
                <p style="font-size:14px;color:#4B5563;margin:0 0 24px;line-height:1.6">
                  A prospective customer has filled in the free trial registration form on the WorkMate landing page. Here are their details:
                </p>

                <!-- Details Card Table -->
                <div style="background:#F9FAFB;border-radius:12px;padding:20px;
                    border:1px solid #F3F4F6;margin-bottom:8px">
                  <table style="width:100%%;font-size:13px;border-collapse:collapse">
                    <tr>
                      <td style="padding:10px 0;color:#6B7280;border-bottom:1px solid #F3F4F6">Work Email</td>
                      <td style="padding:10px 0;text-align:right;font-weight:600;color:#111827;border-bottom:1px solid #F3F4F6;font-family:monospace">%s</td>
                    </tr>
                    <tr>
                      <td style="padding:10px 0;color:#6B7280;border-bottom:1px solid #F3F4F6">Mobile Number</td>
                      <td style="padding:10px 0;text-align:right;font-weight:600;color:#111827;border-bottom:1px solid #F3F4F6">+91 %s</td>
                    </tr>
                    <tr>
                      <td style="padding:10px 0;color:#6B7280">No. of Employees</td>
                      <td style="padding:10px 0;text-align:right;font-weight:600;color:#111827">%s</td>
                    </tr>
                  </table>
                </div>
              </div>

              <!-- Branded Footer -->
              <div style="padding:20px 32px;border-top:1px solid #E5E7EB;
                  text-align:center;background:#F9FAFB">
                <p style="font-size:12px;color:#9CA3AF;margin:0">
                  Automated notification from WorkMate Lead Capture
                </p>
                <p style="font-size:11px;color:#D1D5DB;margin:6px 0 0">
                  © 2026 WorkMate. All rights reserved.
                </p>
              </div>
            </div>
            """.formatted(email, phone, size);

        boolean success = emailService.sendEmail("sdakhole4@gmail.com", "WorkMate Admin", "New WorkMate Trial Lead: " + email, htmlBody);

        if (success) {
            return ResponseEntity.ok("Lead submitted successfully");
        } else {
            return ResponseEntity.status(500).body("Failed to send lead email");
        }
    }

    @GetMapping("/db-diagnostics")
    public ResponseEntity<Map<String, Object>> dbDiagnostics() {
        Map<String, Object> response = new HashMap<>();
        try {
            List<Map<String, Object>> usersList = userRepository.findAll().stream().map(u -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", u.getId());
                map.put("email", u.getEmail());
                map.put("role", u.getRole() != null ? u.getRole().name() : null);
                map.put("isActive", u.getIsActive());
                return map;
            }).collect(Collectors.toList());

            List<Map<String, Object>> employeesList = employeeRepository.findAll().stream().map(e -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", e.getId());
                map.put("fullName", e.getFullName());
                map.put("empCode", e.getEmpCode());
                map.put("userId", e.getUser() != null ? e.getUser().getId() : null);
                map.put("isActive", e.getIsActive());
                return map;
            }).collect(Collectors.toList());

            response.put("success", true);
            response.put("users", usersList);
            response.put("employees", employeesList);
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/db-cleanup")
    public ResponseEntity<String> dbCleanup() {
        try {
            if (employeeRepository.existsById(6L)) {
                employeeRepository.deleteById(6L);
            }
            if (userRepository.existsById(6L)) {
                userRepository.deleteById(6L);
            }
            return ResponseEntity.ok("Cleanup completed successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Cleanup failed: " + e.getMessage());
        }
    }
}
