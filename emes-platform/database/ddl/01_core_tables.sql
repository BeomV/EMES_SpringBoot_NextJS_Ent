SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

-- ===================================================================
-- EMES Platform - Core Tables DDL Script
-- Database: MS SQL Server
-- Version: 1.0.0
-- ===================================================================

-- ===================================================================
-- 1. 사용자 관리 테이블
-- ===================================================================

-- 사용자 테이블
CREATE TABLE TB_CORE_USER (
    user_id BIGINT PRIMARY KEY IDENTITY(1,1),
    username NVARCHAR(50) NOT NULL UNIQUE,
    password NVARCHAR(255) NOT NULL,
    email NVARCHAR(100) NOT NULL UNIQUE,
    full_name NVARCHAR(100) NOT NULL,
    phone NVARCHAR(20),
    department NVARCHAR(100),
    position NVARCHAR(50),
    is_active BIT NOT NULL DEFAULT 1,
    is_locked BIT NOT NULL DEFAULT 0,
    failed_login_attempts INT NOT NULL DEFAULT 0,
    last_login_at DATETIME2,
    password_changed_at DATETIME2,
    created_by BIGINT,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_by BIGINT,
    updated_at DATETIME2,
    deleted_at DATETIME2,
    version INT NOT NULL DEFAULT 0  -- Optimistic Locking
);

CREATE INDEX IX_TB_CORE_USER_username ON TB_CORE_USER(username) WHERE deleted_at IS NULL;
CREATE INDEX IX_TB_CORE_USER_email ON TB_CORE_USER(email) WHERE deleted_at IS NULL;
CREATE INDEX IX_TB_CORE_USER_is_active ON TB_CORE_USER(is_active);

-- 사용자 그룹 테이블
CREATE TABLE TB_CORE_USER_GROUP (
    group_id BIGINT PRIMARY KEY IDENTITY(1,1),
    group_code NVARCHAR(50) NOT NULL UNIQUE,
    group_name NVARCHAR(100) NOT NULL,
    description NVARCHAR(500),
    parent_group_id BIGINT,  -- 계층 구조 지원
    level INT NOT NULL DEFAULT 0,
    sort_order INT NOT NULL DEFAULT 0,
    is_active BIT NOT NULL DEFAULT 1,
    created_by BIGINT,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_by BIGINT,
    updated_at DATETIME2,
    deleted_at DATETIME2,
    FOREIGN KEY (parent_group_id) REFERENCES TB_CORE_USER_GROUP(group_id)
);

CREATE INDEX IX_TB_CORE_USER_GROUP_parent_group_id ON TB_CORE_USER_GROUP(parent_group_id);

-- 사용자-그룹 매핑 (N:N)
CREATE TABLE TB_CORE_USER_GROUP_MAPPING (
    mapping_id BIGINT PRIMARY KEY IDENTITY(1,1),
    user_id BIGINT NOT NULL,
    group_id BIGINT NOT NULL,
    is_primary BIT NOT NULL DEFAULT 0,  -- 주 그룹 여부
    created_by BIGINT,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES TB_CORE_USER(user_id),
    FOREIGN KEY (group_id) REFERENCES TB_CORE_USER_GROUP(group_id),
    UNIQUE (user_id, group_id)
);

CREATE INDEX IX_TB_CORE_USER_GROUP_MAPPING_user_id ON TB_CORE_USER_GROUP_MAPPING(user_id);
CREATE INDEX IX_TB_CORE_USER_GROUP_MAPPING_group_id ON TB_CORE_USER_GROUP_MAPPING(group_id);

-- ===================================================================
-- 2. 권한 관리 테이블 (RBAC)
-- ===================================================================

-- 역할 테이블
CREATE TABLE TB_CORE_ROLE (
    role_id BIGINT PRIMARY KEY IDENTITY(1,1),
    role_code NVARCHAR(50) NOT NULL UNIQUE,
    role_name NVARCHAR(100) NOT NULL,
    description NVARCHAR(500),
    is_system BIT NOT NULL DEFAULT 0,  -- 시스템 기본 역할
    is_active BIT NOT NULL DEFAULT 1,
    created_by BIGINT,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_by BIGINT,
    updated_at DATETIME2,
    deleted_at DATETIME2
);

CREATE INDEX IX_TB_CORE_ROLE_role_code ON TB_CORE_ROLE(role_code);

-- 권한 테이블
CREATE TABLE TB_CORE_PERMISSION (
    permission_id BIGINT PRIMARY KEY IDENTITY(1,1),
    permission_code NVARCHAR(100) NOT NULL UNIQUE,  -- 예: USER_READ, USER_WRITE
    permission_name NVARCHAR(100) NOT NULL,
    resource NVARCHAR(100) NOT NULL,  -- 리소스 (예: USER, MENU)
    action NVARCHAR(50) NOT NULL,     -- 액션 (예: READ, WRITE, DELETE)
    description NVARCHAR(500),
    is_active BIT NOT NULL DEFAULT 1,
    created_by BIGINT,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_by BIGINT,
    updated_at DATETIME2
);

CREATE INDEX IX_TB_CORE_PERMISSION_permission_code ON TB_CORE_PERMISSION(permission_code);
CREATE INDEX IX_TB_CORE_PERMISSION_resource ON TB_CORE_PERMISSION(resource);

-- 역할-권한 매핑
CREATE TABLE TB_CORE_ROLE_PERMISSION (
    role_permission_id BIGINT PRIMARY KEY IDENTITY(1,1),
    role_id BIGINT NOT NULL,
    permission_id BIGINT NOT NULL,
    created_by BIGINT,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (role_id) REFERENCES TB_CORE_ROLE(role_id),
    FOREIGN KEY (permission_id) REFERENCES TB_CORE_PERMISSION(permission_id),
    UNIQUE (role_id, permission_id)
);

CREATE INDEX IX_TB_CORE_ROLE_PERMISSION_role_id ON TB_CORE_ROLE_PERMISSION(role_id);
CREATE INDEX IX_TB_CORE_ROLE_PERMISSION_permission_id ON TB_CORE_ROLE_PERMISSION(permission_id);

-- 사용자-역할 매핑
CREATE TABLE TB_CORE_USER_ROLE (
    user_role_id BIGINT PRIMARY KEY IDENTITY(1,1),
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    created_by BIGINT,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES TB_CORE_USER(user_id),
    FOREIGN KEY (role_id) REFERENCES TB_CORE_ROLE(role_id),
    UNIQUE (user_id, role_id)
);

CREATE INDEX IX_TB_CORE_USER_ROLE_user_id ON TB_CORE_USER_ROLE(user_id);
CREATE INDEX IX_TB_CORE_USER_ROLE_role_id ON TB_CORE_USER_ROLE(role_id);

-- 그룹-역할 매핑
CREATE TABLE TB_CORE_GROUP_ROLE (
    group_role_id BIGINT PRIMARY KEY IDENTITY(1,1),
    group_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    created_by BIGINT,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (group_id) REFERENCES TB_CORE_USER_GROUP(group_id),
    FOREIGN KEY (role_id) REFERENCES TB_CORE_ROLE(role_id),
    UNIQUE (group_id, role_id)
);

CREATE INDEX IX_TB_CORE_GROUP_ROLE_group_id ON TB_CORE_GROUP_ROLE(group_id);
CREATE INDEX IX_TB_CORE_GROUP_ROLE_role_id ON TB_CORE_GROUP_ROLE(role_id);

-- ===================================================================
-- 3. 기초코드 관리 테이블
-- ===================================================================

-- 기초코드 그룹
CREATE TABLE TB_CORE_CODE_GROUP (
    group_id BIGINT PRIMARY KEY IDENTITY(1,1),
    group_code NVARCHAR(50) NOT NULL UNIQUE,
    group_name NVARCHAR(100) NOT NULL,
    description NVARCHAR(500),
    sort_order INT NOT NULL DEFAULT 0,
    is_system BIT NOT NULL DEFAULT 0,
    is_active BIT NOT NULL DEFAULT 1,
    created_by BIGINT,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_by BIGINT,
    updated_at DATETIME2,
    deleted_at DATETIME2
);

CREATE INDEX IX_TB_CORE_CODE_GROUP_group_code ON TB_CORE_CODE_GROUP(group_code);

-- 기초코드
CREATE TABLE TB_CORE_CODE (
    code_id BIGINT PRIMARY KEY IDENTITY(1,1),
    group_id BIGINT NOT NULL,
    code NVARCHAR(50) NOT NULL,
    code_name NVARCHAR(100) NOT NULL,
    code_value NVARCHAR(100),
    description NVARCHAR(500),
    parent_code_id BIGINT,  -- 계층 코드 지원
    level INT NOT NULL DEFAULT 0,
    sort_order INT NOT NULL DEFAULT 0,
    attribute1 NVARCHAR(200),  -- 확장 속성
    attribute2 NVARCHAR(200),
    attribute3 NVARCHAR(200),
    is_system BIT NOT NULL DEFAULT 0,
    is_active BIT NOT NULL DEFAULT 1,
    created_by BIGINT,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_by BIGINT,
    updated_at DATETIME2,
    deleted_at DATETIME2,
    FOREIGN KEY (group_id) REFERENCES TB_CORE_CODE_GROUP(group_id),
    FOREIGN KEY (parent_code_id) REFERENCES TB_CORE_CODE(code_id),
    UNIQUE (group_id, code)
);

CREATE INDEX IX_TB_CORE_CODE_group_id ON TB_CORE_CODE(group_id);
CREATE INDEX IX_TB_CORE_CODE_parent_code_id ON TB_CORE_CODE(parent_code_id);

-- ===================================================================
-- 4. 메뉴 관리 테이블
-- ===================================================================

-- 메뉴 테이블
CREATE TABLE TB_CORE_MENU (
    menu_id BIGINT PRIMARY KEY IDENTITY(1,1),
    menu_code NVARCHAR(50) NOT NULL UNIQUE,
    menu_name NVARCHAR(100) NOT NULL,
    parent_menu_id BIGINT,
    level INT NOT NULL DEFAULT 0,
    menu_type NVARCHAR(20) NOT NULL,  -- FOLDER, PAGE, ACTION
    menu_path NVARCHAR(200),  -- URL 경로
    component_path NVARCHAR(200),  -- 컴포넌트 경로
    icon NVARCHAR(50),
    sort_order INT NOT NULL DEFAULT 0,
    is_visible BIT NOT NULL DEFAULT 1,
    is_active BIT NOT NULL DEFAULT 1,
    required_permission NVARCHAR(100),  -- 필요 권한
    created_by BIGINT,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_by BIGINT,
    updated_at DATETIME2,
    deleted_at DATETIME2,
    FOREIGN KEY (parent_menu_id) REFERENCES TB_CORE_MENU(menu_id)
);

CREATE INDEX IX_TB_CORE_MENU_parent_menu_id ON TB_CORE_MENU(parent_menu_id);
CREATE INDEX IX_TB_CORE_MENU_menu_path ON TB_CORE_MENU(menu_path);

-- 메뉴-역할 매핑 (메뉴 접근 권한)
CREATE TABLE TB_CORE_MENU_ROLE (
    menu_role_id BIGINT PRIMARY KEY IDENTITY(1,1),
    menu_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    created_by BIGINT,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (menu_id) REFERENCES TB_CORE_MENU(menu_id),
    FOREIGN KEY (role_id) REFERENCES TB_CORE_ROLE(role_id),
    UNIQUE (menu_id, role_id)
);

CREATE INDEX IX_TB_CORE_MENU_ROLE_menu_id ON TB_CORE_MENU_ROLE(menu_id);
CREATE INDEX IX_TB_CORE_MENU_ROLE_role_id ON TB_CORE_MENU_ROLE(role_id);

-- ===================================================================
-- 5. 감사 로그 테이블
-- ===================================================================

-- 감사 로그 테이블 (파티셔닝 필수)
CREATE TABLE TB_CORE_AUDIT_LOG (
    log_id BIGINT PRIMARY KEY IDENTITY(1,1),
    log_date DATETIME2 NOT NULL DEFAULT GETDATE(),  -- 파티션 키
    user_id BIGINT,
    username NVARCHAR(50),
    ip_address NVARCHAR(45),  -- IPv6 지원
    user_agent NVARCHAR(500),
    action_type NVARCHAR(50) NOT NULL,  -- LOGIN, LOGOUT, CREATE, UPDATE, DELETE, READ
    resource_type NVARCHAR(100),  -- USER, MENU, CODE 등
    resource_id NVARCHAR(100),
    method NVARCHAR(10),  -- GET, POST, PUT, DELETE
    endpoint NVARCHAR(500),
    request_params NVARCHAR(MAX),  -- JSON 형식
    response_status INT,
    response_message NVARCHAR(MAX),
    execution_time_ms INT,
    is_success BIT NOT NULL DEFAULT 1,
    error_message NVARCHAR(MAX),
    session_id NVARCHAR(100),
    created_at DATETIME2 NOT NULL DEFAULT GETDATE()
);

CREATE INDEX IX_TB_CORE_AUDIT_LOG_log_date ON TB_CORE_AUDIT_LOG(log_date);
CREATE INDEX IX_TB_CORE_AUDIT_LOG_user_id ON TB_CORE_AUDIT_LOG(user_id);
CREATE INDEX IX_TB_CORE_AUDIT_LOG_action_type ON TB_CORE_AUDIT_LOG(action_type);
CREATE INDEX IX_TB_CORE_AUDIT_LOG_resource ON TB_CORE_AUDIT_LOG(resource_type, resource_id);

-- ===================================================================
-- 6. 다국어 지원 테이블
-- ===================================================================

-- 다국어 메시지 테이블
CREATE TABLE TB_CORE_I18N_MESSAGE (
    message_id BIGINT PRIMARY KEY IDENTITY(1,1),
    message_key NVARCHAR(200) NOT NULL,
    locale NVARCHAR(10) NOT NULL,  -- ko_KR, en_US, ja_JP
    message_value NVARCHAR(1000) NOT NULL,
    category NVARCHAR(50),  -- UI, MESSAGE, ERROR
    description NVARCHAR(500),
    is_active BIT NOT NULL DEFAULT 1,
    created_by BIGINT,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_by BIGINT,
    updated_at DATETIME2,
    UNIQUE (message_key, locale)
);

CREATE INDEX IX_TB_CORE_I18N_MESSAGE_locale ON TB_CORE_I18N_MESSAGE(locale);
CREATE INDEX IX_TB_CORE_I18N_MESSAGE_category ON TB_CORE_I18N_MESSAGE(category);

-- ===================================================================
-- 7. JWT 토큰 관리 테이블
-- ===================================================================

-- Refresh Token 관리 테이블
CREATE TABLE TB_CORE_REFRESH_TOKEN (
    token_id BIGINT PRIMARY KEY IDENTITY(1,1),
    user_id BIGINT NOT NULL,
    token_value NVARCHAR(500) NOT NULL UNIQUE,
    expires_at DATETIME2 NOT NULL,
    ip_address NVARCHAR(45),
    user_agent NVARCHAR(500),
    is_revoked BIT NOT NULL DEFAULT 0,
    revoked_at DATETIME2,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES TB_CORE_USER(user_id)
);

CREATE INDEX IX_TB_CORE_REFRESH_TOKEN_user_id ON TB_CORE_REFRESH_TOKEN(user_id);
CREATE INDEX IX_TB_CORE_REFRESH_TOKEN_expires_at ON TB_CORE_REFRESH_TOKEN(expires_at);
CREATE INDEX IX_TB_CORE_REFRESH_TOKEN_token_value ON TB_CORE_REFRESH_TOKEN(token_value);

-- ===================================================================
-- 8. 테이블 및 프로시저 관리 테이블
-- ===================================================================

-- 테이블 메타데이터 관리
CREATE TABLE TB_CORE_TABLE_METADATA (
    table_id BIGINT PRIMARY KEY IDENTITY(1,1),
    schema_name NVARCHAR(128) NOT NULL,
    table_name NVARCHAR(128) NOT NULL,
    table_type NVARCHAR(20),  -- TABLE, VIEW
    description NVARCHAR(1000),
    module_name NVARCHAR(50),  -- CORE, MES, GROUPWARE
    owner_name NVARCHAR(100),
    row_count BIGINT,
    data_size_mb DECIMAL(18,2),
    last_analyzed_at DATETIME2,
    is_active BIT NOT NULL DEFAULT 1,
    created_by BIGINT,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_by BIGINT,
    updated_at DATETIME2,
    UNIQUE (schema_name, table_name)
);

-- 프로시저 메타데이터 관리
CREATE TABLE TB_CORE_PROCEDURE_METADATA (
    procedure_id BIGINT PRIMARY KEY IDENTITY(1,1),
    schema_name NVARCHAR(128) NOT NULL,
    procedure_name NVARCHAR(128) NOT NULL,
    description NVARCHAR(1000),
    module_name NVARCHAR(50),
    owner_name NVARCHAR(100),
    parameters NVARCHAR(MAX),  -- JSON 형식
    last_executed_at DATETIME2,
    execution_count BIGINT DEFAULT 0,
    avg_execution_time_ms INT,
    is_active BIT NOT NULL DEFAULT 1,
    created_by BIGINT,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_by BIGINT,
    updated_at DATETIME2,
    UNIQUE (schema_name, procedure_name)
);

-- ===================================================================
-- DDL Script Complete
-- ===================================================================
