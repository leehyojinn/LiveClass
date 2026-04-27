"use client";

import { cn } from "@/lib/utils";
import type { FormStep } from "@/types/enrollment";

interface StepIndicatorProps {
  currentStep: FormStep;
}

const STEPS = [
  { step: 1 as FormStep, label: "강의 선택" },
  { step: 2 as FormStep, label: "수강생 정보" },
  { step: 3 as FormStep, label: "확인 및 제출" },
];

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <nav aria-label="진행 단계" className="mb-6 sm:mb-8">
      <ol className="flex items-center justify-center gap-0">
        {STEPS.map(({ step, label }, index) => {
          const isCompleted = currentStep > step;
          const isCurrent = currentStep === step;
          const isUpcoming = currentStep < step;

          return (
            <li key={step} className="flex items-center">
              {/* Step circle + label */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border-2 font-semibold text-xs transition-all duration-200",
                    "sm:h-10 sm:w-10 sm:text-sm",
                    isCompleted && "border-blue-600 bg-blue-600 text-white",
                    isCurrent && "border-blue-600 bg-white text-blue-600",
                    isUpcoming && "border-gray-300 bg-white text-gray-400"
                  )}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  {isCompleted ? (
                    <svg className="h-3.5 w-3.5 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span>{step}</span>
                  )}
                </div>
                {/* 모바일에서 현재 스텝 라벨만 표시, sm 이상에서 전체 표시 */}
                <span
                  className={cn(
                    "mt-1.5 text-xs font-medium whitespace-nowrap transition-colors",
                    "hidden sm:block",
                    isCurrent && "text-blue-600",
                    isCompleted && "text-blue-600",
                    isUpcoming && "text-gray-400"
                  )}
                >
                  {label}
                </span>
                <span
                  className={cn(
                    "mt-1.5 text-xs font-medium whitespace-nowrap transition-colors",
                    "block sm:hidden",
                    isCurrent ? "text-blue-600" : "invisible"
                  )}
                >
                  {label}
                </span>
              </div>

              {/* Connector line */}
              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 mx-1.5 mb-5 transition-all duration-200",
                    "w-10 sm:w-20 lg:w-28",
                    isCompleted ? "bg-blue-600" : "bg-gray-300"
                  )}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
