"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useEnrollmentStore } from "@/store/enrollmentStore";
import { useCoursesQuery } from "@/lib/queries/courses";
import { formatPrice, formatDateRange } from "@/lib/utils";

function CompleteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { step1, step2, reset } = useEnrollmentStore();
  const { data: coursesData } = useCoursesQuery();

  const enrollmentId = searchParams.get("id") ?? "";
  const status = searchParams.get("status") ?? "confirmed";

  const selectedCourse = coursesData?.courses.find((c) => c.id === step1?.courseId);

  // 직접 URL 접근 시 신청 페이지로 리다이렉트
  useEffect(() => {
    if (!enrollmentId) {
      router.replace("/enrollment");
    }
  }, [enrollmentId, router]);

  if (!enrollmentId) return null;

  function handleNewEnrollment() {
    reset();
    router.push("/enrollment");
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-2xl px-4 py-12">
      <div className="text-center">
        {/* 성공 아이콘 */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <svg
            className="h-10 w-10 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="mb-2 text-2xl font-bold text-gray-900">수강 신청 완료!</h1>
        <p className="mb-8 text-gray-500">
          {status === "confirmed"
            ? "신청이 확정되었습니다."
            : "신청이 접수되었으며 검토 후 확정됩니다."}
        </p>
      </div>

      {/* 신청 요약 카드 */}
      <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
        {/* 신청 번호 / 상태 */}
        <div className="mb-5 flex flex-col gap-3 border-b border-gray-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">신청 번호</p>
            <p className="font-mono text-base font-bold text-blue-700">{enrollmentId}</p>
          </div>
          <span
            className={`self-start rounded-full px-3 py-1 text-xs font-semibold sm:self-auto ${
              status === "confirmed"
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {status === "confirmed" ? "확정" : "검토 중"}
          </span>
        </div>

        {/* 강의 정보 */}
        {selectedCourse && (
          <div className="mb-5 border-b border-gray-100 pb-5">
            <p className="mb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">강의 정보</p>
            <div className="space-y-1.5 text-sm">
              <SummaryRow label="강의명" value={selectedCourse.title} />
              <SummaryRow label="강사" value={selectedCourse.instructor} />
              <SummaryRow label="수강료" value={formatPrice(selectedCourse.price)} />
              <SummaryRow
                label="수강 기간"
                value={formatDateRange(selectedCourse.startDate, selectedCourse.endDate)}
              />
              <SummaryRow
                label="신청 유형"
                value={step1?.enrollmentType === "group" ? "단체 신청" : "개인 신청"}
              />
            </div>
          </div>
        )}

        {/* 신청자 정보 */}
        {step2 && (
          <div>
            <p className="mb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">신청자 정보</p>
            <div className="space-y-1.5 text-sm">
              <SummaryRow label="이름" value={step2.name} />
              <SummaryRow label="이메일" value={step2.email} />
              <SummaryRow label="전화번호" value={step2.phone} />
              {step2.type === "group" && (
                <>
                  <SummaryRow label="단체명" value={step2.organizationName} />
                  <SummaryRow label="신청 인원" value={`${step2.headCount}명`} />
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3 text-center">
        <p className="text-xs text-gray-400">
          신청 내역은 입력하신 이메일({step2?.email})로 발송됩니다.
        </p>
        <button
          onClick={handleNewEnrollment}
          className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
        >
          새로운 강의 신청하기
        </button>
      </div>
    </main>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <span className="w-20 shrink-0 text-gray-500">{label}</span>
      <span className="font-medium text-gray-800">{value}</span>
    </div>
  );
}

export default function CompletePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-gray-400">
          로딩 중...
        </div>
      }
    >
      <CompleteContent />
    </Suspense>
  );
}
