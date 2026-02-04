# Product Requirements Document (PRD)
# EMES Platform - Enterprise MES Solution

**Version**: 1.0.0
**Date**: 2026-02-04
**Status**: Draft
**Author**: Development Team

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Product Vision](#product-vision)
3. [Target Users](#target-users)
4. [Business Goals](#business-goals)
5. [Functional Requirements](#functional-requirements)
6. [Non-Functional Requirements](#non-functional-requirements)
7. [Technical Architecture](#technical-architecture)
8. [User Stories](#user-stories)
9. [Success Metrics](#success-metrics)
10. [Release Plan](#release-plan)
11. [Risk Assessment](#risk-assessment)

---

## 1. Executive Summary

EMES Platform은 엔터프라이즈급 제조 실행 시스템(MES)을 위한 통합 솔루션 플랫폼입니다. 모듈형 아키텍처를 기반으로 하루 수백만 건의 데이터를 처리할 수 있으며, 향후 그룹웨어, QMS 등 다양한 비즈니스 애플리케이션으로 확장 가능합니다.

### 핵심 가치 제안

- **확장성**: 하루 수백만 건 데이터 처리 가능
- **모듈성**: Core + Sub-modules 구조로 유연한 확장
- **보안**: JWT 기반 강화된 인증/인가 시스템
- **성능**: 최적화된 데이터베이스 설계 및 검색 엔진 통합
- **사용성**: 직관적인 관리자 인터페이스

---

## 2. Product Vision

### 2.1 비전 선언문

"제조 현장의 모든 데이터를 실시간으로 수집, 분석, 활용하여 스마트 팩토리를 실현하는 통합 플랫폼"

### 2.2 장기 목표 (3년)

- **Year 1**: Core Module + MES Module 완성 및 파일럿 고객 확보
- **Year 2**: 그룹웨어, QMS 모듈 추가 및 시장 확대
- **Year 3**: AI/ML 기반 예측 분석 기능 추가 및 글로벌 진출

---

## 3. Target Users

### 3.1 Primary Users

#### 3.1.1 시스템 관리자
- **Role**: 전체 시스템 설정 및 사용자 관리
- **Needs**:
  - 사용자 및 권한 관리
  - 시스템 모니터링 및 로그 조회
  - 기초 데이터 관리
- **Pain Points**:
  - 복잡한 권한 체계 관리의 어려움
  - 분산된 로그 조회 시스템

#### 3.1.2 부서 관리자
- **Role**: 부서 내 사용자 및 데이터 관리
- **Needs**:
  - 부서원 관리
  - 부서별 통계 조회
  - 승인 프로세스 관리
- **Pain Points**:
  - 실시간 현황 파악의 어려움
  - 수작업 기반 보고서 작성

#### 3.1.3 생산 현장 작업자
- **Role**: 실제 생산 작업 수행 및 데이터 입력
- **Needs**:
  - 간편한 작업 지시 조회
  - 빠른 실적 입력
  - 모바일 접근성
- **Pain Points**:
  - 복잡한 UI로 인한 입력 오류
  - 느린 시스템 응답 속도

### 3.2 Secondary Users

- **경영진**: 대시보드 및 리포트 조회
- **IT 담당자**: 시스템 유지보수 및 통합
- **품질 담당자**: 품질 데이터 분석 및 모니터링

---

## 4. Business Goals

### 4.1 수익 목표

- **Year 1**: 3개 고객사 확보 (각 5억 원), 총 15억 원
- **Year 2**: 10개 고객사 추가 (각 5억 원), 총 65억 원
- **Year 3**: 글로벌 진출, 총 150억 원

### 4.2 시장 목표

- **국내 시장 점유율**: Year 1 - 5%, Year 3 - 15%
- **타겟 산업**: 자동차, 전자, 화학, 제약
- **경쟁 우위**: 모듈형 아키텍처, 합리적 가격, 빠른 구축

### 4.3 사업 KPI

- **고객 만족도**: NPS 50+ 유지
- **시스템 가동률**: 99.9% 이상
- **평균 구축 기간**: 3개월 이내
- **고객 유지율**: 95% 이상

---

## 5. Functional Requirements

### 5.1 Core Module (Phase 1)

#### 5.1.1 사용자 관리 (User Management)

**Priority**: P0 (Must Have)

**기능**:
- 사용자 CRUD (생성, 조회, 수정, 삭제)
- 사용자 검색 및 필터링
- 비밀번호 변경 및 초기화
- 계정 잠금/해제
- 로그인 이력 조회

**Acceptance Criteria**:
- [ ] 관리자는 새로운 사용자를 등록할 수 있다
- [ ] 사용자 목록을 페이징하여 조회할 수 있다
- [ ] 사용자명, 이메일, 부서로 검색할 수 있다
- [ ] 비밀번호는 BCrypt로 암호화되어 저장된다
- [ ] 5회 로그인 실패 시 계정이 자동 잠금된다

#### 5.1.2 사용자 그룹 관리 (User Group Management)

**Priority**: P0 (Must Have)

**기능**:
- 그룹 CRUD
- 계층 구조 그룹 생성 (부모-자식 관계)
- 사용자-그룹 매핑
- 그룹별 통계 조회

**Acceptance Criteria**:
- [ ] 최대 5단계까지 계층 구조를 생성할 수 있다
- [ ] 한 사용자는 여러 그룹에 속할 수 있다
- [ ] 주 그룹(Primary Group)을 지정할 수 있다
- [ ] 그룹 삭제 시 하위 그룹 처리 방식을 선택할 수 있다

#### 5.1.3 권한 관리 (Permission Management)

**Priority**: P0 (Must Have)

**기능**:
- 역할(Role) CRUD
- 권한(Permission) CRUD
- 역할-권한 매핑 (Permission Matrix)
- 사용자/그룹 역할 할당
- 권한 검증 (Method-Level Security)

**Acceptance Criteria**:
- [ ] RBAC (Role-Based Access Control) 모델 지원
- [ ] 사용자 직접 권한 + 그룹 상속 권한 조합
- [ ] 권한 코드 형식: {RESOURCE}_{ACTION} (예: USER_READ)
- [ ] Permission Matrix UI로 직관적인 권한 관리

#### 5.1.4 기초코드 관리 (Common Code Management)

**Priority**: P0 (Must Have)

**기능**:
- 코드 그룹 관리
- 코드 관리 (계층 코드 지원)
- 코드 검색
- 코드 import/export (Excel)

**Acceptance Criteria**:
- [ ] 시스템 코드는 삭제할 수 없다
- [ ] 코드에 3개의 확장 속성(attribute1~3)을 저장할 수 있다
- [ ] 계층 코드(최대 3단계)를 지원한다
- [ ] Excel 업로드로 일괄 등록/수정할 수 있다

#### 5.1.5 메뉴 관리 (Menu Management)

**Priority**: P0 (Must Have)

**기능**:
- 메뉴 CRUD (Tree 구조)
- 메뉴 편집 (Drag & Drop)
- 메뉴-역할 매핑
- 동적 메뉴 렌더링

**Acceptance Criteria**:
- [ ] 메뉴 타입: FOLDER, PAGE, ACTION
- [ ] Drag & Drop으로 메뉴 순서 변경 가능
- [ ] 사용자 권한에 따라 메뉴가 동적으로 표시된다
- [ ] 메뉴 아이콘, 경로, 컴포넌트 경로를 설정할 수 있다

#### 5.1.6 감사 로그 (Audit Log)

**Priority**: P0 (Must Have)

**기능**:
- 모든 API 호출 로깅 (AOP)
- 로그 조회 (Elasticsearch)
- 로그 필터링 (날짜, 사용자, 액션, 리소스)
- 로그 통계 및 대시보드

**Acceptance Criteria**:
- [ ] 모든 CRUD 작업이 자동으로 로깅된다
- [ ] 로그에는 누가(who), 언제(when), 무엇을(what), 어떻게(how) 했는지 기록된다
- [ ] Elasticsearch로 빠른 검색 제공
- [ ] 월별 파티셔닝으로 성능 최적화

#### 5.1.7 다국어 설정 (Internationalization)

**Priority**: P1 (Should Have)

**기능**:
- 다국어 메시지 관리
- Locale 관리 (ko, en, ja)
- Frontend 다국어 적용
- 다국어 import/export (Excel)

**Acceptance Criteria**:
- [ ] 한국어, 영어, 일본어 지원
- [ ] 메시지 키 기반 관리
- [ ] 카테고리별 그룹핑 (UI, MESSAGE, ERROR)
- [ ] 런타임 다국어 변경 가능

#### 5.1.8 테이블/프로시저 관리 (Metadata Management)

**Priority**: P2 (Nice to Have)

**기능**:
- 테이블 메타데이터 조회
- 프로시저 메타데이터 조회
- 실행 통계
- DDL 조회

**Acceptance Criteria**:
- [ ] 시스템 카탈로그에서 메타데이터 자동 수집
- [ ] 테이블별 행 수, 데이터 크기 표시
- [ ] 프로시저 실행 횟수 및 평균 실행 시간 표시
- [ ] 설명(description) 추가 가능

### 5.2 Authentication & Authorization

**Priority**: P0 (Must Have)

**기능**:
- JWT 기반 로그인
- Access Token / Refresh Token 분리
- Token 자동 갱신
- 로그아웃 (Token 무효화)
- 비밀번호 찾기 (이메일 인증)

**Acceptance Criteria**:
- [ ] Access Token: 30분 유효
- [ ] Refresh Token: 7일 유효, HttpOnly Cookie 저장
- [ ] Access Token 만료 시 자동 갱신
- [ ] 로그아웃 시 Refresh Token DB에서 삭제
- [ ] 비밀번호 정책: 최소 8자, 영문+숫자+특수문자

### 5.3 Search Integration (Elasticsearch)

**Priority**: P1 (Should Have)

**기능**:
- 전체 텍스트 검색 (사용자, 코드, 로그 등)
- 실시간 검색 제안 (Autocomplete)
- 집계(Aggregation) 쿼리
- Highlight 표시

**Acceptance Criteria**:
- [ ] 한글 형태소 분석 (Nori Analyzer)
- [ ] 검색 결과 0.5초 이내 응답
- [ ] DB 변경 시 1초 이내 Elasticsearch 동기화
- [ ] 퍼지 검색(Fuzzy Search) 지원

---

## 6. Non-Functional Requirements

### 6.1 Performance

- **API 응답 시간**: p95 < 200ms, p99 < 500ms
- **페이지 로드 시간**: 초기 로드 < 2초, 이후 < 1초
- **동시 사용자**: 최소 1,000명 지원
- **데이터 처리량**: 하루 수백만 건 (최대 10M rows/day)
- **데이터베이스 쿼리**: 단일 쿼리 < 100ms

### 6.2 Scalability

- **수평 확장**: API 서버 무상태(Stateless) 설계로 Scale-out 가능
- **데이터베이스**: 파티셔닝, Read Replica 지원
- **캐싱**: Redis 기반 분산 캐시
- **로드 밸런싱**: Nginx 또는 AWS ELB

### 6.3 Security

- **인증**: JWT (RS256 또는 HS512)
- **인가**: Role-Based Access Control (RBAC)
- **데이터 암호화**:
  - 전송 중: HTTPS (TLS 1.2+)
  - 저장 중: 민감 데이터 AES-256 암호화
- **비밀번호**: BCrypt (strength 12)
- **세션**: Stateless (JWT 기반)
- **감사**: 모든 API 호출 로깅
- **보안 헤더**: CSP, HSTS, X-Frame-Options 등

### 6.4 Availability

- **목표 가동률**: 99.9% (연간 다운타임 < 8.76시간)
- **백업**: 일일 자동 백업, 30일 보관
- **장애 복구**: RTO < 1시간, RPO < 5분
- **Health Check**: Actuator endpoint 제공

### 6.5 Usability

- **접근성**: WCAG 2.1 Level AA 준수
- **반응형 디자인**: 데스크톱, 태블릿, 모바일 지원
- **다국어**: 한국어, 영어, 일본어
- **브라우저 지원**: Chrome, Edge, Safari (최신 2개 버전)

### 6.6 Maintainability

- **코드 품질**: SonarQube 기준 A등급
- **테스트 커버리지**: 최소 80%
- **문서화**: Swagger/OpenAPI 자동 생성
- **로깅**: Structured Logging (JSON)
- **모니터링**: Prometheus + Grafana

### 6.7 Compliance

- **개인정보 보호법**: 준수
- **데이터 보관**: 감사 로그 3년 보관
- **접근 기록**: 모든 개인정보 접근 로깅

---

## 7. Technical Architecture

### 7.1 Technology Stack

**Backend**:
- Framework: Spring Boot 3.4.2
- Language: Java 21
- Database: MS SQL Server
- Search: Elasticsearch 8.x
- Cache: Redis (선택적)
- Build Tool: Maven

**Frontend**:
- Framework: Next.js 15 (App Router)
- Language: TypeScript
- State: Zustand
- HTTP Client: Axios
- UI: Tailwind CSS
- Forms: React Hook Form + Zod

**Infrastructure**:
- Containerization: Docker
- Orchestration: Kubernetes (선택적)
- CI/CD: GitHub Actions
- Monitoring: Prometheus + Grafana

### 7.2 Architecture Pattern

**Modular Monolith** (향후 Microservices 전환 가능)

```
emes-platform/
├── emes-core/           # Core modules
│   ├── common/
│   ├── domain/
│   ├── security/
│   ├── admin/
│   └── search/
├── emes-modules/        # Business modules
│   ├── mes/
│   ├── groupware/
│   └── qms/
└── emes-api/            # API Gateway
```

### 7.3 Data Model

- **사용자 관리**: 8개 테이블
- **권한 관리**: 5개 테이블 (RBAC)
- **기초코드**: 2개 테이블
- **메뉴**: 2개 테이블
- **감사 로그**: 1개 테이블 (월별 파티셔닝)
- **다국어**: 1개 테이블
- **JWT**: 1개 테이블

---

## 8. User Stories

### 8.1 Epic: User Management

**US-001: 사용자 등록**
- **As a** 시스템 관리자
- **I want to** 새로운 사용자를 등록하고
- **So that** 해당 사용자가 시스템에 접근할 수 있다

**Acceptance Criteria**:
- [ ] 필수 정보: 사용자명, 이메일, 비밀번호, 이름
- [ ] 사용자명과 이메일은 중복 불가
- [ ] 비밀번호는 정책 준수 (최소 8자, 영문+숫자+특수문자)
- [ ] 등록 후 이메일 인증 링크 발송 (선택적)

**US-002: 사용자 검색**
- **As a** 시스템 관리자
- **I want to** 사용자명, 이메일, 부서로 사용자를 검색하고
- **So that** 원하는 사용자를 빠르게 찾을 수 있다

**Acceptance Criteria**:
- [ ] 부분 일치 검색 지원 (contains)
- [ ] 여러 조건 조합 가능 (AND 연산)
- [ ] 검색 결과 페이징 (20건/페이지)
- [ ] Elasticsearch 기반 고속 검색

### 8.2 Epic: Permission Management

**US-010: 역할 생성**
- **As a** 시스템 관리자
- **I want to** 새로운 역할을 생성하고 권한을 할당하고
- **So that** 해당 역할을 사용자에게 부여할 수 있다

**Acceptance Criteria**:
- [ ] 역할 코드, 이름, 설명 입력
- [ ] Permission Matrix UI로 권한 선택
- [ ] 시스템 역할은 수정/삭제 불가
- [ ] 역할 복사 기능

**US-011: 사용자에게 역할 할당**
- **As a** 시스템 관리자
- **I want to** 사용자에게 하나 이상의 역할을 할당하고
- **So that** 사용자가 해당 역할의 권한을 갖게 된다

**Acceptance Criteria**:
- [ ] 여러 역할 동시 할당 가능
- [ ] 역할 할당 즉시 적용 (토큰 갱신 필요)
- [ ] 역할 할당/해제 이력 로깅

---

## 9. Success Metrics

### 9.1 Product Metrics

- **MAU (Monthly Active Users)**: 목표 10,000명 (Year 3)
- **DAU (Daily Active Users)**: 목표 3,000명 (Year 3)
- **Session Duration**: 평균 30분 이상
- **Feature Adoption Rate**: 신규 기능 30일 내 50% 사용

### 9.2 Business Metrics

- **Customer Acquisition Cost (CAC)**: < 1억 원/고객
- **Customer Lifetime Value (LTV)**: > 5억 원/고객
- **Churn Rate**: < 5% 연간
- **Net Promoter Score (NPS)**: > 50

### 9.3 Technical Metrics

- **API Success Rate**: > 99.9%
- **Mean Time To Recovery (MTTR)**: < 30분
- **Deployment Frequency**: 주 1회 이상
- **Lead Time for Changes**: < 1일

---

## 10. Release Plan

### Phase 1: Core Infrastructure (Weeks 1-4)

**Deliverables**:
- Backend 멀티모듈 프로젝트 구조
- JWT 인증/인가 시스템
- Frontend 기본 구조 및 인증
- 데이터베이스 스키마

**Milestone**: MVP 기반 구축 완료

### Phase 2: Admin Module (Weeks 5-10)

**Deliverables**:
- 사용자/그룹 관리 (Weeks 5-6)
- 권한 관리 (Weeks 7-8)
- 기초 데이터 관리 (Weeks 9-10)

**Milestone**: 관리자 기능 Beta 출시

### Phase 3: Monitoring & Security (Weeks 11-13)

**Deliverables**:
- 감사 로그 시스템
- Elasticsearch 연동
- 보안 강화

**Milestone**: 보안 감사 통과

### Phase 4: Optimization & Testing (Weeks 14-16)

**Deliverables**:
- 성능 최적화
- 단위/통합 테스트
- API 문서화

**Milestone**: 프로덕션 준비 완료

### Phase 5: MES Module (Weeks 17-18)

**Deliverables**:
- MES 모듈 기반 구축
- 생산 관리 기본 기능

**Milestone**: MES 모듈 Alpha 출시

---

## 11. Risk Assessment

### 11.1 Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| 데이터베이스 성능 저하 | Medium | High | 파티셔닝, 인덱싱, Read Replica |
| Elasticsearch 동기화 지연 | Medium | Medium | 이벤트 기반 비동기 처리, 재시도 로직 |
| JWT Token 탈취 | Low | High | HttpOnly Cookie, Refresh Token DB 저장 |
| API 장애 | Low | High | Health Check, Circuit Breaker, 모니터링 |

### 11.2 Business Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| 고객 요구사항 변경 | High | Medium | Agile 개발, 2주 Sprint |
| 경쟁사 출현 | Medium | High | 차별화 기능 강화, 빠른 출시 |
| 인력 이탈 | Medium | High | 문서화, 코드 리뷰, 지식 공유 |

### 11.3 Compliance Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| 개인정보 유출 | Low | Critical | 암호화, 접근 제어, 감사 로깅 |
| 데이터 손실 | Low | Critical | 자동 백업, 복제, 재해 복구 계획 |

---

## 12. Out of Scope (v1.0)

다음 기능들은 v1.0에서 제외되며 향후 버전에서 구현됩니다:

- 모바일 앱 (iOS, Android)
- AI/ML 기반 예측 분석
- 실시간 알림 (WebSocket)
- SSO (Single Sign-On) 연동
- 외부 시스템 연동 (ERP, SCM)
- 고급 리포팅 (Crystal Reports, Jasper Reports)
- Workflow Engine

---

## 13. Appendix

### 13.1 Glossary

- **MES**: Manufacturing Execution System (제조 실행 시스템)
- **RBAC**: Role-Based Access Control (역할 기반 접근 제어)
- **JWT**: JSON Web Token
- **AOP**: Aspect-Oriented Programming (관점 지향 프로그래밍)
- **CRUD**: Create, Read, Update, Delete

### 13.2 References

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Next.js Documentation](https://nextjs.org/docs)
- [Elasticsearch Guide](https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html)
- [MS SQL Server Documentation](https://docs.microsoft.com/en-us/sql/sql-server/)

---

**Document Approval**:

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Product Owner | | | |
| Tech Lead | | | |
| QA Lead | | | |

**Change History**:

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-02-04 | Dev Team | Initial draft |

---

*End of Document*
