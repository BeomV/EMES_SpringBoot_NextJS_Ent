# Admin API Implementation Guide

이 문서는 EMES Platform의 나머지 Admin API 구현을 위한 패턴 가이드입니다.
User API의 구현 패턴을 기반으로 다른 관리 기능(Role, Permission, Code, Menu 등)을 동일한 방식으로 구현할 수 있습니다.

## 목차

1. [아키텍처 개요](#아키텍처-개요)
2. [구현된 User API 패턴](#구현된-user-api-패턴)
3. [구현 단계](#구현-단계)
4. [나머지 Admin API 목록](#나머지-admin-api-목록)
5. [API 엔드포인트 규칙](#api-엔드포인트-규칙)
6. [코드 예제](#코드-예제)

---

## 아키텍처 개요

### 계층 구조

```
Controller Layer (emes-core-admin)
    ↓
Service Layer (emes-core-admin)
    ↓
Mapper Layer (emes-core-domain)
    ↓
Database (MS SQL Server)
```

### 모듈 구조

```
emes-platform/
├── emes-core/
│   ├── emes-core-common/          # 공통 DTO, Exception
│   ├── emes-core-domain/          # Model, Mapper
│   ├── emes-core-security/        # JWT, Auth
│   └── emes-core-admin/           # Admin APIs
│       ├── controller/            # REST Controllers
│       ├── service/               # Business Logic
│       └── dto/                   # Request/Response DTOs
└── emes-api/                      # Main Application
```

---

## 구현된 User API 패턴

### 파일 구조

```
emes-core-admin/
└── src/main/java/com/emes/core/admin/
    ├── controller/
    │   └── UserController.java
    ├── service/
    │   └── UserService.java
    └── dto/user/
        ├── UserCreateRequest.java
        ├── UserUpdateRequest.java
        ├── UserResponse.java
        ├── UserSearchRequest.java
        └── PasswordChangeRequest.java

emes-core-domain/
└── src/main/
    ├── java/com/emes/core/domain/
    │   ├── model/
    │   │   └── User.java
    │   └── mapper/
    │       └── UserMapper.java
    └── resources/mapper/
        └── UserMapper.xml
```

### Controller 패턴

```java
@Slf4j
@RestController
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping
    @PreAuthorize("hasAuthority('USER_CREATE')")
    public ResponseEntity<ApiResponse<UserResponse>> createUser(
            @Valid @RequestBody UserCreateRequest request) {
        UserResponse response = userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response));
    }

    @GetMapping("/{userId}")
    @PreAuthorize("hasAuthority('USER_READ')")
    public ResponseEntity<ApiResponse<UserResponse>> getUser(@PathVariable Long userId) {
        UserResponse response = userService.getUser(userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // ... 기타 메서드
}
```

### Service 패턴

```java
@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserMapper userMapper;

    @Transactional
    public UserResponse createUser(UserCreateRequest request) {
        // 1. Validation
        // 2. Entity 생성
        // 3. DB 저장
        // 4. Response 변환
    }

    @Transactional(readOnly = true)
    public UserResponse getUser(Long userId) {
        // 조회 및 Response 변환
    }

    @Transactional(readOnly = true)
    public PageResponse<UserResponse> searchUsers(UserSearchRequest request) {
        // 페이징 조회
    }

    // ... 기타 메서드
}
```

### Mapper 패턴

```java
@Mapper
public interface UserMapper {
    User selectById(@Param("userId") Long userId);
    List<User> selectByCondition(...);
    long countByCondition(...);
    int insert(User user);
    int update(User user);
    int softDelete(@Param("userId") Long userId, @Param("deletedAt") LocalDateTime deletedAt);
}
```

---

## 구현 단계

### 1단계: Model 클래스 생성

**위치**: `emes-core-domain/src/main/java/com/emes/core/domain/model/`

```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class YourEntity {
    private Long id;
    private String name;
    // ... 필드

    // 공통 Audit 필드
    private LocalDateTime createdAt;
    private String createdBy;
    private LocalDateTime updatedAt;
    private String updatedBy;
    private LocalDateTime deletedAt;
    private Integer version;
}
```

### 2단계: Mapper 인터페이스 생성

**위치**: `emes-core-domain/src/main/java/com/emes/core/domain/mapper/`

```java
@Mapper
public interface YourEntityMapper {
    YourEntity selectById(@Param("id") Long id);
    List<YourEntity> selectByCondition(...);
    long countByCondition(...);
    int insert(YourEntity entity);
    int update(YourEntity entity);
    int softDelete(@Param("id") Long id, @Param("deletedAt") LocalDateTime deletedAt);
}
```

### 3단계: MyBatis XML 매핑 파일 생성

**위치**: `emes-core-domain/src/main/resources/mapper/`

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-mapper.dtd">

<mapper namespace="com.emes.core.domain.mapper.YourEntityMapper">

    <resultMap id="YourEntityResultMap" type="com.emes.core.domain.model.YourEntity">
        <id property="id" column="id"/>
        <!-- 필드 매핑 -->
    </resultMap>

    <sql id="BaseColumns">
        id, name, ..., created_at, created_by, updated_at, updated_by, deleted_at, version
    </sql>

    <select id="selectById" resultMap="YourEntityResultMap">
        SELECT <include refid="BaseColumns"/>
        FROM TB_CORE_YOUR_ENTITY
        WHERE id = #{id} AND deleted_at IS NULL
    </select>

    <!-- 기타 쿼리 -->
</mapper>
```

### 4단계: DTO 클래스 생성

**위치**: `emes-core-admin/src/main/java/com/emes/core/admin/dto/{entity}/`

각 엔티티별로 다음 DTO를 생성:

1. **{Entity}CreateRequest.java** - 생성 요청
2. **{Entity}UpdateRequest.java** - 수정 요청
3. **{Entity}Response.java** - 응답
4. **{Entity}SearchRequest.java** - 검색 요청

```java
// CreateRequest 예제
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class YourEntityCreateRequest {
    @NotBlank(message = "Name is required")
    private String name;
    // ... 필드 + Validation
}

// Response 예제
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class YourEntityResponse {
    private Long id;
    private String name;
    // ... 필드
    private LocalDateTime createdAt;
    private String createdBy;
}
```

### 5단계: Service 클래스 생성

**위치**: `emes-core-admin/src/main/java/com/emes/core/admin/service/`

```java
@Slf4j
@Service
@RequiredArgsConstructor
public class YourEntityService {

    private final YourEntityMapper mapper;

    @Transactional
    public YourEntityResponse create(YourEntityCreateRequest request) {
        log.info("Creating entity: {}", request.getName());

        // 1. Validation (중복 체크 등)

        // 2. Entity 생성
        YourEntity entity = YourEntity.builder()
                .name(request.getName())
                .createdAt(LocalDateTime.now())
                .createdBy("SYSTEM")  // TODO: 현재 사용자로 변경
                .build();

        // 3. DB 저장
        int inserted = mapper.insert(entity);
        if (inserted == 0) {
            throw new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR);
        }

        return convertToResponse(entity);
    }

    @Transactional(readOnly = true)
    public YourEntityResponse get(Long id) {
        YourEntity entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND);
        }
        return convertToResponse(entity);
    }

    @Transactional(readOnly = true)
    public PageResponse<YourEntityResponse> search(YourEntitySearchRequest request) {
        long total = mapper.countByCondition(...);
        List<YourEntity> entities = mapper.selectByCondition(...);

        List<YourEntityResponse> content = entities.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());

        return PageResponse.of(content, request.getPage(), request.getSize(), total);
    }

    @Transactional
    public YourEntityResponse update(Long id, YourEntityUpdateRequest request) {
        // 업데이트 로직
    }

    @Transactional
    public void delete(Long id) {
        mapper.softDelete(id, LocalDateTime.now());
    }

    private YourEntityResponse convertToResponse(YourEntity entity) {
        return YourEntityResponse.builder()
                .id(entity.getId())
                .name(entity.getName())
                // ... 필드 매핑
                .build();
    }
}
```

### 6단계: Controller 클래스 생성

**위치**: `emes-core-admin/src/main/java/com/emes/core/admin/controller/`

```java
@Slf4j
@RestController
@RequestMapping("/api/v1/admin/your-entities")
@RequiredArgsConstructor
public class YourEntityController {

    private final YourEntityService service;

    @PostMapping
    @PreAuthorize("hasAuthority('YOUR_ENTITY_CREATE')")
    public ResponseEntity<ApiResponse<YourEntityResponse>> create(
            @Valid @RequestBody YourEntityCreateRequest request) {
        YourEntityResponse response = service.create(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('YOUR_ENTITY_READ')")
    public ResponseEntity<ApiResponse<YourEntityResponse>> get(@PathVariable Long id) {
        YourEntityResponse response = service.get(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('YOUR_ENTITY_READ')")
    public ResponseEntity<ApiResponse<PageResponse<YourEntityResponse>>> search(
            @RequestParam(required = false) String name,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "20") Integer size) {

        YourEntitySearchRequest searchRequest = YourEntitySearchRequest.builder()
                .name(name)
                .page(page)
                .size(size)
                .build();

        PageResponse<YourEntityResponse> response = service.search(searchRequest);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('YOUR_ENTITY_UPDATE')")
    public ResponseEntity<ApiResponse<YourEntityResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody YourEntityUpdateRequest request) {
        YourEntityResponse response = service.update(id, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('YOUR_ENTITY_DELETE')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
```

---

## 나머지 Admin API 목록

구현해야 할 나머지 Admin API 목록입니다. 위의 패턴을 따라 구현하세요.

### 1. Role API (역할 관리)

**엔드포인트**: `/api/v1/admin/roles`
**테이블**: `TB_CORE_ROLE`
**권한**: `ROLE_CREATE`, `ROLE_READ`, `ROLE_UPDATE`, `ROLE_DELETE`

**주요 기능**:
- 역할 CRUD
- 역할별 권한 조회
- 역할에 권한 할당/해제

**특수 메서드**:
```java
@PostMapping("/{roleId}/permissions")
public ResponseEntity<ApiResponse<Void>> assignPermissions(
    @PathVariable Long roleId,
    @RequestBody List<Long> permissionIds)

@DeleteMapping("/{roleId}/permissions/{permissionId}")
public ResponseEntity<ApiResponse<Void>> revokePermission(
    @PathVariable Long roleId,
    @PathVariable Long permissionId)

@GetMapping("/{roleId}/permissions")
public ResponseEntity<ApiResponse<List<PermissionResponse>>> getPermissions(
    @PathVariable Long roleId)
```

### 2. Permission API (권한 관리)

**엔드포인트**: `/api/v1/admin/permissions`
**테이블**: `TB_CORE_PERMISSION`
**권한**: `PERMISSION_CREATE`, `PERMISSION_READ`, `PERMISSION_UPDATE`, `PERMISSION_DELETE`

**주요 기능**:
- 권한 CRUD
- 권한 그룹별 조회 (Resource별)
- 권한 검색

### 3. UserGroup API (사용자 그룹 관리)

**엔드포인트**: `/api/v1/admin/user-groups`
**테이블**: `TB_CORE_USER_GROUP`, `TB_CORE_USER_GROUP_MAPPING`
**권한**: `USER_GROUP_CREATE`, `USER_GROUP_READ`, `USER_GROUP_UPDATE`, `USER_GROUP_DELETE`

**주요 기능**:
- 사용자 그룹 CRUD
- 그룹 계층 구조 관리
- 그룹에 사용자 추가/제거
- 그룹 멤버 조회

**특수 메서드**:
```java
@PostMapping("/{groupId}/users")
public ResponseEntity<ApiResponse<Void>> addUsers(
    @PathVariable Long groupId,
    @RequestBody List<Long> userIds)

@DeleteMapping("/{groupId}/users/{userId}")
public ResponseEntity<ApiResponse<Void>> removeUser(
    @PathVariable Long groupId,
    @PathVariable Long userId)

@GetMapping("/{groupId}/users")
public ResponseEntity<ApiResponse<PageResponse<UserResponse>>> getMembers(
    @PathVariable Long groupId,
    @RequestParam(defaultValue = "0") Integer page,
    @RequestParam(defaultValue = "20") Integer size)
```

### 4. Code API (기초코드 관리)

**엔드포인트**: `/api/v1/admin/codes`
**테이블**: `TB_CORE_CODE_GROUP`, `TB_CORE_CODE`
**권한**: `CODE_CREATE`, `CODE_READ`, `CODE_UPDATE`, `CODE_DELETE`

**주요 기능**:
- 코드 그룹 CRUD
- 코드 CRUD
- 계층 코드 지원 (parent_code_id)
- 코드 그룹별 코드 목록 조회

**엔드포인트 예제**:
```
GET    /api/v1/admin/codes/groups           # 코드 그룹 목록
POST   /api/v1/admin/codes/groups           # 코드 그룹 생성
GET    /api/v1/admin/codes/groups/{id}      # 코드 그룹 조회
PUT    /api/v1/admin/codes/groups/{id}      # 코드 그룹 수정
DELETE /api/v1/admin/codes/groups/{id}      # 코드 그룹 삭제

GET    /api/v1/admin/codes                  # 코드 목록
POST   /api/v1/admin/codes                  # 코드 생성
GET    /api/v1/admin/codes/{id}             # 코드 조회
PUT    /api/v1/admin/codes/{id}             # 코드 수정
DELETE /api/v1/admin/codes/{id}             # 코드 삭제
```

### 5. Menu API (메뉴 관리)

**엔드포인트**: `/api/v1/admin/menus`
**테이블**: `TB_CORE_MENU`, `TB_CORE_MENU_ROLE`
**권한**: `MENU_CREATE`, `MENU_READ`, `MENU_UPDATE`, `MENU_DELETE`

**주요 기능**:
- 메뉴 CRUD
- 계층 구조 메뉴 (Tree 구조)
- 메뉴 순서 변경
- 메뉴별 역할 매핑
- 사용자별 접근 가능 메뉴 조회

**특수 메서드**:
```java
@GetMapping("/tree")
public ResponseEntity<ApiResponse<List<MenuTreeNode>>> getMenuTree()

@PatchMapping("/{menuId}/order")
public ResponseEntity<ApiResponse<Void>> updateOrder(
    @PathVariable Long menuId,
    @RequestParam Integer newOrder)

@PostMapping("/{menuId}/roles")
public ResponseEntity<ApiResponse<Void>> assignRoles(
    @PathVariable Long menuId,
    @RequestBody List<Long> roleIds)

@GetMapping("/my-menus")
public ResponseEntity<ApiResponse<List<MenuTreeNode>>> getMyMenus()
```

### 6. AuditLog API (감사 로그 조회)

**엔드포인트**: `/api/v1/admin/audit-logs`
**테이블**: `TB_CORE_AUDIT_LOG` (파티션 테이블)
**권한**: `AUDIT_LOG_READ`

**주요 기능**:
- 감사 로그 조회 (읽기 전용)
- 날짜 범위 검색
- 사용자별, 액션별 필터링
- 로그 통계

**특수 메서드**:
```java
@GetMapping
public ResponseEntity<ApiResponse<PageResponse<AuditLogResponse>>> search(
    @RequestParam(required = false) Long userId,
    @RequestParam(required = false) String action,
    @RequestParam(required = false) String resource,
    @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
    @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
    @RequestParam(defaultValue = "0") Integer page,
    @RequestParam(defaultValue = "20") Integer size)

@GetMapping("/statistics")
public ResponseEntity<ApiResponse<AuditLogStatistics>> getStatistics(
    @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
    @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate)
```

### 7. I18n API (다국어 메시지 관리)

**엔드포인트**: `/api/v1/admin/i18n`
**테이블**: `TB_CORE_I18N_MESSAGE`
**권한**: `I18N_CREATE`, `I18N_READ`, `I18N_UPDATE`, `I18N_DELETE`

**주요 기능**:
- 다국어 메시지 CRUD
- Locale별 메시지 조회
- 메시지 키별 모든 언어 버전 조회

**엔드포인트 예제**:
```
GET    /api/v1/admin/i18n?locale=ko         # 특정 언어의 모든 메시지
GET    /api/v1/admin/i18n/{messageKey}      # 메시지 키의 모든 언어 버전
POST   /api/v1/admin/i18n                   # 메시지 생성
PUT    /api/v1/admin/i18n/{id}              # 메시지 수정
DELETE /api/v1/admin/i18n/{id}              # 메시지 삭제
```

### 8. TableMetadata API (테이블 메타데이터 조회)

**엔드포인트**: `/api/v1/admin/metadata/tables`
**테이블**: `TB_CORE_TABLE_METADATA`
**권한**: `METADATA_READ`

**주요 기능**:
- 테이블 메타데이터 조회 (읽기 전용)
- 테이블 정의 조회
- 컬럼 정보 조회

### 9. ProcedureMetadata API (프로시저 메타데이터 조회)

**엔드포인트**: `/api/v1/admin/metadata/procedures`
**테이블**: `TB_CORE_PROCEDURE_METADATA`
**권한**: `METADATA_READ`

**주요 기능**:
- 프로시저 메타데이터 조회 (읽기 전용)
- 프로시저 정의 조회
- 파라미터 정보 조회

---

## API 엔드포인트 규칙

### RESTful API 설계 원칙

```
GET    /api/v1/admin/{resource}              # 목록 조회 (with 페이징, 정렬, 필터)
POST   /api/v1/admin/{resource}              # 생성
GET    /api/v1/admin/{resource}/{id}         # 단건 조회
PUT    /api/v1/admin/{resource}/{id}         # 전체 수정
PATCH  /api/v1/admin/{resource}/{id}         # 부분 수정
DELETE /api/v1/admin/{resource}/{id}         # 삭제 (Soft Delete)

# 하위 리소스 관계
GET    /api/v1/admin/{resource}/{id}/{sub-resource}
POST   /api/v1/admin/{resource}/{id}/{sub-resource}
DELETE /api/v1/admin/{resource}/{id}/{sub-resource}/{sub-id}
```

### 페이징 파라미터

```
page=0              # 페이지 번호 (0부터 시작)
size=20             # 페이지 크기
sortBy=createdAt    # 정렬 필드
sortDirection=desc  # 정렬 방향 (asc, desc)
```

### 검색 파라미터

각 리소스에 맞는 검색 조건을 Query Parameter로 받습니다:

```
GET /api/v1/admin/users?username=john&department=IT&enabled=true&page=0&size=20
```

---

## 코드 예제

### ErrorCode 추가

`emes-core-common/src/main/java/com/emes/core/common/exception/ErrorCode.java`에 새로운 에러 코드 추가:

```java
// Role (R)
ROLE_NOT_FOUND(404, "R001", "Role not found"),
ROLE_ALREADY_EXISTS(409, "R002", "Role already exists"),

// Permission (P)
PERMISSION_NOT_FOUND(404, "P001", "Permission not found"),
PERMISSION_ALREADY_EXISTS(409, "P002", "Permission already exists"),

// Code (CO)
CODE_NOT_FOUND(404, "CO001", "Code not found"),
CODE_GROUP_NOT_FOUND(404, "CO002", "Code group not found"),

// Menu (M)
MENU_NOT_FOUND(404, "M001", "Menu not found"),
```

### 공통 Validation 패턴

```java
// CreateRequest
@NotBlank(message = "Name is required")
@Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
private String name;

// UpdateRequest
@Size(max = 100, message = "Name must not exceed 100 characters")
private String name;

// SearchRequest
private String name;
private Integer page = 0;
private Integer size = 20;
private String sortBy = "createdAt";
private String sortDirection = "desc";
```

### 중복 체크 패턴

```java
// Service 메서드에서
if (mapper.selectByName(request.getName()) != null) {
    throw new BusinessException(ErrorCode.XXX_ALREADY_EXISTS);
}
```

### Soft Delete 패턴

```java
// Service 메서드
@Transactional
public void delete(Long id) {
    YourEntity entity = mapper.selectById(id);
    if (entity == null) {
        throw new BusinessException(ErrorCode.XXX_NOT_FOUND);
    }

    int deleted = mapper.softDelete(id, LocalDateTime.now());
    if (deleted == 0) {
        throw new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR);
    }
}
```

---

## 테스트 가이드

### 1. API 테스트 순서

1. 데이터베이스 DDL 스크립트 실행 확인
2. Gradle 빌드 테스트
3. Spring Boot 애플리케이션 실행
4. Postman/Swagger로 API 테스트

### 2. 필수 테스트 시나리오

각 API마다 다음을 테스트:

- **Create**: 정상 생성, 중복 에러, Validation 에러
- **Read**: 존재하는 ID 조회, 존재하지 않는 ID 에러
- **List**: 페이징, 정렬, 필터링
- **Update**: 정상 수정, 존재하지 않는 ID 에러
- **Delete**: 정상 삭제, 존재하지 않는 ID 에러

### 3. Swagger UI 접속

애플리케이션 실행 후:

```
http://localhost:8080/swagger-ui.html
```

---

## 구현 체크리스트

각 Admin API 구현 시 다음을 확인하세요:

- [ ] Model 클래스 생성
- [ ] Mapper 인터페이스 생성
- [ ] MyBatis XML 매핑 파일 생성
- [ ] DTO 클래스 생성 (Create, Update, Response, Search)
- [ ] Service 클래스 생성
- [ ] Controller 클래스 생성
- [ ] ErrorCode 추가
- [ ] API 문서 작성 (Swagger 주석)
- [ ] 단위 테스트 작성 (선택)
- [ ] 통합 테스트 (Postman 또는 Swagger)

---

## 추가 참고사항

### 1. 현재 로그인 사용자 정보 가져오기

Service 레이어에서 현재 로그인한 사용자 정보를 가져오는 방법:

```java
import org.springframework.security.core.context.SecurityContextHolder;

// 현재 사용자명 가져오기
String currentUsername = SecurityContextHolder.getContext()
        .getAuthentication()
        .getName();
```

### 2. 계층 구조 데이터 처리

메뉴나 코드처럼 계층 구조가 있는 경우, Recursive Query를 사용하거나 Application Layer에서 Tree를 구성합니다.

**Tree 구조 DTO 예제**:

```java
@Getter
@Builder
public class TreeNode {
    private Long id;
    private String name;
    private Long parentId;
    private Integer level;
    private Integer sortOrder;
    private List<TreeNode> children;
}
```

### 3. 대량 데이터 처리

감사 로그처럼 대량의 데이터를 다룰 때는:

- 적절한 인덱스 생성
- 파티셔닝 활용
- 페이징 필수
- 캐싱 고려 (Redis)

---

## 마무리

이 가이드를 참고하여 나머지 Admin API를 구현하세요. 모든 API는 동일한 패턴을 따르므로, User API를 참고하여 빠르게 구현할 수 있습니다.

구현 중 질문이나 문제가 있으면 다음을 참고하세요:

1. **User API 코드**: 가장 완전한 구현 예제
2. **이 문서**: 전체적인 패턴과 가이드
3. **데이터베이스 DDL**: 테이블 구조 확인

**구현 순서 추천**:

1. Role & Permission (권한 관리가 다른 기능의 기초)
2. UserGroup (사용자 관리 확장)
3. Code (기초 데이터)
4. Menu (메뉴 구조)
5. I18n (다국어)
6. AuditLog (로그 조회)
7. Metadata (메타데이터 조회)

행운을 빕니다! 🚀
