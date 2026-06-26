package com.sdproject.WorkMate.notification.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.*;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);
    private static final String BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

    @Value("${brevo.api.key}")
    private String apiKey;

    @Value("${brevo.sender.email}")
    private String senderEmail;

    @Value("${brevo.sender.name}")
    private String senderName;

    private RestTemplate restTemplate;

    public EmailService() {
        this.restTemplate = new RestTemplate();
    }

    // Constructor for testing
    public EmailService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * Sends an email via Brevo's HTTPS API.
     * NEVER throws — logs failure and returns false instead, so the 
     * calling business logic (leave approval, payslip generation, etc.) 
     * is never blocked by an email failure.
     */
    public boolean sendEmail(String toEmail, String toName, 
            String subject, String htmlBody) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("api-key", apiKey);
            headers.set("Content-Type", "application/json");
            headers.set("Accept", "application/json");

            Map<String, Object> sender = Map.of(
                "name", senderName, "email", senderEmail);
            Map<String, Object> recipient = Map.of(
                "email", toEmail, "name", toName != null ? toName : toEmail);

            Map<String, Object> body = new HashMap<>();
            body.put("sender", sender);
            body.put("to", List.of(recipient));
            body.put("subject", subject);
            body.put("htmlContent", htmlBody);

            HttpEntity<Map<String, Object>> request = 
                new HttpEntity<>(body, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(
                BREVO_API_URL, request, String.class);

            return response.getStatusCode().is2xxSuccessful();

        } catch (Exception e) {
            log.warn("Failed to send email to {}: {}", toEmail, e.getMessage());
            return false;
        }
    }
}
