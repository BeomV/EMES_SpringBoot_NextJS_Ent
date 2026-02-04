package com.emes.core.admin.controller;

import com.emes.core.admin.dto.user.*;
import com.emes.core.admin.service.UserService;
import com.emes.core.common.dto.ApiResponse;
import com.emes.core.common.dto.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * 사용자 관리 API Controller
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /**
     * 사용자 생성
     */
    @PostMapping
    @PreAuthorize("hasAuthority('USER_CREATE')")
    public ResponseEntity<ApiResponse<UserResponse>> createUser(
            @Valid @RequestBody UserCreateRequest request) {
        log.info("Create user request: {}", request.getUsername());

        UserResponse response = userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response));
    }

    /**
     * 사용자 조회
     */
    @GetMapping("/{userId}")
    @PreAuthorize("hasAuthority('USER_READ')")
    public ResponseEntity<ApiResponse<UserResponse>> getUser(
            @PathVariable Long userId) {
        log.info("Get user request: {}", userId);

        UserResponse response = userService.getUser(userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 사용자 목록 조회 (검색 + 페이징)
     */
    @GetMapping
    @PreAuthorize("hasAuthority('USER_READ')")
    public ResponseEntity<ApiResponse<PageResponse<UserResponse>>> searchUsers(
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String displayName,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String position,
            @RequestParam(required = false) Boolean enabled,
            @RequestParam(required = false) Boolean accountLocked,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "20") Integer size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {

        log.info("Search users request - page: {}, size: {}", page, size);

        UserSearchRequest searchRequest = UserSearchRequest.builder()
                .username(username)
                .email(email)
                .displayName(displayName)
                .department(department)
                .position(position)
                .enabled(enabled)
                .accountLocked(accountLocked)
                .page(page)
                .size(size)
                .sortBy(sortBy)
                .sortDirection(sortDirection)
                .build();

        PageResponse<UserResponse> response = userService.searchUsers(searchRequest);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 사용자 수정
     */
    @PutMapping("/{userId}")
    @PreAuthorize("hasAuthority('USER_UPDATE')")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
            @PathVariable Long userId,
            @Valid @RequestBody UserUpdateRequest request) {
        log.info("Update user request: {}", userId);

        UserResponse response = userService.updateUser(userId, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 사용자 삭제
     */
    @DeleteMapping("/{userId}")
    @PreAuthorize("hasAuthority('USER_DELETE')")
    public ResponseEntity<ApiResponse<Void>> deleteUser(
            @PathVariable Long userId) {
        log.info("Delete user request: {}", userId);

        userService.deleteUser(userId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    /**
     * 비밀번호 변경
     */
    @PatchMapping("/{userId}/password")
    @PreAuthorize("hasAuthority('USER_UPDATE')")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @PathVariable Long userId,
            @Valid @RequestBody PasswordChangeRequest request) {
        log.info("Change password request for user: {}", userId);

        userService.changePassword(userId, request);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    /**
     * 계정 잠금
     */
    @PatchMapping("/{userId}/lock")
    @PreAuthorize("hasAuthority('USER_UPDATE')")
    public ResponseEntity<ApiResponse<Void>> lockAccount(
            @PathVariable Long userId) {
        log.info("Lock account request: {}", userId);

        userService.toggleAccountLock(userId, true);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    /**
     * 계정 잠금 해제
     */
    @PatchMapping("/{userId}/unlock")
    @PreAuthorize("hasAuthority('USER_UPDATE')")
    public ResponseEntity<ApiResponse<Void>> unlockAccount(
            @PathVariable Long userId) {
        log.info("Unlock account request: {}", userId);

        userService.toggleAccountLock(userId, false);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
