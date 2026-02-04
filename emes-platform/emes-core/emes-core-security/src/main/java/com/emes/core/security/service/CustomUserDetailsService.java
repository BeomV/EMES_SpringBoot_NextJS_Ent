package com.emes.core.security.service;

import com.emes.core.common.exception.BusinessException;
import com.emes.core.common.exception.ErrorCode;
import com.emes.core.domain.mapper.UserMapper;
import com.emes.core.domain.model.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.Collections;

/**
 * Custom UserDetailsService
 * Spring Security에서 사용자 정보를 로드
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserMapper userMapper;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        log.debug("사용자 정보 조회: {}", username);

        User user = userMapper.selectByUsername(username);
        if (user == null) {
            log.error("사용자를 찾을 수 없습니다: {}", username);
            throw new BusinessException(ErrorCode.USER_NOT_FOUND);
        }

        // 계정 상태 확인
        if (user.getAccountLocked()) {
            log.error("계정이 잠금 상태입니다: {}", username);
            throw new BusinessException(ErrorCode.ACCOUNT_LOCKED);
        }

        if (!user.getEnabled()) {
            log.error("계정이 비활성화 상태입니다: {}", username);
            throw new BusinessException(ErrorCode.ACCOUNT_DISABLED);
        }

        return createUserDetails(user);
    }

    /**
     * User 객체를 Spring Security UserDetails로 변환
     */
    private UserDetails createUserDetails(User user) {
        // TODO: 실제로는 사용자의 역할/권한을 DB에서 조회해야 함
        Collection<? extends GrantedAuthority> authorities =
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"));

        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getUsername())
                .password(user.getPassword())
                .authorities(authorities)
                .accountExpired(false)
                .accountLocked(user.getAccountLocked())
                .credentialsExpired(false)
                .disabled(!user.getEnabled())
                .build();
    }
}
