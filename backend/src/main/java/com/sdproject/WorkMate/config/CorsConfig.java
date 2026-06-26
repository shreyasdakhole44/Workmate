package com.sdproject.WorkMate.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Configuration
public class CorsConfig {

    @Value("${app.cors.allowed-origins:http://localhost:3000,http://localhost:5173,http://localhost:5174,http://localhost:5175,https://workmete.netlify.app}")
    private String allowedOrigins;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // Split by comma, trim whitespace, and strip trailing slash to avoid matching issues
        List<String> origins = Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .map(origin -> origin.endsWith("/") ? origin.substring(0, origin.length() - 1) : origin)
                .collect(Collectors.toList());

        config.setAllowedOrigins(origins);

        // ── Allowed HTTP methods ───────────────────────────────────────────
        config.setAllowedMethods(List.of(
                "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"
        ));

        // ── Allowed headers ────────────────────────────────────────────────
        // Authorization header carries the JWT token
        config.setAllowedHeaders(List.of(
                "Authorization",
                "Content-Type",
                "Accept",
                "X-Requested-With"
        ));

        // ── Allow cookies & auth headers in cross-origin requests ──────────
        config.setAllowCredentials(true);

        // ── How long browser caches preflight response (1 hour) ───────────
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}