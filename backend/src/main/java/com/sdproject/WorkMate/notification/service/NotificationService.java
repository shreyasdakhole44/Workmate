package com.sdproject.WorkMate.notification.service;

import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final EmailService emailService;

    private static final String HEADER = """
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
        """;

    private static final String FOOTER = """
        <div style="padding:16px 32px;border-top:1px solid #E5E7EB;text-align:center">
          <p style="font-size:12px;color:#9CA3AF;margin:0">
            Automated message from WorkMate
          </p>
          <p style="font-size:11px;color:#D1D5DB;margin:6px 0 0">
            © 2026 WorkMate. All rights reserved.
          </p>
        </div>
        """;

    private String wrapEmail(String bodyContent) {
        return """
            <div style="max-width:600px;margin:0 auto;background:#ffffff;
                border-radius:12px;overflow:hidden;font-family:Arial,
                Helvetica,sans-serif">
              %s
              %s
              %s
            </div>
            """.formatted(HEADER, bodyContent, FOOTER);
    }

    private String badge(String label, String bgColor, String textColor) {
        return """
            <div style="display:inline-block;background:%s;color:%s;
                font-size:12px;font-weight:600;padding:4px 12px;
                border-radius:999px;margin-bottom:16px;
                text-transform:uppercase;letter-spacing:0.03em">
              %s
            </div>
            """.formatted(bgColor, textColor, label);
    }

    // ── 1. EMPLOYEE: Leave Approved ──────────────────────────────
    public void notifyLeaveApproved(String employeeEmail, String employeeName,
            String leaveType, String fromDate, String toDate, int days,
            int remainingBalance, int totalBalance) {

        String body = """
            <div style="padding:32px">
              %s
              <h2 style="font-size:20px;font-weight:600;color:#111827;margin:0 0 8px">
                Your leave has been approved
              </h2>
              <p style="font-size:14px;color:#6B7280;margin:0 0 24px;line-height:1.6">
                Hi %s, your time off request has been confirmed by your manager. 
                Enjoy your time off!
              </p>
              <div style="background:#F9FAFB;border-radius:12px;padding:20px;margin-bottom:24px">
                <table style="width:100%%;font-size:13px;border-collapse:collapse">
                  <tr><td style="padding:6px 0;color:#6B7280">Leave type</td>
                      <td style="padding:6px 0;text-align:right;font-weight:600;color:#111827">%s</td></tr>
                  <tr><td style="padding:6px 0;color:#6B7280">Duration</td>
                      <td style="padding:6px 0;text-align:right;font-weight:600;color:#111827">%d day(s)</td></tr>
                  <tr><td style="padding:6px 0;color:#6B7280">From</td>
                      <td style="padding:6px 0;text-align:right;font-weight:600;color:#111827">%s</td></tr>
                  <tr><td style="padding:6px 0;color:#6B7280">To</td>
                      <td style="padding:6px 0;text-align:right;font-weight:600;color:#111827">%s</td></tr>
                  <tr><td style="padding-top:10px;border-top:1px solid #E5E7EB;color:#6B7280">Remaining balance</td>
                      <td style="padding-top:10px;border-top:1px solid #E5E7EB;text-align:right;font-weight:600;color:#059669">%d of %d days</td></tr>
                </table>
              </div>
              <a href="https://workmate-hrms.netlify.app/leave" 
                 style="display:block;text-align:center;background:#E8420A;
                 color:#ffffff;font-size:14px;font-weight:600;padding:12px;
                 border-radius:8px;text-decoration:none">
                View in WorkMate
              </a>
            </div>
            """.formatted(
                badge("Leave Approved", "#D1FAE5", "#065F46"),
                employeeName, leaveType, days, fromDate, toDate,
                remainingBalance, totalBalance);

        emailService.sendEmail(employeeEmail, employeeName,
            "Your leave request has been approved", wrapEmail(body));
    }

    // ── 2. EMPLOYEE: Payslip Generated ───────────────────────────
    public void notifyPayslipGenerated(String employeeEmail, String employeeName,
            String month, int year, BigDecimal basicSalary, 
            BigDecimal grossEarnings, BigDecimal totalDeductions, 
            BigDecimal netPay) {

        String body = """
            <div style="padding:32px">
              %s
              <h2 style="font-size:20px;font-weight:600;color:#111827;margin:0 0 8px">
                Your %s %d payslip is ready
              </h2>
              <p style="font-size:14px;color:#6B7280;margin:0 0 24px;line-height:1.6">
                Hi %s, your salary for %s %d has been processed. Here's a quick summary.
              </p>
              <div style="background:#F9FAFB;border-radius:12px;padding:20px;margin-bottom:16px">
                <table style="width:100%%;font-size:13px;border-collapse:collapse">
                  <tr><td style="padding:6px 0;color:#6B7280">Basic salary</td>
                      <td style="padding:6px 0;text-align:right;color:#111827">₹%,.0f</td></tr>
                  <tr><td style="padding:6px 0;color:#6B7280">Gross earnings</td>
                      <td style="padding:6px 0;text-align:right;color:#111827">₹%,.0f</td></tr>
                  <tr><td style="padding:6px 0;color:#DC2626">Total deductions</td>
                      <td style="padding:6px 0;text-align:right;color:#DC2626">−₹%,.0f</td></tr>
                </table>
              </div>
              <div style="background:#0F766E;border-radius:12px;padding:18px 20px;
                   margin-bottom:24px;display:flex;justify-content:space-between;
                   align-items:center">
                <span style="color:#D1FAE5;font-size:13px">Net pay</span>
                <span style="color:#ffffff;font-size:22px;font-weight:700">₹%,.0f</span>
              </div>
              <a href="https://workmate-hrms.netlify.app/payslip" 
                 style="display:block;text-align:center;background:#E8420A;
                 color:#ffffff;font-size:14px;font-weight:600;padding:12px;
                 border-radius:8px;text-decoration:none">
                Download payslip PDF
              </a>
            </div>
            """.formatted(
                badge("Payslip Ready", "#CCFBF1", "#0F766E"),
                month, year, employeeName, month, year,
                basicSalary, grossEarnings, totalDeductions, netPay);

        emailService.sendEmail(employeeEmail, employeeName,
            "Your " + month + " " + year + " payslip is ready", wrapEmail(body));
    }

    // ── 3. EMPLOYEE: Review Added ────────────────────────────────
    public void notifyReviewAdded(String employeeEmail, String employeeName,
            String reviewPeriod, int score, String scoreLabel, 
            String reviewerName, String aiSummary) {

        String aiSummaryBlock = aiSummary != null ? """
            <div style="background:#F5F3FF;border-radius:10px;padding:14px 16px;
                 margin-bottom:24px;border-left:3px solid #7C3AED">
              <p style="font-size:11px;font-weight:600;color:#6D28D9;
                 margin:0 0 6px;text-transform:uppercase;letter-spacing:0.03em">
                AI-generated summary
              </p>
              <p style="font-size:13px;color:#4C1D95;margin:0;line-height:1.6">%s</p>
            </div>
            """.formatted(aiSummary) : "";

        String body = """
            <div style="padding:32px">
              %s
              <h2 style="font-size:20px;font-weight:600;color:#111827;margin:0 0 8px">
                New performance review: %s
              </h2>
              <p style="font-size:14px;color:#6B7280;margin:0 0 24px;line-height:1.6">
                Hi %s, %s has submitted your performance review for this period.
              </p>
              <div style="background:#F9FAFB;border-radius:12px;padding:20px;
                   margin-bottom:16px;text-align:center">
                <p style="font-size:11px;color:#6B7280;margin:0 0 4px;
                   text-transform:uppercase;letter-spacing:0.03em">Score</p>
                <p style="font-size:32px;font-weight:700;color:#7C3AED;margin:0">
                  %d<span style="font-size:16px;color:#9CA3AF">/10</span>
                </p>
                <p style="font-size:13px;font-weight:600;color:#6D28D9;margin:4px 0 0">
                  %s
                </p>
              </div>
              %s
              <a href="https://workmate-hrms.netlify.app/performance" 
                 style="display:block;text-align:center;background:#E8420A;
                 color:#ffffff;font-size:14px;font-weight:600;padding:12px;
                 border-radius:8px;text-decoration:none">
                View full review
              </a>
            </div>
            """.formatted(
                badge("Review Added", "#EDE9FE", "#5B21B6"),
                reviewPeriod, employeeName, reviewerName,
                score, scoreLabel, aiSummaryBlock);

        emailService.sendEmail(employeeEmail, employeeName,
            "New performance review: " + reviewPeriod, wrapEmail(body));
    }

    // ── 4. HR: New Leave Request ─────────────────────────────────
    public void notifyHrNewLeaveRequest(String hrEmail, String hrName,
            String employeeName, String empCode, String department,
            String leaveType, String fromDate, String toDate, 
            int days, String reason) {

        String body = """
            <div style="padding:32px">
              %s
              <h2 style="font-size:20px;font-weight:600;color:#111827;margin:0 0 8px">
                New leave request awaiting approval
              </h2>
              <p style="font-size:14px;color:#6B7280;margin:0 0 24px;line-height:1.6">
                %s (%s · %s) has requested time off. Review and respond below.
              </p>
              <div style="background:#F9FAFB;border-radius:12px;padding:20px;margin-bottom:24px">
                <table style="width:100%%;font-size:13px;border-collapse:collapse">
                  <tr><td style="padding:6px 0;color:#6B7280">Leave type</td>
                      <td style="padding:6px 0;text-align:right;font-weight:600;color:#111827">%s</td></tr>
                  <tr><td style="padding:6px 0;color:#6B7280">Duration</td>
                      <td style="padding:6px 0;text-align:right;font-weight:600;color:#111827">%d day(s)</td></tr>
                  <tr><td style="padding:6px 0;color:#6B7280">Dates</td>
                      <td style="padding:6px 0;text-align:right;font-weight:600;color:#111827">%s → %s</td></tr>
                  <tr><td style="padding-top:10px;border-top:1px solid #E5E7EB;
                      color:#6B7280;vertical-align:top">Reason</td>
                      <td style="padding-top:10px;border-top:1px solid #E5E7EB;
                      text-align:right;color:#374151;font-style:italic">%s</td></tr>
                </table>
              </div>
              <a href="https://workmate-hrms.netlify.app/leave" 
                 style="display:block;text-align:center;background:#D97706;
                 color:#ffffff;font-size:14px;font-weight:600;padding:12px;
                 border-radius:8px;text-decoration:none">
                Review request
              </a>
            </div>
            """.formatted(
                badge("Action Required", "#FEF3C7", "#92400E"),
                employeeName, empCode, department, leaveType, days,
                fromDate, toDate, reason);

        emailService.sendEmail(hrEmail, hrName,
            "New leave request from " + employeeName, wrapEmail(body));
    }

    // ── 5. HR: Missing Checkout ───────────────────────────────────
    public void notifyHrMissingCheckout(String hrEmail, String hrName,
            String employeeName, String empCode, String date, 
            String checkInTime) {

        String body = """
            <div style="padding:32px">
              %s
              <h2 style="font-size:20px;font-weight:600;color:#111827;margin:0 0 8px">
                Missing checkout detected
              </h2>
              <p style="font-size:14px;color:#6B7280;margin:0 0 24px;line-height:1.6">
                An employee checked in but never checked out. This may need 
                manual correction.
              </p>
              <div style="background:#FEF2F2;border-radius:12px;padding:20px;
                   margin-bottom:24px;border-left:3px solid #DC2626">
                <table style="width:100%%;font-size:13px;border-collapse:collapse">
                  <tr><td style="padding:6px 0;color:#6B7280">Employee</td>
                      <td style="padding:6px 0;text-align:right;font-weight:600;color:#111827">%s (%s)</td></tr>
                  <tr><td style="padding:6px 0;color:#6B7280">Date</td>
                      <td style="padding:6px 0;text-align:right;font-weight:600;color:#111827">%s</td></tr>
                  <tr><td style="padding:6px 0;color:#6B7280">Checked in at</td>
                      <td style="padding:6px 0;text-align:right;font-weight:600;color:#111827">%s</td></tr>
                  <tr><td style="padding:6px 0;color:#6B7280">Checked out at</td>
                      <td style="padding:6px 0;text-align:right;font-weight:600;color:#DC2626">— Not recorded</td></tr>
                </table>
              </div>
              <a href="https://workmate-hrms.netlify.app/attendance" 
                 style="display:block;text-align:center;background:#DC2626;
                 color:#ffffff;font-size:14px;font-weight:600;padding:12px;
                 border-radius:8px;text-decoration:none">
                Correct attendance log
              </a>
            </div>
            """.formatted(
                badge("Needs Review", "#FEE2E2", "#991B1B"),
                employeeName, empCode, date, checkInTime);

        emailService.sendEmail(hrEmail, hrName,
            "Missing checkout: " + employeeName, wrapEmail(body));
    }

    // ── 6. HR: New Candidate Applied ─────────────────────────────
    public void notifyHrNewCandidate(String hrEmail, String hrName,
            String candidateName, String candidateEmail, String jobTitle,
            String department, int experienceYears, String resumeUrl) {

        String body = """
            <div style="padding:32px">
              %s
              <h2 style="font-size:20px;font-weight:600;color:#111827;margin:0 0 8px">
                New candidate applied
              </h2>
              <p style="font-size:14px;color:#6B7280;margin:0 0 24px;line-height:1.6">
                A new candidate has applied for an open position in your 
                recruitment pipeline.
              </p>
              <div style="background:#F9FAFB;border-radius:12px;padding:20px;margin-bottom:24px">
                <table style="width:100%%;font-size:13px;border-collapse:collapse">
                  <tr><td style="padding:6px 0;color:#6B7280">Candidate</td>
                      <td style="padding:6px 0;text-align:right;font-weight:600;color:#111827">%s</td></tr>
                  <tr><td style="padding:6px 0;color:#6B7280">Email</td>
                      <td style="padding:6px 0;text-align:right;color:#2563EB">%s</td></tr>
                  <tr><td style="padding:6px 0;color:#6B7280">Position</td>
                      <td style="padding:6px 0;text-align:right;font-weight:600;color:#111827">%s</td></tr>
                  <tr><td style="padding:6px 0;color:#6B7280">Department</td>
                      <td style="padding:6px 0;text-align:right;font-weight:600;color:#111827">%s</td></tr>
                  <tr><td style="padding:6px 0;color:#6B7280">Experience</td>
                      <td style="padding:6px 0;text-align:right;font-weight:600;color:#111827">%d years</td></tr>
                </table>
              </div>
              <a href="https://workmate-hrms.netlify.app/recruitment" 
                 style="display:block;text-align:center;background:#2563EB;
                 color:#ffffff;font-size:14px;font-weight:600;padding:12px;
                 border-radius:8px;text-decoration:none">
                Review candidate profile
              </a>
            </div>
            """.formatted(
                badge("New Application", "#DBEAFE", "#1E40AF"),
                candidateName, candidateEmail, jobTitle, department, 
                experienceYears);

        emailService.sendEmail(hrEmail, hrName,
            "New candidate: " + candidateName + " — " + jobTitle, wrapEmail(body));
    }
}
