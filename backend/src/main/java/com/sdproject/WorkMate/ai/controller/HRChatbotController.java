package com.sdproject.WorkMate.ai.controller;

import com.sdproject.WorkMate.ai.dto.ChatRequest;
import com.sdproject.WorkMate.ai.dto.DraftReviewRequest;
import com.sdproject.WorkMate.ai.service.HrChatbotService;
import com.sdproject.WorkMate.performance.service.AiReviewService;
import com.sdproject.WorkMate.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai/chat")
@RequiredArgsConstructor
@Tag(name = "HR Chatbot")
public class HRChatbotController {

    private final HrChatbotService chatbotService;
    private final AiReviewService aiReviewService;

    @PostMapping("/ask")
    public ApiResponse<String> ask(@RequestBody ChatRequest request) {
        String answer = chatbotService.answerQuestion(
            request.getQuestion(), request.getEmployeeId());
        return ApiResponse.success(answer);
    }

    @PostMapping("/draft-review")
    public org.springframework.http.ResponseEntity<ApiResponse<String>> draftReview(@RequestBody DraftReviewRequest request) {
        try {
            String draft = aiReviewService.generateReviewSummary(
                request.getEmployeeName(),
                request.getDesignation(),
                request.getScore() != null ? request.getScore().intValue() : 8,
                request.getManagerNotes()
            );
            return org.springframework.http.ResponseEntity.ok(ApiResponse.success(draft));
        } catch (Exception e) {
            e.printStackTrace();
            String errorMsg = "Could not generate AI draft. Please check your GROQ_API_KEY environment variable. Details: " + e.getMessage();
            return org.springframework.http.ResponseEntity.status(500).body(ApiResponse.error(errorMsg));
        }
    }
}
