"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function CompleteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const enrollmentId = searchParams.get("id") ?? "";
  const status = searchParams.get("status") ?? "confirmed";

  if (!enrollmentId) {
    router.replace("/enrollment");
    return null;
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
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

        {/* 신청 정보 카드 */}
        <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 text-left">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
            <span className="text-sm font-semibold text-gray-500">신청 번호</span>
            <span className="rounded-lg bg-blue-50 px-3 py-1 font-mono text-sm font-bold text-blue-700">
              {enrollmentId}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-500">처리 상태</span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                status === "confirmed"
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {status === "confirmed" ? "확정" : "검토 중"}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs text-gray-400">
            신청 내역은 입력하신 이메일로 발송됩니다.
          </p>
          <button
            onClick={() => router.push("/enrollment")}
            className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            새로운 강의 신청하기
          </button>
        </div>
      </div>
    </main>
  );
}

export default function CompletePage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-gray-400">로딩 중...</div>}>
      <CompleteContent />
    </Suspense>
  );
}
