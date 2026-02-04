package com.emes.core.security.filter;

import com.emes.core.security.jwt.JwtTokenProvider;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * JWT Authentication Filter
 * 요청에서 JWT 토큰을 추출하고 검증
 */
@Slf4j
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtTokenProvider jwtTokenProvider;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        try {
            // 1. Request Header에서 JWT 토큰 추출
            String token = resolveToken(request);

            // 2. 토큰 유효성 검증
            if (StringUtils.hasText(token) && jwtTokenProvider.validateToken(token)) {
                // 3. 토큰에서 Authentication 정보 추출
                Authentication authentication = jwtTokenProvider.getAuthentication(token);

                // 4. SecurityContext에 Authentication 정보 저장
                SecurityContextHolder.getContext().setAuthentication(authentication);

                log.debug("Security Context에 '{}' 인증 정보를 저장했습니다.", authentication.getName());
            }
        } catch (Exception e) {
            log.error("Security Context에 인증 정보를 저장할 수 없습니다: {}", e.getMessage());
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Request Header에서 토큰 정보 추출
     */
    private String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader(AUTHORIZATION_HEADER);

        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith(BEARER_PREFIX)) {
            return bearerToken.substring(BEARER_PREFIX.length());
        }

        return null;
    }
}
