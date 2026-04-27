"use client";

import { useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEnrollmentStore } from "@/store/enrollmentStore";
import { useCoursesQuery } from "@/lib/queries/courses";
import { useEnrollmentMutation } from "@/lib/queries/enrollments";
import { step3Schema, type Step3FormValues } from "@/lib/validations/step3Schema";
import { formatPrice, formatDateRange, cn } from "@/lib/utils";
import type { ErrorResponse, FormStep } from "@/types/enrollment";

const ERROR_MESSAGES: Record<string, string> = {
  COURSE_FULL: "선택하신 강의의 정원이 초과되었습니다. 다른 강의를 선택해주세요.",
  DUPLICATE_ENROLLMENT: "이미 해당 강의에 신청하셨습니다.",
  INVALID_INPUT: "입력 정보에 오류가 있습니다. 내용을 다시 확인해주세요.",
  INTERNAL_ERROR: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
};

export function Step3Review() {
  const router = useRouter();
  const { step1, step2, step3, setStep3Data, setSubmittedEnrollment, prevStep, goToStep, reset } =
    useEnrollmentStore();
  const { data: coursesData } = useCoursesQuery();
  const { mutate, isPending, error, reset: resetMutation } = useEnrollmentMutation();
  const submitButtonRef = useRef<HTMLButtonElement>(null);

  const selectedCourse = coursesData?.courses.find((c) => c.id === step1?.courseId);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Step3FormValues>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      agreedToTerms: step3.agreedToTerms,
    },
  });

  function onSubmit(values: Step3FormValues) {
    if (!step1 || !step2) return;

    setStep3Data(values);

    const basePayload = {
      courseId: step1.courseId,
      agreedToTerms: values.agreedToTerms,
      applicant: {
        name: step2.name,
        email: step2.email,
        phone: step2.phone,
        motivation: step2.motivation || undefined,
      },
    };

    const payload =
      step2.type === "group"
        ? {
            ...basePayload,
            type: "group" as const,
            group: {
              organizationName: step2.organizationName,
              headCount: step2.headCount,
              participants: step2.participants,
              contactPerson: step2.contactPerson,
            },
          }
        : { ...basePayload, type: "personal" as const };

    mutate(payload, {
      onSuccess: (data) => {
        setSubmittedEnrollment(data);
        // reset()은 완료 페이지에서 호출 — 완료 페이지가 step1/2 데이터로 요약 정보를 표시해야 하므로
        router.push(`/enrollment/complete?id=${data.enrollmentId}&status=${data.status}`);
      },
    });
  }

  const apiError = error as ErrorResponse | null;
  const isCourseFull = apiError?.code === "COURSE_FULL";
  const isDuplicate = apiError?.code === "DUPLICATE_ENROLLMENT";

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {/* API 에러 메시지 */}
      {apiError && (
        <div
          className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4"
          role="alert"
          aria-live="polite"
        >
          <p className="mb-1 text-sm font-semibold text-red-800">
            {isCourseFull || isDuplicate ? "신청 불가" : "제출 실패"}
          </p>
          <p className="text-sm text-red-700">
            {ERROR_MESSAGES[apiError.code] ?? "알 수 없는 오류가 발생했습니다."}
          </p>
          {isCourseFull && (
            <button
              type="button"
              onClick={() => {
                resetMutation();
                goToStep(1);
              }}
              className="mt-3 text-sm font-medium text-red-700 underline"
            >
              강의 다시 선택하기
            </button>
          )}
        </div>
      )}

      <div className="space-y-6">
        {/* 강의 정보 */}
        <ReviewSection
          title="강의 정보"
          onEdit={() => { resetMutation(); goToStep(1 as FormStep); }}
        >
          {selectedCourse ? (
            <div className="space-y-1.5 text-sm">
              <ReviewRow label="강의명" value={selectedCourse.title} />
              <ReviewRow label="강사" value={selectedCourse.instructor} />
              <ReviewRow label="수강료" value={formatPrice(selectedCourse.price)} />
              <ReviewRow
                label="수강 기간"
                value={formatDateRange(selectedCourse.startDate, selectedCourse.endDate)}
              />
              <ReviewRow
                label="신청 유형"
                value={step1?.enrollmentType === "group" ? "단체 신청" : "개인 신청"}
              />
            </div>
          ) : (
            <p className="text-sm text-gray-400">강의 정보를 불러오는 중...</p>
          )}
        </ReviewSection>

        {/* 수강생 정보 */}
        <ReviewSection
          title="수강생 정보"
          onEdit={() => { resetMutation(); goToStep(2 as FormStep); }}
        >
          {step2 ? (
            <div className="space-y-1.5 text-sm">
              <ReviewRow label="이름" value={step2.name} />
              <ReviewRow label="이메일" value={step2.email} />
              <ReviewRow label="전화번호" value={step2.phone} />
              {step2.motivation && (
                <ReviewRow label="수강 동기" value={step2.motivation} multiline />
              )}
              {step2.type === "group" && (
                <>
                  <div className="my-2 border-t border-gray-100" />
                  <ReviewRow label="단체명" value={step2.organizationName} />
                  <ReviewRow label="신청 인원" value={`${step2.headCount}명`} />
                  <ReviewRow label="담당자 연락처" value={step2.contactPerson} />
                  <div className="mt-3">
                    <p className="mb-2 text-xs font-semibold text-gray-500">참가자 명단</p>
                    <div className="rounded-lg border border-gray-200 overflow-hidden">
                      {step2.participants.map((p, i) => (
                        <div
                          key={i}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 text-xs",
                            i % 2 === 0 ? "bg-gray-50" : "bg-white"
                          )}
                        >
                          <span className="w-4 text-gray-400 font-medium shrink-0">{i + 1}</span>
                          <span className="font-medium text-gray-700">{p.name}</span>
                          <span className="text-gray-400">{p.email}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-400">수강생 정보가 없습니다.</p>
          )}
        </ReviewSection>

        {/* 이용약관 */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="mb-3 text-base font-semibold text-gray-900">이용약관 동의</h3>
          <div className="mb-4 max-h-32 overflow-y-auto rounded-lg bg-gray-50 p-3 text-xs leading-relaxed text-gray-500">
            <p className="font-semibold mb-1">수강 신청 이용약관</p>
            <p>1. 수강 신청 후 환불은 수강 시작 7일 전까지 전액 환불 가능합니다.</p>
            <p>2. 수강 시작 3일 전부터는 50% 환불됩니다.</p>
            <p>3. 수강 시작 후에는 환불이 불가합니다.</p>
            <p>4. 입력하신 개인정보는 수강 신청 처리 목적으로만 사용됩니다.</p>
            <p>5. 단체 신청의 경우 참가자 정보는 강의 운영에만 활용됩니다.</p>
          </div>
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 accent-blue-600"
              aria-invalid={!!errors.agreedToTerms}
              {...register("agreedToTerms")}
            />
            <span className="text-sm text-gray-700">
              이용약관을 읽었으며 동의합니다. <span className="text-red-500">*</span>
            </span>
          </label>
          {errors.agreedToTerms && (
            <p className="mt-2 text-xs text-red-600" role="alert">
              {errors.agreedToTerms.message}
            </p>
          )}
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="mt-8 flex justify-between">
        <button
          type="button"
          onClick={prevStep}
          disabled={isPending}
          className="rounded-xl border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
        >
          ← 이전 단계
        </button>
        <button
          ref={submitButtonRef}
          type="submit"
          disabled={isPending}
          className={cn(
            "flex items-center gap-2 rounded-xl px-8 py-3 text-sm font-semibold text-white transition-colors",
            isPending
              ? "cursor-not-allowed bg-blue-400"
              : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
          )}
        >
          {isPending ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              처리 중...
            </>
          ) : (
            "수강 신청 완료"
          )}
        </button>
      </div>
    </form>
  );
}

function ReviewSection({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        <button
          type="button"
          onClick={onEdit}
          className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
        >
          수정
        </button>
      </div>
      {children}
    </div>
  );
}

function ReviewRow({
  label,
  value,
  multiline,
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <div className={cn("flex gap-3", multiline ? "flex-col" : "items-start")}>
      <span className="w-24 shrink-0 text-gray-500">{label}</span>
      <span className={cn("font-medium text-gray-800", multiline && "whitespace-pre-wrap")}>
        {value}
      </span>
    </div>
  );
}
