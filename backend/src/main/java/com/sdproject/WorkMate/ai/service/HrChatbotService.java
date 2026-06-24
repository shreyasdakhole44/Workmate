package com.sdproject.WorkMate.ai.service;

import com.sdproject.WorkMate.leave.service.LeaveService;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HrChatbotService {

    private final ChatClient chatClient;
    private final VectorStore vectorStore;
    private final LeaveService leaveService;

    public String answerQuestion(String question, Long employeeId) {
        
        // STEP A — RETRIEVE: local embedding similarity search, 
        // zero cost, zero network call
        List<Document> relevantDocs = vectorStore.similaritySearch(
            SearchRequest.builder().query(question).topK(3).build()
        );
        
        String policyContext = relevantDocs.stream()
            .map(Document::getText)
            .collect(Collectors.joining("\n\n"));

        // STEP B — AUGMENT: pull employee's own live data if the 
        // question is about personal leave balance
        String personalContext = "";
        if (employeeId != null && question.toLowerCase().contains("leave")) {
            try {
                var balanceList = leaveService.getEmployeeLeaveBalances(employeeId, 
                    java.time.Year.now().getValue());
                personalContext = "\n\nThis employee's current leave balance:\n" + balanceList.toString();
            } catch (Exception e) {
                // If balance lookup fails, just skip personalization 
                // and answer from policy alone
            }
        }

        // STEP C — GENERATE: send the augmented prompt to Groq
        String promptText = """
            You are a friendly and helpful HR Assistant for the WorkMate application.
            - If the employee's input is a greeting (e.g. "hi", "hello", "good morning") or general chat, reply politely, and invite them to ask about leave, attendance, payroll, onboarding, or performance reviews.
            - Otherwise, answer the employee's question using the policy context and personal data provided below.
            - If the answer is not in the provided context, state that you do not have that specific information in the policy database and suggest contacting HR directly.
            - Keep your response friendly and concise (2-3 sentences).
            
            COMPANY POLICY CONTEXT:
            %s
            %s
            
            EMPLOYEE QUESTION: %s
            """.formatted(policyContext, personalContext, question);

        try {
            return chatClient.prompt()
                .user(promptText)
                .call()
                .content();
        } catch (Exception e) {
            return "I'm sorry, I'm having trouble communicating with my AI brain right now. " +
                   "Please make sure your GROQ_API_KEY environment variable is set correctly and try again. " +
                   "Details: " + e.getMessage();
        }
    }
}
