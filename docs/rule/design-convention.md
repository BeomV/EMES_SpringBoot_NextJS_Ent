# EMES 프로젝트 디자인 컨벤션

> **프로젝트:** EMES Platform (Enterprise MES)
> **프론트엔드 스택:** Next.js 15 / TypeScript 5 / Tailwind CSS 3.4 / shadcn/ui
> **기본 스타일:** shadcn default style, slate base, CSS variables 사용

---

## 1. 색상 토큰

### 1.1 Light Mode (`:root`)

| 토큰 | HSL 값 | 용도 |
|------|--------|------|
| `--background` | 0 0% 100% | 페이지 배경 |
| `--foreground` | 222.2 84% 4.9% | 기본 텍스트 |
| `--primary` | 221.2 83.2% 53.3% | 주요 액션, 브랜드 색상 |
| `--primary-foreground` | 210 40% 98% | primary 위의 텍스트 |
| `--secondary` | 210 40% 96.1% | 보조 버튼, 배경 |
| `--muted` | 210 40% 96.1% | 비활성 배경 |
| `--muted-foreground` | 215.4 16.3% 46.9% | 보조 텍스트, 힌트 |
| `--accent` | 210 40% 96.1% | 호버 배경 |
| `--destructive` | 0 84.2% 60.2% | 삭제, 에러 |
| `--border` | 214.3 31.8% 91.4% | 테두리 |
| `--ring` | 221.2 83.2% 53.3% | 포커스 링 |

### 1.2 Dark Mode (`.dark`)

| 토큰 | HSL 값 |
|------|--------|
| `--background` | 222.2 84% 4.9% |
| `--foreground` | 210 40% 98% |
| `--primary` | 217.2 91.2% 59.8% |
| `--secondary` | 217.2 32.6% 17.5% |
| `--muted` | 217.2 32.6% 17.5% |
| `--muted-foreground` | 215 20.2% 65.1% |
| `--destructive` | 0 62.8% 30.6% |
| `--border` | 217.2 32.6% 17.5% |
| `--ring` | 224.3 76.3% 48% |

### 1.3 사용 규칙

- 색상은 반드시 CSS 변수 토큰으로 사용: `hsl(var(--primary))`
- hex/rgb 직접 사용 금지
- 투명도 조절: Tailwind opacity 문법 사용 (`bg-primary/10`, `text-primary/80`)

---

## 2. 타이포그래피

### 2.1 폰트

| 항목 | 값 |
|------|-----|
| 기본 폰트 | Noto Sans KR |
| 대체 폰트 | system-ui, -apple-system, sans-serif |
| 적용 방식 | next/font/google (자동 최적화) |
| 사용 Weight | 400, 500, 600, 700 |

### 2.2 크기 체계 (Dense UI)

| Tailwind 클래스 | 크기 | 용도 |
|----------------|------|------|
| `text-xs` | 12px | 라벨, 테이블 헤더, 부가 설명, 배지, 검색 필드 |
| `text-sm` | 14px | 본문, 버튼, 테이블 셀, 입력 필드 |
| `text-lg` | 18px | 페이지 제목 (`PageHeader`) |
| `text-xl` | 20px | 통계 수치 |

### 2.3 굵기 체계

| Tailwind 클래스 | 값 | 용도 |
|----------------|-----|------|
| `font-normal` | 400 | 일반 본문, 비활성 중메뉴 |
| `font-medium` | 500 | 버튼, 활성 메뉴, 테이블 헤더 |
| `font-semibold` | 600 | 섹션 제목, 활성 대메뉴 |
| `font-bold` | 700 | 페이지 제목, 로고, 통계 수치 |

---

## 3. 모서리 라운드 (Border Radius)

| 토큰 | 계산 | 결과 | 적용 대상 |
|------|------|------|----------|
| `--radius` | 0.375rem | 6px | 기준값 |
| `rounded-lg` | var(--radius) | 6px | 카드, 다이얼로그 |
| `rounded-md` | calc(var(--radius) - 2px) | 4px | 버튼, 입력, 메뉴 항목 |
| `rounded-sm` | calc(var(--radius) - 4px) | 2px | 작은 요소 |
| `rounded-full` | 9999px | 원형 | 배지, 아바타 |

---

## 4. 여백 체계 (Dense Spacing)

| 용도 | 값 | 설명 |
|------|-----|------|
| 메뉴 항목 패딩 | `px-3 py-2` | 사이드바 메뉴 |
| 카드 내부 패딩 | `p-4` | CardHeader, CardContent |
| 그리드 간격 | `gap-3` | 카드 그리드, 폼 필드 |
| 섹션 간격 | `space-y-4` | 페이지 내 섹션 구분 |
| 메뉴 리스트 간격 | `space-y-1` | 사이드바 메뉴 항목 간 |
| 메인 컨텐츠 패딩 | `p-6` | main 영역 |

---

## 5. 컴포넌트 사이즈 (Dense UI)

### 5.0 높이 규격

| 컴포넌트 | 높이 | Tailwind | 설명 |
|----------|------|---------|------|
| Button (default) | 32px | `h-8` | 기본 버튼 |
| Button (sm) | 28px | `h-7` | 테이블 내부, 보조 액션 |
| Button (lg) | 36px | `h-9` | 강조 액션 |
| Button (icon) | 32px | `h-8 w-8` | 아이콘 전용 |
| Input | 32px | `h-8` | 텍스트 입력 |
| SearchBar (DataTable) | 28px | `h-7` | 테이블 내 검색 |
| TableHead | 36px | `h-9` | 테이블 헤더 행 |
| Label | auto | - | `text-xs font-medium` |

### 5.0.1 아이콘 사이즈

| 위치 | 크기 | Tailwind |
|------|------|---------|
| 버튼/메뉴 아이콘 | 14px | `h-3.5 w-3.5` |
| 독립 아이콘 | 16px | `h-4 w-4` |

---

## 6. 컴포넌트 패턴

### 6.1 활성 상태 (Active State)

```
대메뉴 (단독 링크):  bg-primary text-primary-foreground font-medium
중메뉴 (하위 항목):  bg-primary/10 text-primary font-medium
대메뉴 (하위 활성):  font-semibold text-foreground
```

### 6.2 호버 상태 (Hover State)

```
배경: hover:bg-accent
텍스트: hover:text-accent-foreground
```

### 6.3 비활성 상태 (Disabled State)

```
투명도: disabled:opacity-50
커서: disabled:cursor-not-allowed
```

### 6.4 파괴적 액션 (Destructive)

```
배경: bg-destructive
텍스트: text-destructive 또는 text-destructive-foreground
```

---

## 7. 공통 컴포넌트 (Common Components)

### 7.1 PageHeader

페이지 상단에 사용하는 통일된 헤더 컴포넌트.

```tsx
import { PageHeader } from '@/components/common/PageHeader'

<PageHeader title="사용자 관리" description="사용자 계정 및 권한을 관리합니다.">
  <Button size="sm">사용자 추가</Button>
</PageHeader>
```

| 속성 | 타입 | 설명 |
|------|------|------|
| `title` | string | 페이지 제목 (`text-lg font-semibold`) |
| `description` | string? | 부가 설명 (`text-xs text-muted-foreground`) |
| `children` | ReactNode? | 우측 액션 버튼 영역 |

### 7.2 DataTable

엔터프라이즈 테이블 컴포넌트. 다중 필터, 칼럼 리사이즈, 로딩/빈 상태 내장.

> **참고:** 이 프로젝트에서는 페이지네이션을 사용하지 않습니다. 모든 데이터를 한 번에 표시합니다.

```tsx
import { DataTable, type DataTableColumn } from '@/components/common/DataTable'

const columns: DataTableColumn<User>[] = [
  { key: 'username', header: '사용자 ID', width: '120px' },
  { key: 'email', header: '이메일' },
  { key: 'status', header: '상태', render: (_, row) => <Badge>...</Badge> },
  { key: 'actions', header: '', width: '40px', resizable: false },
]

<DataTable
  columns={columns}
  data={users}
  loading={loading}
  filters={[
    { key: 'username', label: '사용자 ID', type: 'text' },
    { key: 'enabled', label: '상태', type: 'select', options: [
      { label: '활성', value: 'true' },
      { label: '비활성', value: 'false' },
    ]},
  ]}
  onFilter={handleFilter}
  resizableColumns
/>
```

#### 기본 Props

| 속성 | 타입 | 설명 |
|------|------|------|
| `columns` | DataTableColumn[] | 컬럼 정의 (key, header, width, align, render, resizable, minWidth) |
| `data` | T[] | 표시할 데이터 배열 |
| `loading` | boolean? | 로딩 스피너 표시 |
| `emptyMessage` | string? | 빈 상태 메시지 (기본: "데이터가 없습니다.") |
| `actions` | ReactNode? | 우측 액션 버튼 영역 |
| `resizableColumns` | boolean? | 칼럼 리사이즈 활성화 (기본: false) |

#### 필터 Props

| 속성 | 타입 | 설명 |
|------|------|------|
| `filters` | DataTableFilter[]? | 필터 정의 배열 |
| `onFilter` | (filters: Record\<string, string\>) => void | "조회" 클릭 시 콜백 |
| `onSearch` | (v: string) => void | 단일 검색 (filters 미사용 시) |

#### DataTableFilter 인터페이스

| 속성 | 타입 | 설명 |
|------|------|------|
| `key` | string | 필터 키 (API 파라미터명과 일치) |
| `label` | string | 필터 라벨 (한국어) |
| `type` | 'text' \| 'select' | 입력 타입 |
| `placeholder` | string? | 플레이스홀더 |
| `options` | {label, value}[]? | select 타입일 때 옵션 목록 |

#### 칼럼 리사이즈 Props

| 속성 | 타입 | 설명 |
|------|------|------|
| `resizableColumns` | boolean? | 칼럼 리사이즈 활성화 (기본: false) |
| `column.resizable` | boolean? | 개별 칼럼 리사이즈 (기본: true) |
| `column.minWidth` | number? | 최소 너비 px (기본: 50) |

### 7.3 FormField

Label + Input + 에러 메시지를 결합한 폼 필드 래퍼.

```tsx
import { FormField } from '@/components/common/FormField'

<FormField label="사용자 ID" required error={errors.username} />
<FormField label="이메일" type="email" description="회사 이메일을 입력하세요." />
```

| 속성 | 타입 | 설명 |
|------|------|------|
| `label` | string | 필드 라벨 (`text-xs font-medium`) |
| `required` | boolean? | 필수 표시 (`*`) |
| `error` | string? | 에러 메시지 (빨간색) |
| `description` | string? | 도움말 텍스트 |
| + Input props | - | 모든 input 속성 전달 가능 |

### 7.4 Label

독립 라벨 컴포넌트 (`text-xs font-medium`).

```tsx
import { Label } from '@/components/ui/label'

<Label>일반 라벨</Label>
<Label variant="required">필수 라벨</Label>
<Label variant="muted">보조 라벨</Label>
```

### 7.5 Badge 변형

| variant | 색상 | 용도 |
|---------|------|------|
| `default` | primary | 기본 |
| `secondary` | gray | 비활성 |
| `destructive` | red | 에러, 잠금 |
| `success` | green | 활성, 온라인 |
| `warning` | amber | 경고 |
| `outline` | border | 외곽선 |

---

## 8. 사이드바 규칙

| 항목 | 규칙 |
|------|------|
| 너비 | `w-64` (256px) 고정 |
| 위치 | `fixed left-0 top-0`, `z-40` |
| 대메뉴 | 아이콘 + 한국어 라벨 + ChevronDown, 클릭으로 토글 |
| 중메뉴 | 슬라이드 애니메이션 (`max-h` + `transition-all duration-200`) |
| 활성 표시 | 대메뉴: `bg-primary text-primary-foreground`, 중메뉴: `bg-primary/10 text-primary` |
| 현재 경로 | 해당 대메뉴 자동 펼침 |
| 로고 영역 | `h-14`, 하단 `border-b` |
| 하단 정보 | 버전 정보, `border-t` 구분 |

---

## 9. 다크 모드 규칙

| 규칙 | 설명 |
|------|------|
| 전환 방식 | Tailwind `class` 전략 (`darkMode: "class"`) |
| 색상 참조 | 반드시 CSS 변수 토큰 사용 |
| 직접 색상 금지 | `text-green-600` 같은 직접 색상 사용 자제 |
| 테스트 | 모든 컴포넌트는 light/dark 양쪽 확인 필요 |

---

## 10. 레이아웃 규칙

| 영역 | 규격 |
|------|------|
| 사이드바 | `w-64` (256px), fixed |
| 헤더 | `h-14` (56px), fixed, `w-[calc(100%-16rem)]` |
| 메인 콘텐츠 | `ml-64`, `pt-20`, `p-6` |
| 최대 너비 | container `2xl: 1400px` |

---

## 11. 빠른 참조 (Quick Reference)

| 구분 | 규칙 |
|------|------|
| 폰트 | Noto Sans KR (400/500/600/700) |
| 기본 텍스트 크기 | `text-sm` (14px) |
| 라벨 크기 | `text-xs` (12px) |
| 기본 라운드 | `rounded-md` (4px) |
| 카드 라운드 | `rounded-lg` (6px) |
| 버튼 높이 | `h-8` (32px), small: `h-7` (28px) |
| 입력 높이 | `h-8` (32px) |
| 카드 패딩 | `p-4` |
| 섹션 간격 | `space-y-4` |
| 그리드 간격 | `gap-3` |
| 주요 색상 | `primary` (CSS 변수) |
| 활성 상태 | 대메뉴: `bg-primary`, 중메뉴: `bg-primary/10 text-primary` |
| 호버 | `hover:bg-accent` |
| 언어 | 한국어 (`lang="ko"`) |
| 페이지 헤더 | `PageHeader` 컴포넌트 사용 |
| 테이블 | `DataTable` 컴포넌트 사용 |
| 폼 필드 | `FormField` 컴포넌트 사용 |
