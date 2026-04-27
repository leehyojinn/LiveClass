import { NextRequest, NextResponse } from "next/server";
import type { Course, CourseCategory, CourseListResponse } from "@/types/enrollment";

const MOCK_COURSES: Course[] = [
  {
    id: "dev-001",
    title: "React 심화 과정",
    description: "React의 고급 패턴과 성능 최적화 기법을 학습합니다. 실무에서 바로 적용 가능한 예제 중심으로 진행됩니다.",
    category: "development",
    price: 299000,
    maxCapacity: 30,
    currentEnrollment: 28,
    startDate: "2026-05-10T09:00:00+09:00",
    endDate: "2026-06-20T18:00:00+09:00",
    instructor: "김민준",
  },
  {
    id: "dev-002",
    title: "TypeScript 완전 정복",
    description: "TypeScript의 타입 시스템을 깊이 이해하고, 실무에서 안전한 코드를 작성하는 방법을 배웁니다.",
    category: "development",
    price: 249000,
    maxCapacity: 25,
    currentEnrollment: 10,
    startDate: "2026-05-15T09:00:00+09:00",
    endDate: "2026-06-25T18:00:00+09:00",
    instructor: "이서연",
  },
  {
    id: "dev-003",
    title: "Next.js App Router 마스터",
    description: "Next.js 13+ App Router의 모든 것을 배웁니다. RSC, Server Actions, 스트리밍까지 다룹니다.",
    category: "development",
    price: 349000,
    maxCapacity: 20,
    currentEnrollment: 19,
    startDate: "2026-06-01T09:00:00+09:00",
    endDate: "2026-07-15T18:00:00+09:00",
    instructor: "박지호",
  },
  {
    id: "design-001",
    title: "Figma로 시작하는 UI/UX 디자인",
    description: "Figma의 기초부터 실전 UI/UX 디자인 프로세스까지 체계적으로 학습합니다.",
    category: "design",
    price: 199000,
    maxCapacity: 20,
    currentEnrollment: 12,
    startDate: "2026-05-20T09:00:00+09:00",
    endDate: "2026-07-01T18:00:00+09:00",
    instructor: "최유진",
  },
  {
    id: "design-002",
    title: "디자인 시스템 구축하기",
    description: "컴포넌트 기반의 디자인 시스템을 설계하고 개발자와 협업하는 방법을 배웁니다.",
    category: "design",
    price: 279000,
    maxCapacity: 15,
    currentEnrollment: 15,
    startDate: "2026-06-05T09:00:00+09:00",
    endDate: "2026-07-20T18:00:00+09:00",
    instructor: "정다은",
  },
  {
    id: "marketing-001",
    title: "퍼포먼스 마케팅 입문",
    description: "Google Ads, Meta Ads 등 디지털 광고 채널을 활용한 퍼포먼스 마케팅 전략을 학습합니다.",
    category: "marketing",
    price: 229000,
    maxCapacity: 30,
    currentEnrollment: 5,
    startDate: "2026-05-25T09:00:00+09:00",
    endDate: "2026-07-05T18:00:00+09:00",
    instructor: "한수민",
  },
  {
    id: "marketing-002",
    title: "콘텐츠 마케팅 전략",
    description: "브랜드 스토리텔링과 콘텐츠 마케팅으로 고객을 사로잡는 전략을 배웁니다.",
    category: "marketing",
    price: 199000,
    maxCapacity: 25,
    currentEnrollment: 20,
    startDate: "2026-06-10T09:00:00+09:00",
    endDate: "2026-07-25T18:00:00+09:00",
    instructor: "오지현",
  },
  {
    id: "business-001",
    title: "스타트업 비즈니스 모델 설계",
    description: "린 스타트업 방법론을 활용하여 비즈니스 모델을 검증하고 MVP를 만드는 과정을 배웁니다.",
    category: "business",
    price: 319000,
    maxCapacity: 20,
    currentEnrollment: 8,
    startDate: "2026-06-15T09:00:00+09:00",
    endDate: "2026-08-01T18:00:00+09:00",
    instructor: "임재원",
  },
  {
    id: "business-002",
    title: "OKR 기반 팀 목표 관리",
    description: "구글, 인텔이 사용하는 OKR 프레임워크를 팀에 도입하고 운영하는 방법을 배웁니다.",
    category: "business",
    price: 189000,
    maxCapacity: 30,
    currentEnrollment: 22,
    startDate: "2026-05-30T09:00:00+09:00",
    endDate: "2026-07-10T18:00:00+09:00",
    instructor: "신현아",
  },
];

const ALL_CATEGORIES: CourseCategory[] = ["development", "design", "marketing", "business"];

export async function GET(request: NextRequest) {
  // 실제 API 시뮬레이션을 위한 약간의 지연
  await new Promise((resolve) => setTimeout(resolve, 300));

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") as CourseCategory | null;

  const filteredCourses =
    category && ALL_CATEGORIES.includes(category)
      ? MOCK_COURSES.filter((course) => course.category === category)
      : MOCK_COURSES;

  const response: CourseListResponse = {
    courses: filteredCourses,
    categories: ALL_CATEGORIES,
  };

  return NextResponse.json(response);
}
