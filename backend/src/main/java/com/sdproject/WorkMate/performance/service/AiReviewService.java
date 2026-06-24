package com.sdproject.WorkMate.performance.service;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AiReviewService {

    private final ChatClient chatClient;

    public String generateReviewSummary(String employeeName, 
            String designation, int score, String managerNotes) {
        
        String promptText = """
            Write a performance review summary for %s, a %s.
            Score given: %d out of 10.
            Manager's notes: %s
            
            Write a professional 3-4 sentence summary suitable for an \
            official performance review document.
            """.formatted(employeeName, designation, score, managerNotes);

        return chatClient.prompt()
            .user(promptText)
            .call()
            .content();
    }
}
