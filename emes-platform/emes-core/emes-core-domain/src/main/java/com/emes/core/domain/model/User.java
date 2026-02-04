package com.emes.core.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 사용자 도메인 모델 (MyBatis VO)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    private Long userId;
    private String username;
    private String password;
    private String email;
    private String fullName;
    private String phone;
    private String department;
    private String position;
    private Boolean isActive;
    private Boolean isLocked;
    private Integer failedLoginAttempts;
    private LocalDateTime lastLoginAt;
    private LocalDateTime passwordChangedAt;
    private Long createdBy;
    private LocalDateTime createdAt;
    private Long updatedBy;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;
    private Integer version;
}
