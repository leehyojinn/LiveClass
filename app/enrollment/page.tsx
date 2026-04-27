"use client";

import { useEffect } from "react";
import { useEnrollmentStore } from "@/store/enrollmentStore";
import { StepIndicator } from "@/components/ui/StepIndicator";
import { Step1CourseSelection } from "@/components/enrollment/Step1CourseSelection";
import { Step2ApplicantInfo } from "@/components/enrollment/Step2ApplicantInfo";
import { Step3Review } from "@/components/enrollment/Step3Review";
import { useBeforeUnload } from "@/hooks/useBeforeUnload";

const STEP_TITLES = {
  1: "강의 선택",
  2: "수강생 정보 입력",
  3: "최종 확인",
} as const;

export default function EnrollmentPage() {
  const { currentStep, step1, step2 } = useEnrollmentStore();

  // 입력 중일 때 이탈 방지
  const hasInput = !!(step1 || step2);
  useBeforeUnload(hasInput);

  return (
    <main className="mx-auto min-h-screen w-full max-w-2xl px-4 py-8 sm:px-6 lg:py-12">
      {/* 헤더 */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">수강 신청</h1>
        <p className="mt-1 text-sm text-gray-500">원하는 강의를 선택하고 신청 정보를 입력해주세요.</p>
      </div>

      {/* 스텝 인디케이터 */}
      <StepIndicator currentStep={currentStep} />

      {/* 스텝 제목 */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800">
          {currentStep}단계: {STEP_TITLES[currentStep]}
        </h2>
      </div>

      {/* 폼 카드 */}
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 sm:p-8">
        {currentStep === 1 && <Step1CourseSelection />}
        {currentStep === 2 && <Step2ApplicantInfo />}
        {currentStep === 3 && <Step3Review />}
      </div>
    </main>
  );
}
