package com.sdproject.WorkMate.ai.config;

import org.springframework.ai.document.Document;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.embedding.Embedding;
import org.springframework.ai.embedding.EmbeddingRequest;
import org.springframework.ai.embedding.EmbeddingResponse;
import org.springframework.ai.vectorstore.SimpleVectorStore;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Configuration
public class VectorStoreConfig {

    /**
     * A lightweight mock EmbeddingModel active only in production.
     * This avoids loading the heavy local ONNX transformer model into memory,
     * which exceeds the 512MB RAM limit on Render's free tier and causes OOM crashes.
     */
    @Bean
    @Profile("production")
    public EmbeddingModel embeddingModel() {
        return new EmbeddingModel() {
            @Override
            public float[] embed(String text) {
                float[] vector = new float[384];
                long seed = text.hashCode();
                Random random = new Random(seed);
                for (int i = 0; i < 384; i++) {
                    vector[i] = random.nextFloat();
                }
                return vector;
            }

            @Override
            public float[] embed(Document document) {
                return embed(document.getText());
            }

            @Override
            public EmbeddingResponse call(EmbeddingRequest request) {
                List<String> texts = request.getInstructions();
                List<Embedding> embeddings = new ArrayList<>();
                for (int i = 0; i < texts.size(); i++) {
                    embeddings.add(new Embedding(embed(texts.get(i)), i));
                }
                return new EmbeddingResponse(embeddings);
            }

            @Override
            public EmbeddingResponse embedForResponse(List<String> texts) {
                List<Embedding> embeddings = new ArrayList<>();
                for (int i = 0; i < texts.size(); i++) {
                    embeddings.add(new Embedding(embed(texts.get(i)), i));
                }
                return new EmbeddingResponse(embeddings);
            }
        };
    }

    // EmbeddingModel here is auto-configured by 
    // spring-ai-transformers-embedding — runs entirely on your machine, 
    // downloads a small ONNX model on first startup, zero API key needed
    @Bean
    public VectorStore vectorStore(EmbeddingModel embeddingModel) {
        SimpleVectorStore store = SimpleVectorStore.builder(embeddingModel).build();
        
        // Seed with WorkMate's HR policy knowledge
        List<Document> policyDocs = List.of(
            new Document("""
                Leave Policy: Employees get 12 Casual Leave days, 7 Sick \
                Leave days, and 15 Earned Leave days per calendar year. \
                Leave applications must be submitted at least 2 days in \
                advance for Casual Leave. Sick Leave can be applied on \
                the same day. Maternity leave is 180 days, Paternity \
                leave is 15 days.
                """),
            new Document("""
                Attendance Policy: Working hours are calculated \
                automatically on checkout. PRESENT status requires at \
                least 8 hours logged. HALF_DAY status applies for 4-8 \
                hours. Below 4 hours is marked ABSENT. Employees must \
                check in by 10:00 AM to avoid a late mark.
                """),
            new Document("""
                Payroll Policy: Salaries are processed on the last \
                working day of each month. Payslips include Basic \
                Salary, HRA, Special Allowance, Conveyance, and Medical \
                Allowance as earnings. Deductions include Provident \
                Fund (12% of basic), Professional Tax, Income Tax (TDS), \
                and ESI where applicable.
                """),
            new Document("""
                Performance Review Policy: Reviews happen quarterly. \
                Each employee receives one review per period from their \
                reporting manager. Scores range from 1-10, with 8+ \
                considered Excellent, 6-7 Good, 4-5 Average, below 4 \
                Needs Improvement.
                """),
            new Document("""
                Onboarding Policy: New employees complete an 8-task \
                checklist covering document submission, offer letter \
                signing, IT setup, profile completion, and orientation. \
                HR seeds this checklist on the employee's first day.
                """),
            new Document("""
                WorkMate HRMS Application: WorkMate is an integrated \
                Human Resource Management System (HRMS) designed to \
                manage employee profiles, attendance logs, leave balances, \
                payroll processing, performance reviews, onboarding tasks, \
                and recruitment workflows. It features self-service portals \
                for employees and comprehensive administrative panels for HR. \
                All AI queries are processed securely using Spring AI integration. \
                """)
        );
        
        store.add(policyDocs);
        return store;
    }
}
