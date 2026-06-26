package com.sdproject.WorkMate.notification;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.mockito.AdditionalMatchers.and;

import com.sdproject.WorkMate.attendance.entity.AttendanceLog;
import com.sdproject.WorkMate.attendance.repository.AttendanceRepository;
import com.sdproject.WorkMate.auth.entity.Role;
import com.sdproject.WorkMate.auth.entity.User;
import com.sdproject.WorkMate.auth.repository.UserRepository;
import com.sdproject.WorkMate.employee.entity.Employee;
import com.sdproject.WorkMate.employee.repository.EmployeeRepository;
import com.sdproject.WorkMate.leave.dto.LeaveApplyRequest;
import com.sdproject.WorkMate.leave.entity.LeaveBalance;
import com.sdproject.WorkMate.leave.entity.LeaveRequest;
import com.sdproject.WorkMate.leave.entity.LeaveType;
import com.sdproject.WorkMate.leave.enums.LeaveStatus;
import com.sdproject.WorkMate.leave.repository.LeaveBalanceRepository;
import com.sdproject.WorkMate.leave.repository.LeaveRepository;
import com.sdproject.WorkMate.leave.repository.LeaveTypeRepository;
import com.sdproject.WorkMate.leave.service.LeaveService;
import com.sdproject.WorkMate.employee.service.EmployeeService;
import com.sdproject.WorkMate.notification.scheduler.MissingCheckoutScheduler;
import com.sdproject.WorkMate.notification.service.EmailService;
import com.sdproject.WorkMate.notification.service.NotificationService;
import com.sdproject.WorkMate.payroll.entity.Payslip;
import com.sdproject.WorkMate.payroll.entity.SalaryStructure;
import com.sdproject.WorkMate.payroll.repository.PayslipRepository;
import com.sdproject.WorkMate.payroll.repository.SalaryStructureRepository;
import com.sdproject.WorkMate.payroll.service.PayrollService;
import com.sdproject.WorkMate.performance.dto.ReviewRequest;
import com.sdproject.WorkMate.performance.entity.PerformanceReview;
import com.sdproject.WorkMate.performance.repository.PerformanceRepository;
import com.sdproject.WorkMate.performance.service.AiReviewService;
import com.sdproject.WorkMate.performance.service.PerformanceService;
import com.sdproject.WorkMate.recruitment.dto.CandidateRequest;
import com.sdproject.WorkMate.recruitment.entity.Candidate;
import com.sdproject.WorkMate.recruitment.entity.JobPosting;
import com.sdproject.WorkMate.recruitment.repository.CandidateRepository;
import com.sdproject.WorkMate.recruitment.repository.JobPostingRepository;
import com.sdproject.WorkMate.recruitment.service.RecruitmentService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpEntity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

class NotificationSystemTest {

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private EmailService emailService;

    @Mock
    private EmailService mockEmailService;

    private NotificationService notificationService;

    // Repos & Services for triggers testing
    @Mock private LeaveRepository leaveRepository;
    @Mock private LeaveBalanceRepository leaveBalanceRepository;
    @Mock private LeaveTypeRepository leaveTypeRepository;
    @Mock private EmployeeRepository employeeRepository;
    @Mock private AttendanceRepository attendanceRepository;
    @Mock private UserRepository userRepository;
    @Mock private PayslipRepository payslipRepository;
    @Mock private SalaryStructureRepository salaryStructureRepository;
    @Mock private PerformanceRepository performanceRepository;
    @Mock private AiReviewService aiReviewService;
    @Mock private JobPostingRepository jobPostingRepository;
    @Mock private CandidateRepository candidateRepository;

    private LeaveService leaveService;
    private PayrollService payrollService;
    private PerformanceService performanceService;
    private RecruitmentService recruitmentService;
    private MissingCheckoutScheduler missingCheckoutScheduler;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        
        // Setup EmailService values
        ReflectionTestUtils.setField(emailService, "apiKey", "test-key");
        ReflectionTestUtils.setField(emailService, "senderEmail", "sender@test.com");
        ReflectionTestUtils.setField(emailService, "senderName", "Sender");

        // Construct NotificationService with mocked EmailService
        notificationService = spy(new NotificationService(mockEmailService));

        // Construct Services
        leaveService = new LeaveService(
            leaveRepository, leaveBalanceRepository, leaveTypeRepository,
            employeeRepository, attendanceRepository, userRepository, notificationService
        );

        payrollService = new PayrollService(
            salaryStructureRepository, payslipRepository, null,
            employeeRepository, userRepository, notificationService
        );

        performanceService = new PerformanceService(
            performanceRepository, employeeRepository, aiReviewService, notificationService
        );

        recruitmentService = new RecruitmentService(
            jobPostingRepository, candidateRepository, null,
            employeeRepository, userRepository, notificationService
        );

        missingCheckoutScheduler = new MissingCheckoutScheduler(
            attendanceRepository, userRepository, notificationService
        );
    }

    // ── EMAIL SERVICE TESTS ───────────────────────────────────────────────

    @Test
    void testEmailServiceSendSuccess() {
        ResponseEntity<String> successResponse = ResponseEntity.ok("Success");
        when(restTemplate.postForEntity(anyString(), any(HttpEntity.class), eq(String.class)))
                .thenReturn(successResponse);

        boolean result = emailService.sendEmail("to@test.com", "Recipient", "Subject", "<p>Body</p>");
        assertTrue(result);
    }

    @Test
    void testEmailServiceSendFailureDoesNotThrow() {
        when(restTemplate.postForEntity(anyString(), any(HttpEntity.class), eq(String.class)))
                .thenThrow(new RuntimeException("API Connection Refused"));

        boolean result = emailService.sendEmail("to@test.com", "Recipient", "Subject", "<p>Body</p>");
        assertFalse(result); // returns false instead of throwing
    }

    // ── NOTIFICATION TEMPLATES TESTS ─────────────────────────────────────

    @Test
    void testNotifyLeaveApproved() {
        notificationService.notifyLeaveApproved("emp@test.com", "John", "Annual", "2026-06-01", "2026-06-05", 5, 10, 15);
        verify(mockEmailService).sendEmail(
            eq("emp@test.com"), eq("John"),
            eq("Your leave request has been approved"),
            contains("Annual")
        );
    }

    @Test
    void testNotifyPayslipGenerated() {
        notificationService.notifyPayslipGenerated("emp@test.com", "John", "JUNE", 2026, BigDecimal.valueOf(40000.00), BigDecimal.valueOf(50000.00), BigDecimal.valueOf(10000.00), BigDecimal.valueOf(40000.00));
        verify(mockEmailService).sendEmail(
            eq("emp@test.com"), eq("John"),
            eq("Your JUNE 2026 payslip is ready"),
            contains("₹40,000")
        );
    }

    @Test
    void testNotifyReviewAdded() {
        notificationService.notifyReviewAdded("emp@test.com", "John", "Annual 2026", 9, "Excellent", "Reviewer Name", "AI Summary text");
        verify(mockEmailService).sendEmail(
            eq("emp@test.com"), eq("John"),
            eq("New performance review: Annual 2026"),
            and(contains("9"), contains("Excellent"))
        );
    }

    @Test
    void testNotifyHrNewLeaveRequest() {
        notificationService.notifyHrNewLeaveRequest("hr@test.com", "HR Team", "John", "WM-001", "IT", "Sick", "2026-06-01", "2026-06-02", 2, "Reason text");
        verify(mockEmailService).sendEmail(
            eq("hr@test.com"), eq("HR Team"),
            eq("New leave request from John"),
            contains("Sick")
        );
    }

    @Test
    void testNotifyHrMissingCheckout() {
        notificationService.notifyHrMissingCheckout("hr@test.com", "HR Team", "John", "WM-001", "2026-06-24", "09:00");
        verify(mockEmailService).sendEmail(
            eq("hr@test.com"), eq("HR Team"),
            eq("Missing checkout: John"),
            contains("09:00")
        );
    }

    @Test
    void testNotifyHrNewCandidate() {
        notificationService.notifyHrNewCandidate("hr@test.com", "HR Team", "Alice Smith", "alice@test.com", "Java Developer", "IT", 5, "http://resume");
        verify(mockEmailService).sendEmail(
            eq("hr@test.com"), eq("HR Team"),
            eq("New candidate: Alice Smith — Java Developer"),
            contains("Java Developer")
        );
    }

    // ── TRIGGERS INTEGRATION TESTS ───────────────────────────────────────

    @Test
    void testApplyLeaveTrigger() {
        User hrUser = User.builder().email("hr@test.com").role(Role.HR_MANAGER).build();
        Employee emp = Employee.builder().id(1L).firstName("John").lastName("Doe").empCode("WM-001")
                .department("IT").user(User.builder().email("emp@test.com").build()).build();
        LeaveType leaveType = LeaveType.builder().id(1L).name("Sick").isActive(true).maxDaysPerYear(10).build();
        LeaveBalance balance = LeaveBalance.builder().employee(emp).leaveType(leaveType).year(2026).totalDays(10).usedDays(0).remainingDays(10).build();

        when(employeeRepository.findById(1L)).thenReturn(Optional.of(emp));
        when(leaveTypeRepository.findById(1L)).thenReturn(Optional.of(leaveType));
        when(leaveBalanceRepository.findByEmployeeIdAndLeaveTypeIdAndYear(1L, 1L, 2026)).thenReturn(Optional.of(balance));
        when(userRepository.findByRoleIn(anyList())).thenReturn(List.of(hrUser));
        when(leaveRepository.save(any(LeaveRequest.class))).thenAnswer(invocation -> invocation.getArgument(0));

        LeaveApplyRequest request = new LeaveApplyRequest();
        request.setLeaveTypeId(1L);
        request.setFromDate(LocalDate.of(2026, 6, 1));
        request.setToDate(LocalDate.of(2026, 6, 2));
        request.setReason("Rest");

        leaveService.applyLeave(1L, request);

        verify(notificationService).notifyHrNewLeaveRequest(
            eq("hr@test.com"), eq("HR Team"), eq("John Doe"), eq("WM-001"), eq("IT"), eq("Sick"),
            anyString(), anyString(), eq(2), eq("Rest")
        );
    }

    @Test
    void testApproveLeaveTrigger() {
        Employee emp = Employee.builder().id(1L).firstName("John").lastName("Doe")
                .user(User.builder().email("emp@test.com").build()).build();
        LeaveType leaveType = LeaveType.builder().id(1L).name("Sick").build();
        LeaveRequest leaveRequest = LeaveRequest.builder()
                .id(10L).employee(emp).leaveType(leaveType)
                .fromDate(LocalDate.of(2026, 6, 1)).toDate(LocalDate.of(2026, 6, 2))
                .totalDays(2).status(LeaveStatus.PENDING).build();
        LeaveBalance balance = LeaveBalance.builder().employee(emp).leaveType(leaveType).year(2026).totalDays(10).usedDays(2).remainingDays(8).build();

        when(leaveRepository.findById(10L)).thenReturn(Optional.of(leaveRequest));
        when(leaveRepository.save(any(LeaveRequest.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(leaveBalanceRepository.findByEmployeeIdAndLeaveTypeIdAndYear(1L, 1L, 2026)).thenReturn(Optional.of(balance));

        leaveService.approveOrRejectLeave(10L, LeaveStatus.APPROVED, 2L, null);

        verify(notificationService).notifyLeaveApproved(
            eq("emp@test.com"), eq("John Doe"), eq("Sick"),
            eq("2026-06-01"), eq("2026-06-02"), eq(2), eq(8), eq(10)
        );
    }

    @Test
    void testGeneratePayslipTrigger() {
        Employee emp = Employee.builder().id(1L).firstName("John").lastName("Doe")
                .user(User.builder().email("emp@test.com").build()).build();
        SalaryStructure struct = SalaryStructure.builder().employee(emp)
                .basicSalary(BigDecimal.valueOf(10000)).hra(BigDecimal.valueOf(5000))
                .medicalAllowance(BigDecimal.valueOf(1000)).otherAllowances(BigDecimal.valueOf(1000))
                .providentFund(BigDecimal.valueOf(1200)).professionalTax(BigDecimal.valueOf(200))
                .build();

        when(employeeRepository.findById(1L)).thenReturn(Optional.of(emp));
        when(salaryStructureRepository.findByEmployeeId(1L)).thenReturn(Optional.of(struct));
        when(payslipRepository.save(any(Payslip.class))).thenAnswer(invocation -> invocation.getArgument(0));

        payrollService.generatePayslip(1L, 2026, 6);

        verify(notificationService).notifyPayslipGenerated(
            eq("emp@test.com"), eq("John Doe"), eq("JUNE"), eq(2026),
            any(BigDecimal.class), any(BigDecimal.class), any(BigDecimal.class), any(BigDecimal.class)
        );
    }

    @Test
    void testCreateReviewTrigger() {
        Employee emp = Employee.builder().id(1L).firstName("John").lastName("Doe")
                .user(User.builder().email("emp@test.com").build()).build();
        Employee reviewer = Employee.builder().id(2L).firstName("Manager").lastName("X").build();

        when(employeeRepository.findById(1L)).thenReturn(Optional.of(emp));
        when(employeeRepository.findById(2L)).thenReturn(Optional.of(reviewer));
        when(performanceRepository.save(any(PerformanceReview.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ReviewRequest request = new ReviewRequest();
        request.setEmployeeId(1L);
        request.setReviewPeriod("Annual 2026");
        request.setScore(9.0);
        request.setFeedbackText("Excellent work");

        performanceService.createReview(2L, request);

        verify(notificationService).notifyReviewAdded(
            eq("emp@test.com"), eq("John Doe"), eq("Annual 2026"), eq(9), eq("Excellent"),
            eq("Manager X"), any()
        );
    }

    @Test
    void testAddCandidateTrigger() {
        User hrUser = User.builder().email("hr@test.com").role(Role.HR_MANAGER).build();
        JobPosting job = JobPosting.builder().id(1L).title("Java Engineer").department("IT").build();

        when(jobPostingRepository.findById(1L)).thenReturn(Optional.of(job));
        when(userRepository.findByRoleIn(anyList())).thenReturn(List.of(hrUser));
        when(candidateRepository.save(any(Candidate.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CandidateRequest request = new CandidateRequest();
        request.setJobPostingId(1L);
        request.setName("Alice Smith");
        request.setEmail("alice@test.com");
        request.setPhone("123456");
        request.setResumeUrl("url");
        request.setExperienceYears(5);
        request.setNotes("Nice");

        recruitmentService.addCandidate(request);

        verify(notificationService).notifyHrNewCandidate(
            eq("hr@test.com"), eq("HR Team"), eq("Alice Smith"), eq("alice@test.com"),
            eq("Java Engineer"), eq("IT"), eq(5), eq("url")
        );
    }

    @Test
    void testMissingCheckoutSchedulerTrigger() {
        User hrUser = User.builder().email("hr@test.com").role(Role.HR_MANAGER).build();
        Employee emp = Employee.builder().id(1L).firstName("John").lastName("Doe").empCode("WM-001").build();
        AttendanceLog log = AttendanceLog.builder()
                .employee(emp).date(LocalDate.now().minusDays(1))
                .checkInTime(java.time.LocalTime.of(9, 0)).build();

        when(attendanceRepository.findByDateAndCheckOutTimeIsNull(any(LocalDate.class)))
                .thenReturn(List.of(log));
        when(userRepository.findByRoleIn(anyList())).thenReturn(List.of(hrUser));

        missingCheckoutScheduler.checkMissingCheckouts();

        verify(notificationService).notifyHrMissingCheckout(
            eq("hr@test.com"), eq("HR Team"), eq("John Doe"), eq("WM-001"), anyString(), eq("09:00")
        );
    }

    @Test
    void testFailSafeNotificationFlow() {
        // Even if notification throws an exception, it should not break the caller execution
        doThrow(new RuntimeException("Brevo API Down")).when(mockEmailService)
                .sendEmail(anyString(), anyString(), anyString(), anyString());

        Employee emp = Employee.builder().id(1L).firstName("John").lastName("Doe")
                .user(User.builder().email("emp@test.com").build()).build();
        LeaveType leaveType = LeaveType.builder().id(1L).name("Sick").build();
        LeaveRequest leaveRequest = LeaveRequest.builder()
                .id(10L).employee(emp).leaveType(leaveType)
                .fromDate(LocalDate.of(2026, 6, 1)).toDate(LocalDate.of(2026, 6, 2))
                .totalDays(2).status(LeaveStatus.PENDING).build();

        when(leaveRepository.findById(10L)).thenReturn(Optional.of(leaveRequest));
        when(leaveRepository.save(any(LeaveRequest.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // This call should complete successfully without throwing
        assertDoesNotThrow(() -> {
            leaveService.approveOrRejectLeave(10L, LeaveStatus.APPROVED, 2L, null);
        });
    }

    @Test
    void testCreateEmployee() {
        EmployeeRepository mockEmpRepo = mock(EmployeeRepository.class);
        UserRepository mockUserRepo = mock(UserRepository.class);
        EmployeeService service = new EmployeeService(mockEmpRepo, mockUserRepo);

        User user = User.builder().id(10L).email("test@workmate.com").role(Role.EMPLOYEE).build();
        when(mockUserRepo.findById(10L)).thenReturn(Optional.of(user));
        when(mockEmpRepo.findByUserId(10L)).thenReturn(Optional.empty());
        when(mockEmpRepo.count()).thenReturn(5L);
        when(mockEmpRepo.existsByEmpCode(anyString())).thenReturn(false);
        when(mockEmpRepo.save(any(Employee.class))).thenAnswer(invocation -> {
            Employee emp = invocation.getArgument(0);
            emp.setId(100L);
            return emp;
        });

        com.sdproject.WorkMate.employee.dto.EmployeeRequest request = new com.sdproject.WorkMate.employee.dto.EmployeeRequest();
        request.setUserId(10L);
        request.setFirstName("First");
        request.setLastName("Last");
        request.setDepartment("IT");
        request.setDesignation("Developer");
        request.setPhone("1234567890");
        request.setSalary(BigDecimal.valueOf(50000));
        request.setRole("EMPLOYEE");

        com.sdproject.WorkMate.employee.dto.EmployeeResponse response = service.createEmployee(request);

        assertNotNull(response);
        assertEquals(100L, response.getId());
        assertEquals("WM-006", response.getEmpCode());
        assertEquals("First Last", response.getFullName());
        verify(mockEmpRepo).save(any(Employee.class));
    }
}
