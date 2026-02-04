package com.emes.core.admin.dto.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 사용자 검색 요청 DTO
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSearchRequest {

    private String username;
    private String email;
    private String displayName;
    private String department;
    private String position;
    private Boolean enabled;
    private Boolean accountLocked;

    // 페이징 파라미터
    private Integer page = 0;
    private Integer size = 20;
    private String sortBy = "createdAt";
    private String sortDirection = "desc";
}
