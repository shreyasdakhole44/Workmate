package com.sdproject.WorkMate.ai.config;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AiConfig {

    @Bean
    public ChatClient chatClient(OpenAiChatModel chatModel) {
        return ChatClient.builder(chatModel)
            .defaultSystem("""
                You are an HR assistant writing professional, constructive \
                performance review summaries. Keep responses to 3-4 sentences. \
                Be specific, balanced, and avoid generic corporate language. \
                Mention one clear strength and one clear area for growth.
                """)
            .build();
    }
}
