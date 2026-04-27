import { useQuery } from "@tanstack/react-query";
import type { CourseCategory, CourseListResponse } from "@/types/enrollment";

async function fetchCourses(category?: CourseCategory): Promise<CourseListResponse> {
  const url = category ? `/api/courses?category=${category}` : "/api/courses";
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("강의 목록을 불러오는데 실패했습니다.");
  }
  return response.json();
}

export const courseKeys = {
  all: ["courses"] as const,
  byCategory: (category?: CourseCategory) => ["courses", category ?? "all"] as const,
};

export function useCoursesQuery(category?: CourseCategory) {
  return useQuery({
    queryKey: courseKeys.byCategory(category),
    queryFn: () => fetchCourses(category),
    staleTime: 1000 * 60 * 5, // 5분
  });
}
