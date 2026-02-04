package com.emes.core.common.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 에러 코드 정의
 */
@Getter
@AllArgsConstructor
public enum ErrorCode {

    // Common (C)
    INVALID_INPUT(400, "C001", "Invalid input parameter"),
    UNAUTHORIZED(401, "C002", "Unauthorized access"),
    FORBIDDEN(403, "C003", "Forbidden access"),
    NOT_FOUND(404, "C004", "Resource not found"),
    CONFLICT(409, "C005", "Resource conflict"),
    INTERNAL_SERVER_ERROR(500, "C006", "Internal server error"),

    // User (U)
    USER_NOT_FOUND(404, "U001", "User not found"),
    USERNAME_ALREADY_EXISTS(409, "U002", "Username already exists"),
    EMAIL_ALREADY_EXISTS(409, "U003", "Email already exists"),
    INVALID_PASSWORD(400, "U004", "Invalid password format"),
    ACCOUNT_LOCKED(403, "U005", "Account is locked"),
    ACCOUNT_DISABLED(403, "U006", "Account is disabled"),

    // Auth (A)
    INVALID_TOKEN(401, "A001", "Invalid token"),
    EXPIRED_TOKEN(401, "A002", "Expired token"),
    INVALID_CREDENTIALS(401, "A003", "Invalid credentials"),
    REFRESH_TOKEN_NOT_FOUND(401, "A004", "Refresh token not found"),
    REFRESH_TOKEN_EXPIRED(401, "A005", "Refresh token expired"),

    // Role (R)
    ROLE_NOT_FOUND(404, "R001", "Role not found"),
    ROLE_ALREADY_EXISTS(409, "R002", "Role already exists"),
    CANNOT_DELETE_SYSTEM_ROLE(400, "R003", "Cannot delete system role"),

    // Permission (P)
    PERMISSION_NOT_FOUND(404, "P001", "Permission not found"),
    PERMISSION_ALREADY_EXISTS(409, "P002", "Permission already exists"),
    INSUFFICIENT_PERMISSION(403, "P003", "Insufficient permission"),

    // Code (CO)
    CODE_NOT_FOUND(404, "CO001", "Code not found"),
    CODE_GROUP_NOT_FOUND(404, "CO002", "Code group not found"),
    CODE_ALREADY_EXISTS(409, "CO003", "Code already exists"),
    CANNOT_DELETE_SYSTEM_CODE(400, "CO004", "Cannot delete system code"),

    // Menu (M)
    MENU_NOT_FOUND(404, "M001", "Menu not found"),
    MENU_ALREADY_EXISTS(409, "M002", "Menu already exists"),
    INVALID_MENU_HIERARCHY(400, "M003", "Invalid menu hierarchy");

    private final int status;
    private final String code;
    private final String message;
}
