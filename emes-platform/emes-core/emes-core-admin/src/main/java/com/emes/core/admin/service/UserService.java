package com.emes.core.admin.service;

import com.emes.core.admin.dto.user.*;
import com.emes.core.common.dto.PageResponse;
import com.emes.core.common.exception.BusinessException;
import com.emes.core.common.exception.ErrorCode;
import com.emes.core.domain.mapper.UserMapper;
import com.emes.core.domain.model.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 사용자 관리 서비스
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    /**
     * 사용자 생성
     */
    @Transactional
    public UserResponse createUser(UserCreateRequest request) {
        log.info("Creating user: {}", request.getUsername());

        // 1. 중복 체크
        if (userMapper.selectByUsername(request.getUsername()) != null) {
            throw new BusinessException(ErrorCode.USERNAME_ALREADY_EXISTS);
        }

        if (userMapper.selectByEmail(request.getEmail()) != null) {
            throw new BusinessException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }

        // 2. User 엔티티 생성
        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .email(request.getEmail())
                .fullName(request.getDisplayName())
                .phone(request.getPhoneNumber())
                .department(request.getDepartment())
                .position(request.getPosition())
                .isActive(request.getEnabled() != null ? request.getEnabled() : true)
                .isLocked(false)
                .passwordChangedAt(LocalDateTime.now())
                .createdAt(LocalDateTime.now())
                .build();

        // 3. DB 저장
        int inserted = userMapper.insert(user);
        if (inserted == 0) {
            throw new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR);
        }

        log.info("User created successfully: {}", user.getUsername());
        return convertToResponse(user);
    }

    /**
     * 사용자 조회
     */
    @Transactional(readOnly = true)
    public UserResponse getUser(Long userId) {
        log.debug("Getting user: {}", userId);

        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException(ErrorCode.USER_NOT_FOUND);
        }

        return convertToResponse(user);
    }

    /**
     * 사용자 목록 조회 (검색 + 페이징)
     */
    @Transactional(readOnly = true)
    public PageResponse<UserResponse> searchUsers(UserSearchRequest request) {
        log.debug("Searching users with condition: {}", request);

        // 1. 전체 개수 조회
        long totalElements = userMapper.countByCondition(
                request.getUsername(),
                request.getEmail(),
                request.getDisplayName(),
                request.getDepartment(),
                request.getPosition(),
                request.getEnabled(),
                request.getAccountLocked()
        );

        // 2. 페이징된 목록 조회
        int offset = request.getPage() * request.getSize();
        List<User> users = userMapper.selectByCondition(
                request.getUsername(),
                request.getEmail(),
                request.getDisplayName(),
                request.getDepartment(),
                request.getPosition(),
                request.getEnabled(),
                request.getAccountLocked(),
                request.getSortBy(),
                request.getSortDirection(),
                request.getSize(),
                offset
        );

        // 3. DTO 변환
        List<UserResponse> content = users.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());

        return PageResponse.of(content, request.getPage(), request.getSize(), totalElements);
    }

    /**
     * 사용자 수정
     */
    @Transactional
    public UserResponse updateUser(Long userId, UserUpdateRequest request) {
        log.info("Updating user: {}", userId);

        // 1. 기존 사용자 조회
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException(ErrorCode.USER_NOT_FOUND);
        }

        // 2. 이메일 중복 체크 (변경하는 경우)
        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            User existingUser = userMapper.selectByEmail(request.getEmail());
            if (existingUser != null && !existingUser.getUserId().equals(userId)) {
                throw new BusinessException(ErrorCode.EMAIL_ALREADY_EXISTS);
            }
        }

        // 3. 업데이트 필드 설정
        User updatedUser = User.builder()
                .userId(userId)
                .email(request.getEmail() != null ? request.getEmail() : user.getEmail())
                .fullName(request.getDisplayName() != null ? request.getDisplayName() : user.getFullName())
                .phone(request.getPhoneNumber() != null ? request.getPhoneNumber() : user.getPhone())
                .department(request.getDepartment() != null ? request.getDepartment() : user.getDepartment())
                .position(request.getPosition() != null ? request.getPosition() : user.getPosition())
                .isActive(request.getEnabled() != null ? request.getEnabled() : user.getIsActive())
                .isLocked(request.getAccountLocked() != null ? request.getAccountLocked() : user.getIsLocked())
                .updatedAt(LocalDateTime.now())
                .build();

        // 4. DB 업데이트
        int updated = userMapper.update(updatedUser);
        if (updated == 0) {
            throw new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR);
        }

        log.info("User updated successfully: {}", userId);
        return getUser(userId);
    }

    /**
     * 사용자 삭제 (Soft Delete)
     */
    @Transactional
    public void deleteUser(Long userId) {
        log.info("Deleting user: {}", userId);

        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException(ErrorCode.USER_NOT_FOUND);
        }

        int deleted = userMapper.softDelete(userId, LocalDateTime.now());
        if (deleted == 0) {
            throw new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR);
        }

        log.info("User deleted successfully: {}", userId);
    }

    /**
     * 비밀번호 변경
     */
    @Transactional
    public void changePassword(Long userId, PasswordChangeRequest request) {
        log.info("Changing password for user: {}", userId);

        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException(ErrorCode.USER_NOT_FOUND);
        }

        String encodedPassword = passwordEncoder.encode(request.getNewPassword());
        int updated = userMapper.updatePassword(userId, encodedPassword, LocalDateTime.now());

        if (updated == 0) {
            throw new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR);
        }

        log.info("Password changed successfully for user: {}", userId);
    }

    /**
     * 계정 잠금/해제
     */
    @Transactional
    public void toggleAccountLock(Long userId, boolean locked) {
        log.info("Toggling account lock for user {}: {}", userId, locked);

        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException(ErrorCode.USER_NOT_FOUND);
        }

        User updatedUser = User.builder()
                .userId(userId)
                .isLocked(locked)
                .updatedAt(LocalDateTime.now())
                .build();

        int updated = userMapper.update(updatedUser);
        if (updated == 0) {
            throw new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR);
        }

        log.info("Account lock toggled successfully for user: {}", userId);
    }

    /**
     * User -> UserResponse 변환
     */
    private UserResponse convertToResponse(User user) {
        return UserResponse.builder()
                .userId(user.getUserId())
                .username(user.getUsername())
                .email(user.getEmail())
                .displayName(user.getFullName())
                .phoneNumber(user.getPhone())
                .department(user.getDepartment())
                .position(user.getPosition())
                .enabled(user.getIsActive())
                .accountLocked(user.getIsLocked())
                .lastLoginAt(user.getLastLoginAt())
                .passwordChangedAt(user.getPasswordChangedAt())
                .createdAt(user.getCreatedAt())
                .createdBy(user.getCreatedBy() != null ? String.valueOf(user.getCreatedBy()) : null)
                .updatedAt(user.getUpdatedAt())
                .updatedBy(user.getUpdatedBy() != null ? String.valueOf(user.getUpdatedBy()) : null)
                .build();
    }
}
