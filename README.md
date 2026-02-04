# EMES Platform

**Enterprise Manufacturing Execution System - Integrated Solution Platform**

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4.2-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Java](https://img.shields.io/badge/Java-21-orange.svg)](https://openjdk.java.net/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)

---

## 🎯 프로젝트 개요

EMES Platform은 **하루 수백만 건의 데이터를 처리**할 수 있는 엔터프라이즈급 제조 실행 시스템(MES)입니다. 모듈형 아키텍처를 기반으로 향후 그룹웨어, QMS 등 다양한 비즈니스 애플리케이션으로 확장 가능합니다.

### 핵심 특징

- 🚀 **고성능**: 하루 수백만 건 데이터 처리, API 응답 시간 < 200ms
- 🔐 **강화된 보안**: JWT 기반 인증/인가, RBAC 권한 관리
- 🔍 **전체 텍스트 검색**: Elasticsearch 통합 고속 검색
- 📦 **모듈형 아키텍처**: Core + Sub-modules 구조로 유연한 확장
- 🌐 **다국어 지원**: 한국어, 영어, 일본어
- 📊 **실시간 모니터링**: Prometheus + Grafana 통합

---

## 🏗️ 아키텍처

### 기술 스택

#### Backend
- **Framework**: Spring Boot 3.4.2
- **Language**: Java 21
- **Database**: MS SQL Server
- **Search Engine**: Elasticsearch 8.x
- **Security**: Spring Security + JWT
- **API**: RESTful API
- **ORM**: MyBatis 3.0.3
- **Build Tool**: Gradle 8.11

#### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **State Management**: Zustand
- **HTTP Client**: Axios
- **UI Framework**: Tailwind CSS
- **Form Handling**: React Hook Form + Zod

#### Infrastructure
- **Cache**: Redis (선택적)
- **Monitoring**: Prometheus + Grafana
- **Logging**: Logback + ELK Stack (선택적)

### 모듈 구조

```
emes-platform/
├── emes-core/              # Core 모듈 (필수)
│   ├── emes-core-common/   # 공통 유틸리티
│   ├── emes-core-domain/   # MyBatis Mapper
│   ├── emes-core-security/ # JWT 인증/인가
│   ├── emes-core-admin/    # 관리자 기능
│   └── emes-core-search/   # Elasticsearch
├── emes-modules/           # Sub 모듈 (확장)
│   ├── emes-module-mes/    # MES 모듈
│   ├── emes-module-groupware/  # 그룹웨어 (예정)
│   └── emes-module-qms/    # QMS (예정)
└── emes-api/               # API Gateway
```

---

## 🚀 빠른 시작

### 사전 요구사항

- **JDK 21** 이상
- **Node.js 18** 이상
- **MS SQL Server** 2019 이상
- **Gradle 8.11** (Wrapper 포함)
- **Elasticsearch 8.x** (선택적)

### 1. 데이터베이스 설정

```sql
-- MS SQL Server에서 실행
CREATE DATABASE EMES_DEV;
GO

USE EMES_DEV;
GO

-- DDL 실행
-- emes-platform/database/ddl/01_core_tables.sql

-- DML 실행 (초기 데이터)
-- emes-platform/database/dml/01_init_data.sql
```

### 2. Backend 실행

```bash
# 프로젝트 루트에서
cd emes-platform

# 전체 빌드
mvn clean install

# API 서버 실행
cd emes-api
mvn spring-boot:run
```

**Backend 접속**:
- API 서버: http://localhost:8080
- Swagger UI: http://localhost:8080/swagger-ui.html
- Actuator Health: http://localhost:8080/actuator/health

### 3. Frontend 실행

```bash
# 프론트엔드 디렉토리로 이동
cd emes-frontend

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

**Frontend 접속**:
- Dev 서버: http://localhost:3000

### 4. 로그인

**Admin 계정**:
- Username: `admin`
- Password: `admin123!`

---

## 📚 문서

### 주요 문서
- **[PRD (제품 요구사항 정의서)](./docs/PRD.md)**: 프로젝트 비전, 기능 요구사항, 사용자 스토리
- **[아키텍처 설계](./.claude/plans/quiet-jumping-noodle.md)**: 상세 기술 아키텍처 및 구현 계획
- **[문서 인덱스](./docs/README.md)**: 모든 문서 목록 및 가이드

### 프로젝트별 문서
- **[Frontend README](./emes-frontend/README.md)**: Next.js 프로젝트 가이드

---

## 🗂️ 프로젝트 구조

```
EMES/
├── emes-platform/          # Backend (Spring Boot)
│   ├── pom.xml            # Parent POM
│   ├── emes-core/         # Core 모듈
│   ├── emes-modules/      # Sub 모듈
│   ├── emes-api/          # API 실행 모듈
│   └── database/          # DB 스크립트
│       ├── ddl/           # DDL 스크립트
│       └── dml/           # DML 스크립트
├── emes-frontend/         # Frontend (Next.js)
│   ├── app/               # App Router
│   ├── components/        # 재사용 컴포넌트
│   ├── lib/               # 유틸리티
│   ├── store/             # 상태 관리
│   └── types/             # TypeScript 타입
├── docs/                  # 문서
│   ├── README.md          # 문서 인덱스
│   └── PRD.md             # 제품 요구사항 정의서
└── README.md              # 이 파일
```

---

## 🎯 주요 기능

### Core Module (관리자 기능)

1. **사용자 관리**
   - 사용자 CRUD
   - 사용자 검색 (Elasticsearch)
   - 비밀번호 관리
   - 계정 잠금/해제

2. **사용자 그룹 관리**
   - 계층 구조 그룹 관리
   - 사용자-그룹 매핑

3. **권한 관리 (RBAC)**
   - 역할(Role) 관리
   - 권한(Permission) 관리
   - 역할-권한 매핑
   - 사용자/그룹 역할 할당

4. **기초코드 관리**
   - 코드 그룹 및 코드 관리
   - 계층 코드 지원

5. **메뉴 관리**
   - Tree 구조 메뉴 관리
   - 동적 메뉴 렌더링

6. **감사 로그**
   - 모든 API 호출 로깅
   - Elasticsearch 기반 검색

7. **다국어 설정**
   - 한국어, 영어, 일본어 지원

8. **테이블/프로시저 관리**
   - 메타데이터 조회
   - 실행 통계

---

## 🔐 보안

- **인증**: JWT (Access Token + Refresh Token)
- **인가**: Role-Based Access Control (RBAC)
- **비밀번호**: BCrypt (strength 12)
- **데이터 암호화**: AES-256 (민감 데이터)
- **보안 헤더**: CSP, HSTS, X-Frame-Options
- **감사 로깅**: 모든 API 호출 및 데이터 변경 이력

---

## 📈 성능

- **API 응답 시간**: p95 < 200ms
- **동시 사용자**: 1,000명 이상
- **데이터 처리량**: 하루 수백만 건
- **가동률**: 99.9% 목표
- **데이터베이스**: 파티셔닝, 인덱싱, Read Replica

---

## 🛠️ 개발 환경

### 환경 변수 설정

**Backend** (`emes-platform/emes-api/src/main/resources/application-dev.yml`):
```yaml
spring:
  datasource:
    url: jdbc:sqlserver://localhost:1433;databaseName=EMES_DEV
    username: sa
    password: ${DB_PASSWORD}
```

**Frontend** (`emes-frontend/.env.local`):
```bash
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

### 빌드

**Backend**:
```bash
cd emes-platform
mvn clean package
```

**Frontend**:
```bash
cd emes-frontend
npm run build
```

---

## 🧪 테스트

```bash
# Backend 테스트
cd emes-platform
mvn test

# Frontend 테스트
cd emes-frontend
npm run test
```

---

## 📦 배포

### Docker (예정)
```bash
# Backend
docker build -t emes-api:latest ./emes-platform

# Frontend
docker build -t emes-frontend:latest ./emes-frontend
```

---

## 🗓️ 로드맵

### Phase 1: Core Infrastructure (4주) - ✅ 완료
- Backend 멀티모듈 프로젝트 구조
- JWT 인증/인가 시스템
- Frontend 기본 구조

### Phase 2: Admin Module (6주) - 🚧 진행 중
- 사용자/그룹 관리
- 권한 관리
- 기초 데이터 관리

### Phase 3: Monitoring & Security (3주)
- 감사 로그 시스템
- Elasticsearch 연동

### Phase 4: Optimization & Testing (3주)
- 성능 최적화
- 테스트 및 문서화

### Phase 5: MES Module (2주)
- MES 모듈 기반 구축

---

## 🤝 기여

이 프로젝트는 회사 내부 프로젝트입니다.

---

## 📝 라이선스

Proprietary - All Rights Reserved

---

## 📞 문의

프로젝트 관련 문의사항이 있으시면 개발팀에 연락주세요.

---

## 📊 프로젝트 상태

- **버전**: 1.0.0-SNAPSHOT
- **상태**: 개발 중 (Phase 1 완료)
- **마지막 업데이트**: 2026-02-04

---

*Built with ❤️ by EMES Development Team*
