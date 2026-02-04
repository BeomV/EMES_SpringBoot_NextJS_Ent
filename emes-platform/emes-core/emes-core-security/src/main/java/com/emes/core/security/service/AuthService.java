package com.emes.core.security.service;

import com.emes.core.common.exception.BusinessException;
import com.emes.core.common.exception.ErrorCode;
import com.emes.core.domain.mapper.UserMapper;
import com.emes.core.domain.model.User;
import com.emes.core.security.dto.LoginRequest;
import com.emes.core.security.dto.LoginResponse;
import com.emes.core.security.dto.RefreshTokenRequest;
import com.emes.core.security.jwt.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 인증 서비스
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserMapper userMapper;

    /**
     * 로그인
     */
    @Transactional
    public LoginResponse login(LoginRequest request) {
        try {
            // 1. 사용자 인증
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsername(),
                            request.getPassword()
                    )
            );

            // 2. 사용자 정보 조회
            User user = userMapper.selectByUsername(request.getUsername());
            if (user == null) {
                throw new BusinessException(ErrorCode.USER_NOT_FOUND);
            }

            // 3. JWT 토큰 생성
            String accessToken = jwtTokenProvider.createAccessToken(authentication);
            String refreshToken = jwtTokenProvider.createRefreshToken(user.getUsername());

            // 4. Refresh Token 저장 (DB 또는 Redis)
            // TODO: RefreshToken을 DB에 저장하는 로직 추가

            // 5. 응답 생성
            return LoginResponse.builder()
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .tokenType("Bearer")
                    .expiresIn(1800L)  // 30분
                    .user(LoginResponse.UserInfo.builder()
                            .userId(user.getUserId())
                            .username(user.getUsername())
                            .email(user.getEmail())
                            .displayName(user.getDisplayName())
                            .build())
                    .build();

        } catch (AuthenticationException e) {
            log.error("Login failed for user: {}", request.getUsername());
            throw new BusinessException(ErrorCode.INVALID_CREDENTIALS);
        }
    }

    /**
     * Refresh Token으로 Access Token 재발급
     */
    @Transactional
    public LoginResponse refresh(RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();

        // 1. Refresh Token 유효성 검증
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new BusinessException(ErrorCode.INVALID_TOKEN);
        }

        // 2. Refresh Token에서 사용자명 추출
        String username = jwtTokenProvider.getUsername(refreshToken);

        // 3. DB에서 Refresh Token 검증
        // TODO: DB에 저장된 Refresh Token과 비교하는 로직 추가

        // 4. 사용자 정보 조회
        User user = userMapper.selectByUsername(username);
        if (user == null) {
            throw new BusinessException(ErrorCode.USER_NOT_FOUND);
        }

        // 5. 새로운 Access Token 생성
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                username, null, null);
        String newAccessToken = jwtTokenProvider.createAccessToken(authentication);

        // 6. 응답 생성
        return LoginResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(refreshToken)  // Refresh Token은 재사용
                .tokenType("Bearer")
                .expiresIn(1800L)
                .user(LoginResponse.UserInfo.builder()
                        .userId(user.getUserId())
                        .username(user.getUsername())
                        .email(user.getEmail())
                        .displayName(user.getDisplayName())
                        .build())
                .build();
    }

    /**
     * 로그아웃
     */
    @Transactional
    public void logout(String refreshToken) {
        // TODO: DB에서 Refresh Token 삭제
        log.info("User logged out");
    }
}
