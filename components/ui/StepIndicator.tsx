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
    <nav aria-label="진행 단계" className="mb-8">
      <ol className="flex items-center justify-center gap-0">
        {STEPS.map(({ step, label }, index) => {
          const isCompleted = currentStep > step;
          const isCurrent = currentStep === step;
          const isUpcoming = currentStep < step;

          return (
            <li key={step} className="flex items-center">
              {/* Step circle */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold text-sm transition-all duration-200",
                    isCompleted && "border-blue-600 bg-blue-600 text-white",
                    isCurrent && "border-blue-600 bg-white text-blue-600",
                    isUpcoming && "border-gray-300 bg-white text-gray-400"
                  )}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  {isCompleted ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span>{step}</span>
                  )}
                </div>
                <span
                  className={cn(
                    "mt-2 text-xs font-medium whitespace-nowrap",
                    isCurrent && "text-blue-600",
                    isCompleted && "text-blue-600",
                    isUpcoming && "text-gray-400"
                  )}
                >
                  {label}
                </span>
              </div>

              {/* Connector line */}
              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 w-16 sm:w-24 mx-2 mb-5 transition-all duration-200",
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
