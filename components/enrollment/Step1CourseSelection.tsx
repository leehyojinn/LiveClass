"use client";

import { useState, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEnrollmentStore } from "@/store/enrollmentStore";
import { useCoursesQuery } from "@/lib/queries/courses";
import { step1Schema, type Step1FormValues } from "@/lib/validations/step1Schema";
import { formatPrice, formatDateRange, getCapacityStatus, cn } from "@/lib/utils";
import type { Course, CourseCategory, EnrollmentType } from "@/types/enrollment";

const CATEGORY_LABELS: Record<CourseCategory, string> = {
  development: "개발",
  design: "디자인",
  marketing: "마케팅",
  business: "비즈니스",
};

export function Step1CourseSelection() {
  const { step1, setStep1Data, nextStep } = useEnrollmentStore();
  const [selectedCategory, setSelectedCategory] = useState<CourseCategory | undefined>(undefined);
  const [typeChangeConfirm, setTypeChangeConfirm] = useState<{
    show: boolean;
    newType: EnrollmentType | null;
  }>({ show: false, newType: null });

  const courseListRef = useRef<HTMLDivElement>(null);
  const enrollmentTypeRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, isError, refetch } = useCoursesQuery(selectedCategory);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Step1FormValues>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      courseId: step1?.courseId ?? "",
      enrollmentType: step1?.enrollmentType ?? "personal",
    },
  });

  const currentEnrollmentType = watch("enrollmentType");
  const currentCourseId = watch("courseId");

  function handleEnrollmentTypeChange(newType: EnrollmentType) {
    if (currentEnrollmentType === newType) return;
    // step2 데이터가 있는 경우에만 확인 대화상자 표시
    const { step2 } = useEnrollmentStore.getState();
    if (step2) {
      setTypeChangeConfirm({ show: true, newType });
    } else {
      setValue("enrollmentType", newType);
    }
  }

  function confirmTypeChange() {
    if (typeChangeConfirm.newType) {
      setValue("enrollmentType", typeChangeConfirm.newType);
    }
    setTypeChangeConfirm({ show: false, newType: null });
  }

  function onSubmit(values: Step1FormValues) {
    setStep1Data(values);
    nextStep();
  }

  function onInvalid() {
    // 에러가 있는 첫 번째 섹션으로 스크롤
    if (errors.courseId) {
      courseListRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    } else if (errors.enrollmentType) {
      enrollmentTypeRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  const selectedCourse = data?.courses.find((c) => c.id === currentCourseId);

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate>
      {/* 카테고리 탭 */}
      <div className="mb-6">
        <h2 className="mb-3 text-base font-semibold text-gray-700">카테고리</h2>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSelectedCategory(undefined)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              selectedCategory === undefined
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            전체
          </button>
          {(data?.categories ?? (Object.keys(CATEGORY_LABELS) as CourseCategory[])).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                selectedCategory === cat
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* 강의 목록 */}
      <div className="mb-6" ref={courseListRef}>
        <h2 className="mb-3 text-base font-semibold text-gray-700">
          강의 선택 <span className="text-red-500">*</span>
        </h2>

        {isLoading && (
          <div className="flex items-center justify-center rounded-xl border border-gray-200 bg-white py-16">
            <div className="flex flex-col items-center gap-3 text-gray-500">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
              <span className="text-sm">강의 목록을 불러오는 중...</span>
            </div>
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50 py-12 text-center">
            <p className="mb-3 text-sm text-red-600">강의 목록을 불러오지 못했습니다.</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              다시 시도
            </button>
          </div>
        )}

        {!isLoading && !isError && data?.courses.length === 0 && (
          <div className="flex items-center justify-center rounded-xl border border-gray-200 bg-white py-16 text-center">
            <div className="text-gray-400">
              <p className="mb-1 text-sm font-medium">등록된 강의가 없습니다.</p>
              <p className="text-xs">다른 카테고리를 선택해보세요.</p>
            </div>
          </div>
        )}

        {!isLoading && !isError && data && data.courses.length > 0 && (
          <Controller
            control={control}
            name="courseId"
            render={({ field }) => (
              <div className="grid gap-3 sm:grid-cols-2">
                {data.courses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    isSelected={field.value === course.id}
                    onSelect={() => field.onChange(course.id)}
                  />
                ))}
              </div>
            )}
          />
        )}

        {errors.courseId && (
          <p className="mt-2 text-sm text-red-600" role="alert">
            {errors.courseId.message}
          </p>
        )}
      </div>

      {/* 선택된 강의 요약 */}
      {selectedCourse && (
        <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
          <h3 className="mb-2 text-sm font-semibold text-blue-800">선택한 강의</h3>
          <p className="text-sm font-medium text-blue-900">{selectedCourse.title}</p>
          <div className="mt-2 flex flex-wrap gap-4 text-xs text-blue-700">
            <span>강사: {selectedCourse.instructor}</span>
            <span>가격: {formatPrice(selectedCourse.price)}</span>
            <span>일정: {formatDateRange(selectedCourse.startDate, selectedCourse.endDate)}</span>
          </div>
        </div>
      )}

      {/* 신청 유형 선택 */}
      <div className="mb-8" ref={enrollmentTypeRef}>
        <h2 className="mb-3 text-base font-semibold text-gray-700">
          신청 유형 <span className="text-red-500">*</span>
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {(["personal", "group"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => handleEnrollmentTypeChange(type)}
              className={cn(
                "flex flex-col items-center rounded-xl border-2 p-4 text-sm font-medium transition-all",
                currentEnrollmentType === type
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
              )}
              aria-pressed={currentEnrollmentType === type}
            >
              <span className="mb-1 text-2xl">{type === "personal" ? "👤" : "👥"}</span>
              <span>{type === "personal" ? "개인 신청" : "단체 신청"}</span>
              {type === "group" && (
                <span className="mt-0.5 text-xs font-normal text-gray-400">2~10명</span>
              )}
            </button>
          ))}
        </div>
        {errors.enrollmentType && (
          <p className="mt-2 text-sm text-red-600" role="alert">
            {errors.enrollmentType.message}
          </p>
        )}
      </div>

      {/* 다음 단계 버튼 */}
      <div className="flex justify-end">
        <button
          type="submit"
          className="rounded-xl bg-blue-600 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 active:bg-blue-800"
        >
          다음 단계 →
        </button>
      </div>

      {/* 신청 유형 변경 확인 대화상자 */}
      {typeChangeConfirm.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="mb-2 text-base font-semibold text-gray-900">신청 유형 변경</h3>
            <p className="mb-6 text-sm text-gray-600">
              신청 유형을 변경하면 2단계에서 입력한 정보가 초기화됩니다. 계속하시겠습니까?
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setTypeChangeConfirm({ show: false, newType: null })}
                className="flex-1 rounded-xl border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                취소
              </button>
              <button
                type="button"
                onClick={confirmTypeChange}
                className="flex-1 rounded-xl bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                변경하기
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}

function CourseCard({
  course,
  isSelected,
  onSelect,
}: {
  course: Course;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const capacity = getCapacityStatus(course.currentEnrollment, course.maxCapacity);

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={capacity.isFull}
      aria-pressed={isSelected}
      className={cn(
        "relative flex flex-col rounded-xl border-2 p-4 text-left transition-all",
        capacity.isFull && "cursor-not-allowed opacity-60",
        isSelected && !capacity.isFull
          ? "border-blue-600 bg-blue-50"
          : !capacity.isFull
          ? "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
          : "border-gray-200 bg-gray-50"
      )}
    >
      {/* 카테고리 배지 */}
      <span className="mb-2 inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
        {CATEGORY_LABELS[course.category as CourseCategory]}
      </span>

      <p className="mb-1 text-sm font-semibold text-gray-900 line-clamp-2">{course.title}</p>
      <p className="mb-3 text-xs text-gray-500 line-clamp-2">{course.description}</p>

      <div className="mt-auto space-y-1 text-xs text-gray-500">
        <p>강사: {course.instructor}</p>
        <p>{formatDateRange(course.startDate, course.endDate)}</p>
        <div className="flex items-center justify-between">
          <span className="font-semibold text-gray-900">{formatPrice(course.price)}</span>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-xs font-medium",
              capacity.color === "red" && "bg-red-100 text-red-700",
              capacity.color === "orange" && "bg-orange-100 text-orange-700",
              capacity.color === "yellow" && "bg-yellow-100 text-yellow-700",
              capacity.color === "green" && "bg-green-100 text-green-700"
            )}
          >
            {capacity.label}
          </span>
        </div>
      </div>

      {/* 거의 찬 경우 경고 배너 */}
      {capacity.isAlmostFull && !capacity.isFull && (
        <div className="mt-2 rounded-lg bg-orange-50 px-2 py-1 text-xs font-medium text-orange-700">
          ⚠️ 마감 임박 — 서둘러 신청하세요
        </div>
      )}

      {isSelected && !capacity.isFull && (
        <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600">
          <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </button>
  );
}
