package com.sdproject.WorkMate.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    private static final String SECURITY_SCHEME_NAME = "bearerAuth";

    @Bean
    public OpenAPI workMateOpenAPI() {
        return new OpenAPI()

                // ── API Info ───────────────────────────────────────────────
                .info(new Info()
                        .title("WorkMate HRMS API")
                        .description(
                                "Human Resource Management System — " +
                                "Backend REST API built with Spring Boot 3.5 by Talentrix Solution. " +
                                "Use the Authorize button below to enter your JWT token."
                        )
                        .version("v1.0.0")
                        .contact(new Contact()
                                .name("Shreyas Prakash Dakhole")
                                .email("shreyas@talentrix.com")
                        )
                )

                // ── JWT Bearer Auth in Swagger UI ──────────────────────────
                // This adds the "Authorize 🔒" button to Swagger UI
                // so you can test protected endpoints directly
                .addSecurityItem(new SecurityRequirement()
                        .addList(SECURITY_SCHEME_NAME))

                .components(new Components()
                        .addSecuritySchemes(SECURITY_SCHEME_NAME,
                                new SecurityScheme()
                                        .name(SECURITY_SCHEME_NAME)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Paste your JWT token here. " +
                                                     "Get it from POST /api/auth/login")
                        )
                );
    }
}