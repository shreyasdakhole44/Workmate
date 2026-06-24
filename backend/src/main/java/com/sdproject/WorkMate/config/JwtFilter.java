package com.sdproject.WorkMate.config;

import com.sdproject.WorkMate.auth.service.CustomUserDetailsService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        // Step 1: Read Authorization header
        String authHeader = request.getHeader("Authorization");

        // Step 2: If no token or wrong format — skip filter, go to next
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // Step 3: Extract the token (remove "Bearer " prefix)
        String token = authHeader.substring(7);
        String email = null;

        try {
            email = jwtUtil.extractEmail(token);
        } catch (Exception e) {
            // Invalid token — let Spring Security handle the 401
            filterChain.doFilter(request, response);
            return;
        }

        // Step 4: If email extracted and no auth set yet in context
        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            // Step 5: Load user from DB
            UserDetails userDetails = userDetailsService.loadUserByUsername(email);

            // Step 6: Validate token against loaded user
            if (jwtUtil.isTokenValid(token, userDetails.getUsername())) {

                // Step 7: Create auth object and set in SecurityContext
                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities()
                        );

                authToken.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                );

                // Step 8: Mark this request as authenticated
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        // Step 9: Continue to the actual controller
        filterChain.doFilter(request, response);
    }
}