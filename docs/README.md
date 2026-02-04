# EMES Platform Documentation

## 📚 문서 목록

### 1. 제품 문서
- **[PRD (Product Requirements Document)](./PRD.md)**: 제품 요구사항 정의서
  - 프로젝트 비전 및 목표
  - 기능/비기능 요구사항
  - 사용자 스토리
  - 기술 아키텍처
  - 릴리즈 계획

### 2. 아키텍처 문서
- **[아키텍처 설계](../.claude/plans/quiet-jumping-noodle.md)**: 상세 아키텍처 및 구현 계획
  - 전체 시스템 아키텍처
  - 모듈 구조 및 의존성
  - 데이터베이스 설계
  - API 설계 원칙
  - 보안 아키텍처
  - 성능 최적화 전략

### 3. 프로젝트별 문서
- **[Frontend README](../emes-frontend/README.md)**: Next.js 프론트엔드 프로젝트 가이드

### 4. 개발 가이드 (예정)
- API 문서 (Swagger/OpenAPI 자동 생성)
- 개발 환경 설정 가이드
- 코딩 컨벤션
- Git 워크플로우
- 테스트 가이드

### 5. 운영 가이드 (예정)
- 배포 가이드
- 모니터링 가이드
- 장애 대응 매뉴얼
- 백업 및 복구 절차

---

## 📋 빠른 시작

### 프로젝트 개요
EMES Platform은 엔터프라이즈급 제조 실행 시스템(MES)을 위한 통합 솔루션 플랫폼입니다.

### 기술 스택
- **Backend**: Spring Boot 3.4.2 + JDK 21
- **Frontend**: Next.js 15 + TypeScript
- **Database**: MS SQL Server
- **Search**: Elasticsearch 8.x

### 주요 문서 읽기 순서
1. [프로젝트 README](../README.md) - 전체 프로젝트 소개
2. [PRD](./PRD.md) - 제품 요구사항 이해
3. [아키텍처 설계](../.claude/plans/quiet-jumping-noodle.md) - 기술 아키텍처 이해
4. 각 프로젝트별 README - 개발 환경 설정

---

## 📝 문서 작성 규칙

### 파일명 규칙
- 영문 소문자 사용
- 단어 구분은 하이픈(-) 사용
- 예: `api-guide.md`, `deployment-guide.md`

### 문서 구조
```markdown
# 제목

## 목차 (선택)

## 개요

## 상세 내용

## 참고 자료
```

### 버전 관리
- 중요 변경사항은 문서 하단에 Change History 기록
- 승인이 필요한 문서는 Approval Section 포함

---

## 🔗 유용한 링크

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Next.js Documentation](https://nextjs.org/docs)
- [Elasticsearch Guide](https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html)
- [MS SQL Server Documentation](https://docs.microsoft.com/en-us/sql/sql-server/)

---

*Last Updated: 2026-02-04*
