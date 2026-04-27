# LiveClass — 다단계 수강 신청 폼 (FE-A)

## 프로젝트 개요

온라인 교육 플랫폼의 수강 신청 흐름을 3단계 멀티스텝 폼으로 구현한 프론트엔드 과제입니다.

- **1단계**: 카테고리별 강의 목록에서 강의 선택 + 신청 유형(개인/단체) 선택
- **2단계**: 신청 유형에 따라 조건부로 수강생 정보 입력 (단체 신청 시 참가자 명단 포함)
- **3단계**: 전체 입력 내용 확인 + 이용약관 동의 + 제출

---

## 기술 스택

| 항목 | 선택 | 이유 |
|------|------|------|
| 프레임워크 | Next.js 16 (App Router) | 과제 권장 스택. API Route로 Mock 서버를 같은 프로젝트에서 운영 가능 |
| 언어 | TypeScript | 필수 요건. discriminated union으로 개인/단체 타입 안전하게 분리 |
| 서버 상태 | TanStack Query v5 | 과제 권장 스택. 강의 목록 캐싱, 로딩/에러 상태 관리 |
| 클라이언트 상태 | Zustand | 스텝 간 폼 데이터 공유. persist 미들웨어로 localStorage 임시 저장 기본 내장 |
| 폼 관리 | React Hook Form | 비제어 컴포넌트 기반으로 성능 우수, Zod resolver 연동 용이 |
| 유효성 검증 | Zod | 스키마 기반 검증으로 타입 추론 자동화. discriminatedUnion으로 개인/단체 스키마 분리 |
| 스타일 | Tailwind CSS v4 | 유틸리티 클래스로 빠른 UI 구현 |
| Mock API | Next.js API Routes | 별도 서버 불필요, 과제 명세 스키마를 그대로 구현 |

---

## 실행 방법

```bash
# 1. 저장소 클론
git clone https://github.com/leehyojinn/LiveClass.git
cd LiveClass

# 2. 의존성 설치
npm install

# 3. 개발 서버 실행
npm run dev
```

브라우저에서 `http://localhost:3000` 접속 시 `/enrollment`로 자동 리다이렉트됩니다.

> **Mock API**는 별도 설정 없이 Next.js API Routes(`/api/courses`, `/api/enrollments`)로 동작합니다.

---

## 프로젝트 구조 설명

```
├── app/
│   ├── api/
│   │   ├── courses/route.ts       # GET /api/courses (강의 목록 Mock)
│   │   └── enrollments/route.ts   # POST /api/enrollments (신청 제출 Mock)
│   ├── enrollment/
│   │   ├── page.tsx               # 메인 수강 신청 페이지 (3단계 폼)
│   │   └── complete/page.tsx      # 신청 완료 페이지
│   ├── layout.tsx
│   ├── page.tsx                   # / → /enrollment 리다이렉트
│   └── providers.tsx              # TanStack Query Provider
├── components/
│   ├── enrollment/
│   │   ├── Step1CourseSelection.tsx   # 1단계: 강의 선택
│   │   ├── Step2ApplicantInfo.tsx     # 2단계: 수강생 정보
│   │   └── Step3Review.tsx            # 3단계: 확인 및 제출
│   └── ui/
│       ├── FormField.tsx          # 공통 입력 필드 컴포넌트
│       └── StepIndicator.tsx      # 진행 단계 표시
├── hooks/
│   └── useBeforeUnload.ts         # 이탈 방지 훅
├── lib/
│   ├── queries/
│   │   ├── courses.ts             # useCoursesQuery
│   │   └── enrollments.ts         # useEnrollmentMutation
│   ├── validations/
│   │   ├── step1Schema.ts         # 1단계 Zod 스키마
│   │   ├── step2Schema.ts         # 2단계 Zod 스키마 (개인/단체 분리)
│   │   └── step3Schema.ts         # 3단계 Zod 스키마
│   └── utils.ts                   # formatPrice, formatDate, cn 등
├── store/
│   └── enrollmentStore.ts         # Zustand 전역 폼 상태
└── types/
    └── enrollment.ts              # 도메인 타입 정의
```

---

## 요구사항 해석 및 가정

### 애매한 지점 처리

**1. 단체 → 개인 전환 시 데이터 처리**
- 2단계에서 데이터를 입력한 상태에서 신청 유형을 변경하면 확인 대화상자를 표시합니다.
- 사용자가 확인하면 Zustand 스토어의 `step2` 데이터를 `null`로 초기화합니다.
- 사용자가 취소하면 기존 유형을 유지합니다.

**2. 참가자 명단 이메일 중복 처리**
- Zod `superRefine`으로 참가자 배열 내 중복 이메일을 검증합니다.
- 중복된 이메일이 있는 행에 개별 에러 메시지를 표시합니다.

**3. 정원이 거의 찬 강의 UX**
- 정원 90% 이상: "마감 임박" 경고 배너를 카드에 표시합니다.
- 정원 100%: 카드 선택 자체를 비활성화(disabled)합니다.
- API에서 `COURSE_FULL` 에러 반환 시 강의 재선택 링크를 제공합니다.

---

## 설계 결정과 이유

### 폼 상태 관리: Zustand + React Hook Form 분리

- **React Hook Form**: 각 스텝의 폼 내부 상태(입력값, 에러, dirty 상태)를 담당합니다. 비제어 컴포넌트 기반으로 성능이 우수하며, blur 시 개별 검증(`mode: "onBlur"`)이 용이합니다.
- **Zustand**: 스텝 간 데이터 전달을 담당합니다. "다음 단계" 버튼 제출 시 React Hook Form 데이터를 Zustand에 저장하고, 이전 단계로 돌아올 때 `defaultValues`로 복원합니다.
- **localStorage persist**: Zustand `persist` 미들웨어를 사용해 새로고침 후에도 데이터가 유지됩니다.

### 유효성 검증 전략

- **스텝 전환 시**: `handleSubmit`이 스텝 전체를 검증한 후 Zustand에 저장합니다.
- **필드 blur 시**: `mode: "onBlur"` 옵션으로 개별 필드 이탈 시 즉시 검증합니다.
- **서버 에러 코드 처리**: `COURSE_FULL`, `DUPLICATE_ENROLLMENT` 등을 사용자 친화적 메시지로 변환하며, COURSE_FULL의 경우 강의 재선택 액션을 제공합니다.

### discriminated union 타입 설계

```typescript
type Step2Data =
  | ({ type: "personal" } & Step2PersonalData)
  | ({ type: "group" } & Step2GroupData);
```

`type` 필드로 런타임과 컴파일 타임 모두에서 안전하게 개인/단체를 구분합니다.

---

## 미구현 / 제약사항

- **테스트 코드**: 시간 제약으로 미구현. 검증 로직(`lib/validations/`)과 유틸 함수(`lib/utils.ts`)에 단위 테스트 추가가 우선순위입니다.
- **반응형 레이아웃**: 기본 모바일 대응은 구현되어 있으나, 과제에서 명시한 "스텝별 세로 스크롤 레이아웃" 완성도 개선이 필요합니다.
- **인증/인가**: 과제 요건상 불필요하여 미구현입니다.
- **결제 연동**: 과제 요건상 불필요하여 미구현입니다.

---

## Mock API 실행 안내

별도 서버 실행 불필요합니다. `npm run dev` 실행 시 아래 엔드포인트가 자동으로 활성화됩니다.

| 메서드 | 경로 | 설명 |
|--------|------|------|
| `GET` | `/api/courses?category={category}` | 강의 목록 조회 (카테고리 필터 선택) |
| `POST` | `/api/enrollments` | 수강 신청 제출 |

**에러 시나리오 테스트:**
- `디자인 시스템 구축하기` 강의 선택 후 신청 → `COURSE_FULL` 에러 발생
- 동일 이메일로 같은 강의 재신청 → `DUPLICATE_ENROLLMENT` 에러 발생 (서버 인메모리, 서버 재시작 시 초기화)

---

## AI 활용 범위

- 초기 보일러플레이트 생성(컴포넌트 뼈대, Zod 스키마 초안) 시 GitHub Copilot 자동완성을 일부 활용하였습니다.
- 아키텍처 설계(Zustand + React Hook Form 역할 분리, discriminated union 타입 구조), 유효성 검증 전략, API 에러 처리 방식은 직접 설계하고 작성하였습니다.
- Zod v4 호환 이슈 디버깅, 참가자 이메일 중복 검증 로직, 신청 유형 전환 시 데이터 초기화 처리 등 판단이 필요한 부분은 직접 구현하였습니다.
