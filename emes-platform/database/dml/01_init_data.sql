-- ===================================================================
-- EMES Platform - Initial Data Script
-- Database: MS SQL Server
-- Version: 1.0.0
-- ===================================================================

-- ===================================================================
-- 1. 기본 역할 (Role) 생성
-- ===================================================================

INSERT INTO TB_CORE_ROLE (role_code, role_name, description, is_system, is_active, created_at)
VALUES
    ('ROLE_ADMIN', 'Administrator', '시스템 관리자 역할 - 모든 권한 보유', 1, 1, GETDATE()),
    ('ROLE_USER', 'User', '일반 사용자 역할 - 기본 권한 보유', 1, 1, GETDATE()),
    ('ROLE_MANAGER', 'Manager', '관리자 역할 - 부서 관리 권한 보유', 1, 1, GETDATE());

-- ===================================================================
-- 2. 기본 권한 (Permission) 생성
-- ===================================================================

INSERT INTO TB_CORE_PERMISSION (permission_code, permission_name, resource, action, description, is_active, created_at)
VALUES
    -- 사용자 관리 권한
    ('USER_READ', '사용자 조회', 'USER', 'READ', '사용자 정보 조회 권한', 1, GETDATE()),
    ('USER_WRITE', '사용자 생성/수정', 'USER', 'WRITE', '사용자 생성 및 수정 권한', 1, GETDATE()),
    ('USER_DELETE', '사용자 삭제', 'USER', 'DELETE', '사용자 삭제 권한', 1, GETDATE()),

    -- 그룹 관리 권한
    ('GROUP_READ', '그룹 조회', 'GROUP', 'READ', '그룹 정보 조회 권한', 1, GETDATE()),
    ('GROUP_WRITE', '그룹 생성/수정', 'GROUP', 'WRITE', '그룹 생성 및 수정 권한', 1, GETDATE()),
    ('GROUP_DELETE', '그룹 삭제', 'GROUP', 'DELETE', '그룹 삭제 권한', 1, GETDATE()),

    -- 역할 관리 권한
    ('ROLE_READ', '역할 조회', 'ROLE', 'READ', '역할 정보 조회 권한', 1, GETDATE()),
    ('ROLE_WRITE', '역할 생성/수정', 'ROLE', 'WRITE', '역할 생성 및 수정 권한', 1, GETDATE()),
    ('ROLE_DELETE', '역할 삭제', 'ROLE', 'DELETE', '역할 삭제 권한', 1, GETDATE()),

    -- 권한 관리 권한
    ('PERMISSION_READ', '권한 조회', 'PERMISSION', 'READ', '권한 정보 조회 권한', 1, GETDATE()),
    ('PERMISSION_WRITE', '권한 생성/수정', 'PERMISSION', 'WRITE', '권한 생성 및 수정 권한', 1, GETDATE()),
    ('PERMISSION_DELETE', '권한 삭제', 'PERMISSION', 'DELETE', '권한 삭제 권한', 1, GETDATE()),

    -- 기초코드 관리 권한
    ('CODE_READ', '코드 조회', 'CODE', 'READ', '기초코드 조회 권한', 1, GETDATE()),
    ('CODE_WRITE', '코드 생성/수정', 'CODE', 'WRITE', '기초코드 생성 및 수정 권한', 1, GETDATE()),
    ('CODE_DELETE', '코드 삭제', 'CODE', 'DELETE', '기초코드 삭제 권한', 1, GETDATE()),

    -- 메뉴 관리 권한
    ('MENU_READ', '메뉴 조회', 'MENU', 'READ', '메뉴 정보 조회 권한', 1, GETDATE()),
    ('MENU_WRITE', '메뉴 생성/수정', 'MENU', 'WRITE', '메뉴 생성 및 수정 권한', 1, GETDATE()),
    ('MENU_DELETE', '메뉴 삭제', 'MENU', 'DELETE', '메뉴 삭제 권한', 1, GETDATE()),

    -- 감사 로그 권한
    ('AUDIT_READ', '로그 조회', 'AUDIT', 'READ', '감사 로그 조회 권한', 1, GETDATE()),

    -- 다국어 관리 권한
    ('I18N_READ', '다국어 조회', 'I18N', 'READ', '다국어 메시지 조회 권한', 1, GETDATE()),
    ('I18N_WRITE', '다국어 생성/수정', 'I18N', 'WRITE', '다국어 메시지 생성 및 수정 권한', 1, GETDATE()),
    ('I18N_DELETE', '다국어 삭제', 'I18N', 'DELETE', '다국어 메시지 삭제 권한', 1, GETDATE()),

    -- 테이블/프로시저 관리 권한
    ('METADATA_READ', '메타데이터 조회', 'METADATA', 'READ', '테이블/프로시저 메타데이터 조회 권한', 1, GETDATE()),
    ('METADATA_WRITE', '메타데이터 생성/수정', 'METADATA', 'WRITE', '메타데이터 생성 및 수정 권한', 1, GETDATE());

-- ===================================================================
-- 3. 역할-권한 매핑
-- ===================================================================

-- ROLE_ADMIN: 모든 권한
INSERT INTO TB_CORE_ROLE_PERMISSION (role_id, permission_id, created_at)
SELECT r.role_id, p.permission_id, GETDATE()
FROM TB_CORE_ROLE r
CROSS JOIN TB_CORE_PERMISSION p
WHERE r.role_code = 'ROLE_ADMIN';

-- ROLE_USER: 기본 조회 권한만
INSERT INTO TB_CORE_ROLE_PERMISSION (role_id, permission_id, created_at)
SELECT r.role_id, p.permission_id, GETDATE()
FROM TB_CORE_ROLE r
CROSS JOIN TB_CORE_PERMISSION p
WHERE r.role_code = 'ROLE_USER'
AND p.action = 'READ';

-- ROLE_MANAGER: 조회 및 일부 수정 권한
INSERT INTO TB_CORE_ROLE_PERMISSION (role_id, permission_id, created_at)
SELECT r.role_id, p.permission_id, GETDATE()
FROM TB_CORE_ROLE r
CROSS JOIN TB_CORE_PERMISSION p
WHERE r.role_code = 'ROLE_MANAGER'
AND (p.action IN ('READ', 'WRITE') OR p.permission_code = 'AUDIT_READ');

-- ===================================================================
-- 4. 기본 사용자 생성
-- ===================================================================

-- Admin 계정 생성
-- Password: admin123! (BCrypt 해시 필요 - 실제로는 애플리케이션에서 생성)
INSERT INTO TB_CORE_USER (
    username,
    password,
    email,
    full_name,
    department,
    position,
    is_active,
    is_locked,
    password_changed_at,
    created_at
)
VALUES (
    'admin',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYVR7jjK6.K', -- admin123! (BCrypt)
    'admin@emes.com',
    'System Administrator',
    'IT',
    'Administrator',
    1,
    0,
    GETDATE(),
    GETDATE()
);

-- ===================================================================
-- 5. Admin 계정에 ROLE_ADMIN 할당
-- ===================================================================

INSERT INTO TB_CORE_USER_ROLE (user_id, role_id, created_at)
SELECT u.user_id, r.role_id, GETDATE()
FROM TB_CORE_USER u
CROSS JOIN TB_CORE_ROLE r
WHERE u.username = 'admin'
AND r.role_code = 'ROLE_ADMIN';

-- ===================================================================
-- 6. 기본 사용자 그룹 생성
-- ===================================================================

INSERT INTO TB_CORE_USER_GROUP (group_code, group_name, description, level, sort_order, is_active, created_at)
VALUES
    ('GROUP_ADMIN', 'Administrators', '시스템 관리자 그룹', 0, 1, 1, GETDATE()),
    ('GROUP_DEV', 'Developers', '개발자 그룹', 0, 2, 1, GETDATE()),
    ('GROUP_USER', 'Users', '일반 사용자 그룹', 0, 3, 1, GETDATE());

-- ===================================================================
-- 7. Admin 사용자를 Admin 그룹에 할당
-- ===================================================================

INSERT INTO TB_CORE_USER_GROUP_MAPPING (user_id, group_id, is_primary, created_at)
SELECT u.user_id, g.group_id, 1, GETDATE()
FROM TB_CORE_USER u
CROSS JOIN TB_CORE_USER_GROUP g
WHERE u.username = 'admin'
AND g.group_code = 'GROUP_ADMIN';

-- ===================================================================
-- 8. 기본 코드 그룹 생성
-- ===================================================================

INSERT INTO TB_CORE_CODE_GROUP (group_code, group_name, description, sort_order, is_system, is_active, created_at)
VALUES
    ('COMMON_STATUS', '공통 상태', '공통 상태 코드 그룹', 1, 1, 1, GETDATE()),
    ('USER_STATUS', '사용자 상태', '사용자 상태 코드 그룹', 2, 1, 1, GETDATE()),
    ('MENU_TYPE', '메뉴 타입', '메뉴 타입 코드 그룹', 3, 1, 1, GETDATE());

-- ===================================================================
-- 9. 기본 코드 생성
-- ===================================================================

-- 공통 상태 코드
INSERT INTO TB_CORE_CODE (group_id, code, code_name, code_value, description, sort_order, is_system, is_active, created_at)
SELECT g.group_id, 'ACTIVE', '활성', '1', '활성 상태', 1, 1, 1, GETDATE()
FROM TB_CORE_CODE_GROUP g WHERE g.group_code = 'COMMON_STATUS'
UNION ALL
SELECT g.group_id, 'INACTIVE', '비활성', '0', '비활성 상태', 2, 1, 1, GETDATE()
FROM TB_CORE_CODE_GROUP g WHERE g.group_code = 'COMMON_STATUS';

-- 사용자 상태 코드
INSERT INTO TB_CORE_CODE (group_id, code, code_name, code_value, description, sort_order, is_system, is_active, created_at)
SELECT g.group_id, 'NORMAL', '정상', 'NORMAL', '정상 상태', 1, 1, 1, GETDATE()
FROM TB_CORE_CODE_GROUP g WHERE g.group_code = 'USER_STATUS'
UNION ALL
SELECT g.group_id, 'LOCKED', '잠금', 'LOCKED', '계정 잠금 상태', 2, 1, 1, GETDATE()
FROM TB_CORE_CODE_GROUP g WHERE g.group_code = 'USER_STATUS'
UNION ALL
SELECT g.group_id, 'SUSPENDED', '정지', 'SUSPENDED', '계정 정지 상태', 3, 1, 1, GETDATE()
FROM TB_CORE_CODE_GROUP g WHERE g.group_code = 'USER_STATUS';

-- 메뉴 타입 코드
INSERT INTO TB_CORE_CODE (group_id, code, code_name, code_value, description, sort_order, is_system, is_active, created_at)
SELECT g.group_id, 'FOLDER', '폴더', 'FOLDER', '폴더 타입 메뉴', 1, 1, 1, GETDATE()
FROM TB_CORE_CODE_GROUP g WHERE g.group_code = 'MENU_TYPE'
UNION ALL
SELECT g.group_id, 'PAGE', '페이지', 'PAGE', '페이지 타입 메뉴', 2, 1, 1, GETDATE()
FROM TB_CORE_CODE_GROUP g WHERE g.group_code = 'MENU_TYPE'
UNION ALL
SELECT g.group_id, 'ACTION', '액션', 'ACTION', '액션 타입 메뉴', 3, 1, 1, GETDATE()
FROM TB_CORE_CODE_GROUP g WHERE g.group_code = 'MENU_TYPE';

-- ===================================================================
-- 10. 기본 메뉴 생성
-- ===================================================================

-- 최상위 메뉴
INSERT INTO TB_CORE_MENU (menu_code, menu_name, menu_type, menu_path, icon, sort_order, is_visible, is_active, created_at)
VALUES
    ('MENU_ADMIN', 'Admin', 'FOLDER', '/admin', 'shield', 1, 1, 1, GETDATE()),
    ('MENU_MES', 'MES', 'FOLDER', '/mes', 'factory', 2, 1, 1, GETDATE());

-- Admin 하위 메뉴
INSERT INTO TB_CORE_MENU (menu_code, menu_name, parent_menu_id, level, menu_type, menu_path, icon, sort_order, is_visible, is_active, required_permission, created_at)
SELECT 'MENU_ADMIN_DASHBOARD', 'Dashboard', menu_id, 1, 'PAGE', '/admin/dashboard', 'dashboard', 1, 1, 1, NULL, GETDATE()
FROM TB_CORE_MENU WHERE menu_code = 'MENU_ADMIN'
UNION ALL
SELECT 'MENU_ADMIN_USERS', 'Users', menu_id, 1, 'PAGE', '/admin/users', 'users', 2, 1, 1, 'USER_READ', GETDATE()
FROM TB_CORE_MENU WHERE menu_code = 'MENU_ADMIN'
UNION ALL
SELECT 'MENU_ADMIN_GROUPS', 'Groups', menu_id, 1, 'PAGE', '/admin/groups', 'users-group', 3, 1, 1, 'GROUP_READ', GETDATE()
FROM TB_CORE_MENU WHERE menu_code = 'MENU_ADMIN'
UNION ALL
SELECT 'MENU_ADMIN_PERMISSIONS', 'Permissions', menu_id, 1, 'PAGE', '/admin/permissions', 'key', 4, 1, 1, 'PERMISSION_READ', GETDATE()
FROM TB_CORE_MENU WHERE menu_code = 'MENU_ADMIN'
UNION ALL
SELECT 'MENU_ADMIN_CODES', 'Codes', menu_id, 1, 'PAGE', '/admin/codes', 'code', 5, 1, 1, 'CODE_READ', GETDATE()
FROM TB_CORE_MENU WHERE menu_code = 'MENU_ADMIN'
UNION ALL
SELECT 'MENU_ADMIN_MENUS', 'Menus', menu_id, 1, 'PAGE', '/admin/menus', 'menu', 6, 1, 1, 'MENU_READ', GETDATE()
FROM TB_CORE_MENU WHERE menu_code = 'MENU_ADMIN'
UNION ALL
SELECT 'MENU_ADMIN_AUDIT', 'Audit Logs', menu_id, 1, 'PAGE', '/admin/audit-logs', 'file-text', 7, 1, 1, 'AUDIT_READ', GETDATE()
FROM TB_CORE_MENU WHERE menu_code = 'MENU_ADMIN'
UNION ALL
SELECT 'MENU_ADMIN_I18N', 'I18N', menu_id, 1, 'PAGE', '/admin/i18n', 'globe', 8, 1, 1, 'I18N_READ', GETDATE()
FROM TB_CORE_MENU WHERE menu_code = 'MENU_ADMIN';

-- ===================================================================
-- 11. 기본 다국어 메시지 생성
-- ===================================================================

-- 한국어
INSERT INTO TB_CORE_I18N_MESSAGE (message_key, locale, message_value, category, is_active, created_at)
VALUES
    ('common.button.save', 'ko_KR', '저장', 'UI', 1, GETDATE()),
    ('common.button.cancel', 'ko_KR', '취소', 'UI', 1, GETDATE()),
    ('common.button.delete', 'ko_KR', '삭제', 'UI', 1, GETDATE()),
    ('common.button.edit', 'ko_KR', '수정', 'UI', 1, GETDATE()),
    ('common.message.success', 'ko_KR', '성공적으로 처리되었습니다.', 'MESSAGE', 1, GETDATE()),
    ('common.message.error', 'ko_KR', '오류가 발생했습니다.', 'ERROR', 1, GETDATE());

-- 영어
INSERT INTO TB_CORE_I18N_MESSAGE (message_key, locale, message_value, category, is_active, created_at)
VALUES
    ('common.button.save', 'en_US', 'Save', 'UI', 1, GETDATE()),
    ('common.button.cancel', 'en_US', 'Cancel', 'UI', 1, GETDATE()),
    ('common.button.delete', 'en_US', 'Delete', 'UI', 1, GETDATE()),
    ('common.button.edit', 'en_US', 'Edit', 'UI', 1, GETDATE()),
    ('common.message.success', 'en_US', 'Successfully processed.', 'MESSAGE', 1, GETDATE()),
    ('common.message.error', 'en_US', 'An error occurred.', 'ERROR', 1, GETDATE());

-- 일본어
INSERT INTO TB_CORE_I18N_MESSAGE (message_key, locale, message_value, category, is_active, created_at)
VALUES
    ('common.button.save', 'ja_JP', '保存', 'UI', 1, GETDATE()),
    ('common.button.cancel', 'ja_JP', 'キャンセル', 'UI', 1, GETDATE()),
    ('common.button.delete', 'ja_JP', '削除', 'UI', 1, GETDATE()),
    ('common.button.edit', 'ja_JP', '編集', 'UI', 1, GETDATE()),
    ('common.message.success', 'ja_JP', '正常に処理されました。', 'MESSAGE', 1, GETDATE()),
    ('common.message.error', 'ja_JP', 'エラーが発生しました。', 'ERROR', 1, GETDATE());

-- ===================================================================
-- Initial Data Script Complete
-- ===================================================================
