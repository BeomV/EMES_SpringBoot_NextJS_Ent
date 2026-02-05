# EMES 프로젝트 환경 설정 가이드

어떤 PC에서든 동일한 개발 환경을 구축할 수 있도록 단계별 설정 방법을 제공합니다.

---

## 📋 목차

1. [필수 소프트웨어 설치](#1-필수-소프트웨어-설치)
2. [프로젝트 클론](#2-프로젝트-클론)
3. [데이터베이스 설정](#3-데이터베이스-설정)
4. [백엔드 설정](#4-백엔드-설정)
5. [프론트엔드 설정](#5-프론트엔드-설정)
6. [실행 및 확인](#6-실행-및-확인)
7. [문제 해결](#7-문제-해결)

---

## 1. 필수 소프트웨어 설치

### 1.1 Java 21
```bash
# 버전 확인
java -version

# 출력 예시: openjdk version "21.0.8" 이상
```

**설치 방법:**
- Windows: https://adoptium.net/ 에서 Temurin JDK 21 다운로드
- macOS: `brew install openjdk@21`
- Linux: `sudo apt install openjdk-21-jdk`

### 1.2 Node.js 18+ (권장: 20 LTS)
```bash
# 버전 확인
node -v
npm -v

# 출력 예시: v20.x.x, 10.x.x 이상
```

**설치 방법:**
- 공식 사이트: https://nodejs.org/
- Windows/macOS: 인스톨러 다운로드
- Linux: `nvm install 20`

### 1.3 Docker Desktop
```bash
# 버전 확인
docker -v
docker-compose -v
```

**설치 방법:**
- Windows/macOS: https://www.docker.com/products/docker-desktop
- Linux: https://docs.docker.com/engine/install/

### 1.4 Git
```bash
# 버전 확인
git --version
```

---

## 2. 프로젝트 클론

```bash
# 저장소 클론
git clone https://github.com/BeomV/EMES_SpringBoot_NextJS_Ent.git
cd EMES_SpringBoot_NextJS_Ent

# 브랜치 확인
git branch
# * main
```

---

## 3. 데이터베이스 설정

### 3.1 Docker로 MS SQL Server 실행

```bash
# Docker Compose로 MSSQL 컨테이너 시작
docker-compose up -d

# 컨테이너 상태 확인
docker ps | grep emes-mssql
```

**주요 설정값:**
- 컨테이너 이름: `emes-mssql`
- 포트: `11433:1433` (로컬 1433 포트 충돌 회피)
- SA 비밀번호: `Admin@12345`
- 데이터베이스: `EMES_DEV`

### 3.2 데이터베이스 초기화

**Windows (Git Bash):**
```bash
# DB 생성
MSYS_NO_PATHCONV=1 docker exec -it emes-mssql \
  /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'Admin@12345' -C \
  -Q "CREATE DATABASE EMES_DEV"

# DDL 실행 (테이블 생성)
MSYS_NO_PATHCONV=1 docker exec -i emes-mssql \
  /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'Admin@12345' -d EMES_DEV -C -I \
  < emes-platform/database/ddl/01_core_tables.sql

# DML 실행 (초기 데이터)
MSYS_NO_PATHCONV=1 docker exec -i emes-mssql \
  /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'Admin@12345' -d EMES_DEV -C -I \
  < emes-platform/database/dml/01_init_data.sql
```

**macOS/Linux:**
```bash
# MSYS_NO_PATHCONV=1 제거하고 실행
docker exec -it emes-mssql \
  /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'Admin@12345' -C \
  -Q "CREATE DATABASE EMES_DEV"

docker exec -i emes-mssql \
  /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'Admin@12345' -d EMES_DEV -C -I \
  < emes-platform/database/ddl/01_core_tables.sql

docker exec -i emes-mssql \
  /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'Admin@12345' -d EMES_DEV -C -I \
  < emes-platform/database/dml/01_init_data.sql
```

### 3.3 연결 확인

```bash
# 사용자 수 확인 (17명이어야 함)
MSYS_NO_PATHCONV=1 docker exec -it emes-mssql \
  /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'Admin@12345' -d EMES_DEV -C \
  -Q "SELECT COUNT(*) FROM TB_CORE_USER WHERE deleted_at IS NULL"
```

---

## 4. 백엔드 설정

### 4.1 Gradle Wrapper 확인

```bash
cd emes-platform

# Windows
./gradlew.bat -v

# macOS/Linux
./gradlew -v
```

> **참고:** `gradle-wrapper.jar`가 없으면 프로젝트에 포함되어 있어야 합니다. 없을 경우:
> ```bash
> gradle wrapper --gradle-version 8.11
> ```

### 4.2 빌드

```bash
# Windows
./gradlew.bat clean build -x test

# macOS/Linux
./gradlew clean build -x test
```

**예상 출력:**
```
BUILD SUCCESSFUL in 15s
15 actionable tasks: 13 executed, 2 up-to-date
```

### 4.3 설정 파일 확인

`emes-platform/emes-api/src/main/resources/application-dev.yml`:

```yaml
spring:
  datasource:
    url: jdbc:sqlserver://localhost:11433;databaseName=EMES_DEV;encrypt=true;trustServerCertificate=true
    username: sa
    password: ${DB_PASSWORD:Admin@12345}
    driver-class-name: com.microsoft.sqlserver.jdbc.SQLServerDriver
```

> **중요:** 로컬 MSSQL이 1433 포트를 사용 중이면 Docker는 11433 포트를 사용합니다.

---

## 5. 프론트엔드 설정

### 5.1 의존성 설치

```bash
cd ../emes-frontend
npm install
```

**예상 출력:**
```
added 500+ packages in 30s
```

### 5.2 환경 변수 설정 (선택사항)

`.env.local` 파일 생성 (기본값 사용 시 생략 가능):

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

---

## 6. 실행 및 확인

### 6.1 백엔드 실행

**터미널 1:**
```bash
cd emes-platform

# Windows
./gradlew.bat :emes-api:bootRun

# macOS/Linux
./gradlew :emes-api:bootRun
```

**예상 출력:**
```
Started EmesApplication in 2.8 seconds (process running for 3.1)
Tomcat started on port 8080 (http)
```

**확인:**
- Swagger UI: http://localhost:8080/swagger-ui.html
- API Health: http://localhost:8080/actuator/health

### 6.2 프론트엔드 실행

**터미널 2:**
```bash
cd emes-frontend
npm run dev
```

**예상 출력:**
```
▲ Next.js 15.1.3
- Local:        http://localhost:3000
✓ Ready in 1.6s
```

**확인:**
- 대시보드: http://localhost:3000
- 사용자 관리: http://localhost:3000/users

---

## 7. 문제 해결

### 7.1 포트 충돌

**증상:** `Port 8080 already in use`

**해결:**
```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID [PID번호] /F

# macOS/Linux
lsof -ti:8080 | xargs kill -9
```

### 7.2 Docker MSSQL 연결 실패

**증상:** `Connection refused` 또는 `Login failed`

**해결:**
```bash
# 컨테이너 재시작
docker-compose down
docker-compose up -d

# 30초 대기 후 재시도 (MSSQL 초기화 시간 필요)
sleep 30
```

### 7.3 Gradle 빌드 실패

**증상:** `Could not resolve dependencies`

**해결:**
```bash
# Gradle 캐시 클리어
./gradlew clean --refresh-dependencies

# 재빌드
./gradlew build -x test
```

### 7.4 npm install 실패

**증상:** `EACCES` 또는 `permission denied`

**해결:**
```bash
# node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install

# 또는 권한 문제 해결
sudo chown -R $(whoami) ~/.npm
```

### 7.5 API 호출 실패 (Network Error)

**증상:** 프론트엔드에서 `AxiosError: Network Error`

**원인:** API 경로 불일치

**확인:**
- Backend API 경로: `/api/v1/admin/*`
- Frontend API 호출 경로가 일치하는지 확인
- CORS 설정 확인 (`http://localhost:3000` 허용 여부)

---

## 8. 기본 로그인 정보

### 관리자 계정
- **사용자 ID:** `admin`
- **비밀번호:** `admin123!`

### 테스트 계정
- **사용자 ID:** `kimjs` (또는 `leemj`, `parksh` 등)
- **비밀번호:** `Pass@1234`

> **참고:** 테스트 계정은 총 16개이며, 모두 동일한 비밀번호(`Pass@1234`)를 사용합니다.

---

## 9. 개발 환경 요약

| 구성 요소 | 기술 스택 | 버전 | 포트 |
|---------|---------|------|------|
| Backend | Spring Boot | 3.4.2 | 8080 |
| Frontend | Next.js | 15.1.3 | 3000 |
| Database | MS SQL Server | 2022 | 11433 |
| Language | Java | 21 | - |
| Build Tool | Gradle | 8.11 | - |
| ORM | MyBatis | 3.0.3 | - |

---

## 10. 다음 단계

환경 설정이 완료되었다면:

1. **기능 확인**
   - [ ] 사용자 관리 페이지에서 17명 사용자 조회
   - [ ] 필터 기능 테스트 (사용자 ID, 이름, 부서 등)
   - [ ] 칼럼 리사이즈 기능 확인

2. **개발 시작**
   - 코드 규칙: `docs/rule/naming-convention.md`
   - 디자인 가이드: `docs/rule/design-convention.md`

3. **Git 워크플로우**
   ```bash
   git checkout -b feature/your-feature
   # 개발 작업
   git add .
   git commit -m "feat: 기능 설명"
   git push origin feature/your-feature
   ```

---

## 📞 지원

문제가 발생하면:
1. 이 문서의 [문제 해결](#7-문제-해결) 섹션 확인
2. 프로젝트 Issues 등록: https://github.com/BeomV/EMES_SpringBoot_NextJS_Ent/issues
3. 로그 확인:
   - Backend: 콘솔 출력 확인
   - Frontend: 브라우저 개발자 도구 Console 탭
   - Database: Docker logs `docker logs emes-mssql`
