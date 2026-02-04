# EMES 프로젝트 네이밍 컨벤션

> **프로젝트:** EMES Platform (Enterprise MES)
> **기술 스택:** Spring Boot 3.4.2 / Java 21 / Gradle 8.11 / MyBatis 3.0.3 / Next.js 15 / TypeScript 5 / shadcn/ui / MS SQL Server 2019
> **기본 언어:** 한국어 (주석, 문서, 에러 메시지, UI 텍스트 등)

---

## 1. 공통 원칙

| 항목 | 규칙 |
|------|------|
| 기본 네이밍 | **camelCase** 를 주 표기법으로 사용 |
| 모듈 접두사 | `emes-core-admin`, `emes-module-mes` 처럼 **kebab-case** 로 구분 |
| 주석/문서 | 한국어로 작성 (JavaDoc, JSDoc, SQL 주석 모두 동일) |
| 약어 처리 | 2글자 약어도 camelCase 적용 (`userId`, `apiUrl`, `ipAddress`) |
| Boolean 필드 | `is` 접두사 사용 (`isActive`, `isLocked`, `isVisible`) |
| 감사(Audit) 필드 | 모든 엔티티에 `createdBy`, `createdAt`, `updatedBy`, `updatedAt` 포함 |

---

## 2. Backend (Java)

### 2.1 패키지

```
com.emes.core.{모듈}.{계층}
```

| 계층 | 설명 | 예시 |
|------|------|------|
| `controller` | REST API 컨트롤러 | `com.emes.core.admin.controller` |
| `service` | 비즈니스 로직 | `com.emes.core.admin.service` |
| `dto` | 요청/응답 DTO | `com.emes.core.admin.dto.user` |
| `model` | 도메인 모델 (MyBatis VO) | `com.emes.core.domain.model` |
| `mapper` | MyBatis Mapper 인터페이스 | `com.emes.core.domain.mapper` |
| `config` | 설정 클래스 | `com.emes.api.config` |
| `exception` | 예외 클래스 | `com.emes.core.common.exception` |
| `filter` | 필터 | `com.emes.core.security.filter` |
| `jwt` | JWT 관련 | `com.emes.core.security.jwt` |

향후 모듈 추가 시: `com.emes.modules.mes.{계층}`

### 2.2 클래스

| 유형 | 규칙 | 예시 |
|------|------|------|
| Controller | `{도메인}Controller` | `UserController`, `AuthController` |
| Service | `{도메인}Service` | `UserService`, `AuthService` |
| Mapper | `{도메인}Mapper` | `UserMapper` |
| Model (VO) | 도메인 명사 그대로 | `User` |
| 요청 DTO | `{도메인}{동작}Request` | `UserCreateRequest`, `LoginRequest` |
| 응답 DTO | `{도메인}Response` | `UserResponse`, `LoginResponse` |
| 검색 DTO | `{도메인}SearchRequest` | `UserSearchRequest` |
| 공통 응답 | `ApiResponse<T>`, `PageResponse<T>` | - |
| 예외 | `{도메인}Exception` | `BusinessException` |
| 에러 코드 | `ErrorCode` (enum) | - |
| 설정 | `{기능}Config` | `SecurityConfig`, `WebMvcConfig` |
| 필터 | `{기능}Filter` | `JwtAuthenticationFilter` |
| Provider | `{기능}Provider` | `JwtTokenProvider` |

### 2.3 메서드

| 유형 | 패턴 | 예시 |
|------|------|------|
| 생성 | `create{도메인}` | `createUser(UserCreateRequest request)` |
| 단건 조회 | `get{도메인}` | `getUser(Long userId)` |
| 목록 조회 | `search{도메인}s` | `searchUsers(UserSearchRequest request)` |
| 수정 | `update{도메인}` | `updateUser(Long userId, UserUpdateRequest request)` |
| 삭제 | `delete{도메인}` | `deleteUser(Long userId)` |
| 상태 변경 | `toggle{상태}` / `change{속성}` | `toggleAccountLock(...)`, `changePassword(...)` |
| 변환 | `convertTo{타입}` | `convertToResponse(User user)` |
| 검증 | `validate{대상}` | `validateToken(String token)` |

**Mapper 메서드 (MyBatis):**

| 유형 | 패턴 | 예시 |
|------|------|------|
| 단건 조회 | `selectBy{조건}` | `selectById(Long userId)`, `selectByUsername(String username)` |
| 전체 조회 | `selectAll` | `selectAll()` |
| 조건 조회 | `selectByCondition` | `selectByCondition(...)` |
| 카운트 | `countByCondition` | `countByCondition(...)` |
| 삽입 | `insert` | `insert(User user)` |
| 수정 | `update` / `update{필드}` | `update(User user)`, `updatePassword(...)` |
| 논리 삭제 | `softDelete` | `softDelete(Long userId, LocalDateTime deletedAt)` |
| 물리 삭제 | `delete` | `delete(Long userId)` |
| 상태 변경 | `{동작}{대상}` | `lockAccount(...)`, `incrementFailedLoginAttempts(...)` |

### 2.4 변수 / 필드

| 유형 | 규칙 | 예시 |
|------|------|------|
| 인스턴스 변수 | camelCase | `userId`, `displayName`, `accessToken` |
| 상수 | UPPER_SNAKE_CASE | `ROLE_ADMIN`, `USER_NOT_FOUND` |
| Boolean | `is` 접두사 | `isActive`, `isLocked`, `isSystem` |
| 날짜/시간 | `{행위}At` 접미사 | `createdAt`, `updatedAt`, `lastLoginAt`, `passwordChangedAt` |
| 수행자 | `{행위}By` 접미사 | `createdBy`, `updatedBy` |

### 2.5 주석

```java
/**
 * 사용자 관리 API Controller
 */

/**
 * 사용자 생성
 */

// 1. 중복 체크
// 2. User 엔티티 생성
// 3. DB 저장
```

- 클래스/메서드 위에는 JavaDoc(`/** */`) 형태로 한국어 설명
- 로직 흐름은 번호가 매겨진 인라인 주석(`// 1. ...`)으로 단계 구분

### 2.6 에러 코드 체계

```
{카테고리 접두사}{3자리 숫자}
```

| 카테고리 | 접두사 | 예시 |
|---------|--------|------|
| Common | `C` | `C001` (Invalid input parameter) |
| User | `U` | `U001` (User not found) |
| Auth | `A` | `A001` (Invalid token) |
| Role | `R` | `R001` (Role not found) |
| Permission | `P` | `P001` (Permission not found) |
| Code | `CO` | `CO001` (Code not found) |
| Menu | `M` | `M001` (Menu not found) |

ErrorCode enum 값은 UPPER_SNAKE_CASE: `USER_NOT_FOUND`, `USERNAME_ALREADY_EXISTS`

---

## 3. Frontend (TypeScript / React)

### 3.1 파일/폴더 구조

```
emes-frontend/
  app/                    # Next.js App Router (kebab-case 폴더)
    users/page.tsx
    audit-logs/page.tsx
  components/
    layout/               # 레이아웃 컴포넌트 (PascalCase 파일)
      DashboardLayout.tsx
      Header.tsx
      Sidebar.tsx
    ui/                   # shadcn/ui 컴포넌트 (kebab-case 파일)
      button.tsx
      dropdown-menu.tsx
  lib/
    api/                  # API 클라이언트 (camelCase 파일)
      client.ts
      users.ts
    utils.ts
  types/
    api.ts                # 타입 정의 (camelCase 파일)
```

| 유형 | 네이밍 규칙 | 예시 |
|------|------------|------|
| 페이지 폴더 | kebab-case | `users/`, `audit-logs/` |
| 레이아웃 컴포넌트 파일 | PascalCase | `DashboardLayout.tsx`, `Sidebar.tsx` |
| UI 컴포넌트 파일 (shadcn) | kebab-case | `button.tsx`, `dropdown-menu.tsx` |
| API 모듈 파일 | camelCase | `client.ts`, `users.ts` |
| 타입 정의 파일 | camelCase | `api.ts` |
| 유틸리티 파일 | camelCase | `utils.ts` |

### 3.2 컴포넌트

| 유형 | 규칙 | 예시 |
|------|------|------|
| 페이지 컴포넌트 | `{도메인}Page` (default export) | `export default function UsersPage()` |
| 레이아웃 컴포넌트 | `{기능}Layout` | `DashboardLayout` |
| 일반 컴포넌트 | PascalCase | `Header`, `Sidebar` |
| UI 컴포넌트 (shadcn) | PascalCase (export) | `Button`, `Card`, `DropdownMenu` |

### 3.3 함수 / 변수

| 유형 | 규칙 | 예시 |
|------|------|------|
| 이벤트 핸들러 | `handle{동작}` | `handleSearch`, `handleDelete`, `handleLockToggle` |
| 데이터 로딩 | `load{도메인}s` | `loadUsers` |
| 포맷 유틸 | `format{대상}` | `formatDate` |
| 상태 변수 | camelCase | `users`, `loading`, `currentPage`, `totalPages` |
| 검색 조건 | `searchParams` | `searchParams: UserSearchParams` |
| API 객체 | `{도메인}Api` | `usersApi` |
| API 베이스 | UPPER_SNAKE_CASE | `USERS_BASE`, `API_BASE_URL` |

### 3.4 타입/인터페이스

| 유형 | 규칙 | 예시 |
|------|------|------|
| API 응답 | `ApiResponse<T>`, `PageResponse<T>` | - |
| 에러 응답 | `ErrorResponse` | - |
| 도메인 모델 | PascalCase 명사 | `User` |
| 요청 타입 | `{도메인}{동작}Request` | `UserCreateRequest`, `UserUpdateRequest` |
| 검색 파라미터 | `{도메인}SearchParams` | `UserSearchParams` |
| Props 타입 | `{컴포넌트명}Props` | `DashboardLayoutProps` |

### 3.5 API 클라이언트

```typescript
// API 모듈은 객체 리터럴로 그룹핑
export const usersApi = {
  getUsers: async (params) => { ... },
  getUser: async (userId) => { ... },
  createUser: async (data) => { ... },
  updateUser: async (userId, data) => { ... },
  deleteUser: async (userId) => { ... },
  changePassword: async (userId, newPassword) => { ... },
  lockAccount: async (userId) => { ... },
  unlockAccount: async (userId) => { ... },
};
```

---

## 4. Database (MS SQL Server)

### 4.1 테이블

```
TB_{모듈}_{도메인}
```

| 규칙 | 예시 |
|------|------|
| 접두사 `TB_` | 모든 테이블에 적용 |
| 모듈명 | `CORE`, `MES`, `QMS` 등 UPPER_CASE |
| 도메인명 | UPPER_SNAKE_CASE |
| 매핑 테이블 | `TB_{모듈}_{엔티티1}_{엔티티2}` |

```sql
-- 기본 테이블
TB_CORE_USER
TB_CORE_ROLE
TB_CORE_PERMISSION
TB_CORE_CODE_GROUP
TB_CORE_CODE
TB_CORE_MENU
TB_CORE_AUDIT_LOG
TB_CORE_I18N_MESSAGE

-- 매핑 테이블 (N:N)
TB_CORE_USER_ROLE
TB_CORE_USER_GROUP_MAPPING
TB_CORE_ROLE_PERMISSION
TB_CORE_GROUP_ROLE
TB_CORE_MENU_ROLE

-- 메타데이터 테이블
TB_CORE_TABLE_METADATA
TB_CORE_PROCEDURE_METADATA
```

### 4.2 컬럼

| 유형 | 규칙 | 예시 |
|------|------|------|
| 기본 | snake_case | `user_id`, `full_name`, `group_code` |
| PK | `{도메인}_id` | `user_id`, `role_id`, `menu_id` |
| FK | 참조 테이블의 PK 명과 동일 | `user_id`, `role_id`, `parent_menu_id` |
| Boolean | `is_{상태}` | `is_active`, `is_locked`, `is_system`, `is_visible` |
| 날짜/시간 | `{행위}_at` | `created_at`, `updated_at`, `deleted_at`, `last_login_at` |
| 수행자 | `{행위}_by` | `created_by`, `updated_by` |
| 코드값 | `{도메인}_code` | `role_code`, `group_code`, `menu_code` |
| 정렬 | `sort_order` | - |
| 계층 레벨 | `level` | - |
| 부모 참조 | `parent_{도메인}_id` | `parent_menu_id`, `parent_group_id`, `parent_code_id` |
| 버전 | `version` | Optimistic Locking용 |
| 확장 속성 | `attribute{N}` | `attribute1`, `attribute2`, `attribute3` |

### 4.3 인덱스

```
IX_{테이블명}_{컬럼명}
```

| 예시 |
|------|
| `IX_TB_CORE_USER_username` |
| `IX_TB_CORE_USER_email` |
| `IX_TB_CORE_AUDIT_LOG_log_date` |
| `IX_TB_CORE_AUDIT_LOG_resource` (복합 인덱스: `resource_type`, `resource_id`) |

### 4.4 데이터 타입 기준

| 용도 | 타입 | 비고 |
|------|------|------|
| PK | `BIGINT IDENTITY(1,1)` | 자동 증가 |
| 문자열 (일반) | `NVARCHAR(50~500)` | 유니코드 지원 |
| 문자열 (대용량) | `NVARCHAR(MAX)` | JSON 등 |
| Boolean | `BIT` | `DEFAULT 0` 또는 `DEFAULT 1` |
| 날짜/시간 | `DATETIME2` | `DEFAULT GETDATE()` |
| 정수 | `INT` | - |
| 소수 | `DECIMAL(18,2)` | - |

### 4.5 Soft Delete 패턴

```sql
-- 모든 주요 테이블에 deleted_at 컬럼 포함
deleted_at DATETIME2  -- NULL이면 활성, 값이 있으면 삭제됨

-- 조회 시 항상 필터링
WHERE deleted_at IS NULL

-- 인덱스에 필터 조건 적용
CREATE INDEX IX_TB_CORE_USER_username ON TB_CORE_USER(username) WHERE deleted_at IS NULL;
```

---

## 5. API 설계

### 5.1 URL 경로

```
/api/v{버전}/{모듈}/{리소스}
```

| 패턴 | HTTP Method | 예시 |
|------|-------------|------|
| 목록 조회 | `GET` | `/api/v1/admin/users` |
| 단건 조회 | `GET` | `/api/v1/admin/users/{userId}` |
| 생성 | `POST` | `/api/v1/admin/users` |
| 수정 | `PUT` | `/api/v1/admin/users/{userId}` |
| 삭제 | `DELETE` | `/api/v1/admin/users/{userId}` |
| 부분 수정 | `PATCH` | `/api/v1/admin/users/{userId}/password` |
| 상태 변경 | `PATCH` | `/api/v1/admin/users/{userId}/lock` |
| 인증 | `POST` | `/api/v1/auth/login`, `/api/v1/auth/refresh` |
| 헬스체크 | `GET` | `/api/v1/auth/health` |

- 리소스명은 **복수형 소문자** 사용 (`users`, `roles`, `permissions`)
- 경로 변수는 **camelCase** 사용 (`{userId}`, `{roleId}`)
- 하위 액션은 슬래시로 구분 (`/password`, `/lock`, `/unlock`)

### 5.2 요청/응답 필드

모든 JSON 필드는 **camelCase**:

```json
{
  "success": true,
  "message": "Success",
  "data": {
    "userId": 1,
    "username": "admin",
    "displayName": "System Administrator",
    "phoneNumber": "010-1234-5678",
    "accountLocked": false,
    "lastLoginAt": "2025-01-15T10:30:00",
    "createdAt": "2025-01-01T00:00:00"
  },
  "timestamp": "2025-01-15T10:30:00"
}
```

### 5.3 페이징 파라미터

| 파라미터 | 타입 | 기본값 | 설명 |
|---------|------|--------|------|
| `page` | Integer | `0` | 0-based 페이지 번호 |
| `size` | Integer | `20` | 페이지당 항목 수 |
| `sortBy` | String | `createdAt` | 정렬 기준 필드 |
| `sortDirection` | String | `desc` | 정렬 방향 (`asc` / `desc`) |

### 5.4 권한 코드 체계

```
{리소스}_{액션}
```

| 예시 | 설명 |
|------|------|
| `USER_READ` | 사용자 조회 |
| `USER_CREATE` | 사용자 생성 |
| `USER_UPDATE` | 사용자 수정 |
| `USER_DELETE` | 사용자 삭제 |
| `MENU_READ` | 메뉴 조회 |
| `AUDIT_READ` | 감사 로그 조회 |

---

## 6. MyBatis Mapper XML

### 6.1 파일 위치 및 명명

```
src/main/resources/mapper/{도메인}Mapper.xml
```

### 6.2 ResultMap / SQL Fragment

| 유형 | 규칙 | 예시 |
|------|------|------|
| ResultMap ID | `{도메인}ResultMap` | `UserResultMap` |
| SQL Fragment | `BaseColumns` | 공통 컬럼 목록 |
| 프로퍼티 매핑 | camelCase(Java) -> snake_case(DB) | `property="userId" column="user_id"` |

### 6.3 MyBatis XML 주석

```xml
<!-- Result Map -->
<!-- Select by ID -->
<!-- Select by Condition (페이징) -->
<!-- Insert -->
<!-- Soft Delete -->
```

---

## 7. 주석 및 메시지 규칙

### 7.1 코드 주석 (한국어)

```java
/**
 * 사용자 관리 서비스
 */

// 1. 중복 체크
// 2. User 엔티티 생성
// 3. DB 저장
```

```sql
-- 사용자 테이블
-- 감사 로그 테이블 (파티셔닝 필수)
```

### 7.2 로그 메시지 (영어)

```java
log.info("Create user request: {}", request.getUsername());
log.info("User created successfully: {}", user.getUsername());
log.error("Invalid JWT signature: {}", e.getMessage());
log.debug("Getting user: {}", userId);
```

- 로그 메시지는 **영어**로 작성 (운영 환경에서의 로그 검색 편의성)
- `info`: 주요 비즈니스 동작 기록
- `debug`: 상세 디버깅 정보
- `error`: 예외 상황 기록

### 7.3 Validation 메시지 (영어)

```java
@NotBlank(message = "Username is required")
@Size(min = 4, max = 50, message = "Username must be between 4 and 50 characters")
@Email(message = "Invalid email format")
```

### 7.4 ErrorCode 메시지 (영어)

```java
USER_NOT_FOUND(404, "U001", "User not found"),
USERNAME_ALREADY_EXISTS(409, "U002", "Username already exists"),
```

- ErrorCode 메시지는 영어로 작성하되, 클라이언트에 표시할 최종 메시지는 I18N 테이블에서 한국어로 관리

### 7.5 SQL 주석 (한국어)

```sql
-- 사용자 테이블
-- 사용자-그룹 매핑 (N:N)
-- 감사 로그 테이블 (파티셔닝 필수)
-- 계층 구조 지원
-- Optimistic Locking
```

---

## 8. Gradle 모듈 구조

```
emes-platform/                 # 루트 프로젝트
  emes-core/                   # 코어 모듈 그룹
    emes-core-common/          # 공통 DTO, 예외, 유틸
    emes-core-domain/          # 도메인 모델, MyBatis Mapper
    emes-core-security/        # 인증/인가 (JWT, Spring Security)
    emes-core-admin/           # Admin CRUD (Controller, Service, DTO)
    emes-core-search/          # 통합 검색
  emes-api/                    # API Gateway (Application Entry)
  emes-modules/                # 향후 업무 모듈 (예정)
    emes-module-mes/
    emes-module-groupware/
    emes-module-qms/
```

- 모듈명은 **kebab-case**: `emes-core-admin`, `emes-module-mes`
- 그룹/카테고리로 구분: `emes-core-{기능}`, `emes-module-{업무}`

---

## 9. 빠른 참조 요약

| 대상 | 규칙 | 예시 |
|------|------|------|
| Java 클래스 | PascalCase + 접미사 | `UserController`, `UserService` |
| Java 메서드 | camelCase + 동사 | `createUser`, `selectById` |
| Java 변수 | camelCase | `userId`, `accessToken` |
| Java 상수/Enum | UPPER_SNAKE_CASE | `USER_NOT_FOUND`, `ROLE_ADMIN` |
| TS 컴포넌트 | PascalCase | `DashboardLayout`, `UsersPage` |
| TS 함수 | camelCase | `handleSearch`, `loadUsers` |
| TS 인터페이스 | PascalCase | `UserCreateRequest`, `ApiResponse` |
| TS 변수 | camelCase | `currentPage`, `searchParams` |
| TS 상수 | UPPER_SNAKE_CASE | `API_BASE_URL`, `USERS_BASE` |
| DB 테이블 | `TB_{MODULE}_{DOMAIN}` | `TB_CORE_USER` |
| DB 컬럼 | snake_case | `user_id`, `is_active` |
| DB 인덱스 | `IX_{TABLE}_{COLUMN}` | `IX_TB_CORE_USER_email` |
| API 경로 | `/api/v{N}/{module}/{resource}` | `/api/v1/admin/users` |
| API JSON | camelCase | `displayName`, `accountLocked` |
| 주석 | 한국어 | `/** 사용자 관리 서비스 */` |
| 로그 메시지 | 영어 | `log.info("User created: {}")` |
| Gradle 모듈 | kebab-case | `emes-core-admin` |
