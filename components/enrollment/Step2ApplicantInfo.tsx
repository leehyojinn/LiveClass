"use client";

import { useEffect, useRef } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEnrollmentStore } from "@/store/enrollmentStore";
import {
  step2PersonalSchema,
  step2GroupSchema,
  type Step2PersonalFormValues,
  type Step2GroupFormValues,
} from "@/lib/validations/step2Schema";
import { FormField, TextareaField } from "@/components/ui/FormField";
import { formatPhone, cn } from "@/lib/utils";
import type { Step2Data } from "@/types/enrollment";

type SetStep2DataFn = (data: Step2Data) => void;

export function Step2ApplicantInfo() {
  const { step1, step2, setStep2Data, nextStep, prevStep } = useEnrollmentStore();
  const isGroup = step1?.enrollmentType === "group";

  return isGroup ? (
    <GroupForm
      defaultValues={step2?.type === "group" ? step2 : undefined}
      setStep2Data={setStep2Data}
      nextStep={nextStep}
      prevStep={prevStep}
    />
  ) : (
    <PersonalForm
      defaultValues={step2?.type === "personal" ? step2 : undefined}
      setStep2Data={setStep2Data}
      nextStep={nextStep}
      prevStep={prevStep}
    />
  );
}

// ─── 개인 신청 폼 ─────────────────────────────────────────────────────────────

function PersonalForm({
  defaultValues,
  setStep2Data,
  nextStep,
  prevStep,
}: {
  defaultValues?: Partial<Step2PersonalFormValues>;
  setStep2Data: SetStep2DataFn;
  nextStep: () => void;
  prevStep: () => void;
}) {
  const {
    register,
    handleSubmit,
    setFocus,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Step2PersonalFormValues>({
    resolver: zodResolver(step2PersonalSchema),
    defaultValues: {
      type: "personal",
      name: defaultValues?.name ?? "",
      email: defaultValues?.email ?? "",
      phone: defaultValues?.phone ?? "",
      motivation: defaultValues?.motivation ?? "",
    },
    mode: "onBlur",
  });

  const motivationValue = watch("motivation") ?? "";

  function onSubmit(values: Step2PersonalFormValues) {
    setStep2Data({ ...values, motivation: values.motivation ?? "" });
    nextStep();
  }

  function onInvalid() {
    const firstError = (["name", "email", "phone"] as const).find((f) => errors[f]);
    if (firstError) {
      setFocus(firstError);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate>
      <div className="space-y-5">
        <FormField
          label="이름"
          required
          placeholder="홍길동"
          error={errors.name?.message}
          {...register("name")}
        />
        <FormField
          label="이메일"
          type="email"
          required
          placeholder="example@email.com"
          error={errors.email?.message}
          {...register("email")}
        />
        <FormField
          label="전화번호"
          type="tel"
          required
          placeholder="010-1234-5678"
          hint="한국 전화번호 형식 (예: 010-1234-5678)"
          error={errors.phone?.message}
          {...register("phone", {
            onChange: (e) => {
              const formatted = formatPhone(e.target.value);
              setValue("phone", formatted, { shouldValidate: false });
            },
          })}
        />
        <TextareaField
          label="수강 동기"
          placeholder="수강 신청 동기를 자유롭게 작성해주세요. (선택)"
          rows={4}
          maxLength={300}
          currentLength={motivationValue.length}
          error={errors.motivation?.message}
          {...register("motivation")}
        />
      </div>

      <StepNavigation onPrev={prevStep} />
    </form>
  );
}

// ─── 단체 신청 폼 ─────────────────────────────────────────────────────────────

function GroupForm({
  defaultValues,
  setStep2Data,
  nextStep,
  prevStep,
}: {
  defaultValues?: Partial<Step2GroupFormValues>;
  setStep2Data: SetStep2DataFn;
  nextStep: () => void;
  prevStep: () => void;
}) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    setFocus,
    formState: { errors },
  } = useForm<Step2GroupFormValues>({
    resolver: zodResolver(step2GroupSchema),
    defaultValues: {
      type: "group",
      name: defaultValues?.name ?? "",
      email: defaultValues?.email ?? "",
      phone: defaultValues?.phone ?? "",
      motivation: defaultValues?.motivation ?? "",
      organizationName: defaultValues?.organizationName ?? "",
      headCount: defaultValues?.headCount ?? 2,
      participants: defaultValues?.participants ?? [
        { name: "", email: "" },
        { name: "", email: "" },
      ],
      contactPerson: defaultValues?.contactPerson ?? "",
    },
    mode: "onBlur",
  });

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "participants",
  });

  const headCount = watch("headCount");
  const motivationValue = watch("motivation") ?? "";
  const prevHeadCountRef = useRef<number>(headCount);

  // 인원수 변경 시 참가자 배열 동기화
  useEffect(() => {
    const prev = prevHeadCountRef.current;
    const count = Number(headCount);
    if (isNaN(count) || count < 2 || count > 10) return;
    if (count === prev) return;

    prevHeadCountRef.current = count;
    const currentParticipants = fields.map((f) => ({ name: f.name ?? "", email: f.email ?? "" }));

    if (count > prev) {
      for (let i = prev; i < count; i++) append({ name: "", email: "" });
    } else {
      replace(currentParticipants.slice(0, count));
    }
  }, [headCount, fields, append, replace]);

  function onSubmit(values: Step2GroupFormValues) {
    setStep2Data({ ...values, motivation: values.motivation ?? "" });
    nextStep();
  }

  function onInvalid() {
    // 첫 번째 에러 필드로 포커스 이동
    const fields = ["name", "email", "phone", "organizationName", "contactPerson"] as const;
    const firstField = fields.find((f) => errors[f]);
    if (firstField) {
      setFocus(firstField);
      return;
    }
    // 참가자 명단 에러 처리
    if (errors.participants) {
      const idx = Array.isArray(errors.participants)
        ? errors.participants.findIndex((p) => p?.name || p?.email)
        : 0;
      const targetIdx = idx >= 0 ? idx : 0;
      if (errors.participants[targetIdx]?.name) {
        setFocus(`participants.${targetIdx}.name`);
      } else if (errors.participants[targetIdx]?.email) {
        setFocus(`participants.${targetIdx}.email`);
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate>
      <div className="space-y-8">
        {/* 신청자 정보 */}
        <section>
          <h3 className="mb-4 text-sm font-semibold text-gray-500 uppercase tracking-wider">
            신청자 정보
          </h3>
          <div className="space-y-5">
            <FormField
              label="이름"
              required
              placeholder="홍길동"
              error={errors.name?.message}
              {...register("name")}
            />
            <FormField
              label="이메일"
              type="email"
              required
              placeholder="example@email.com"
              error={errors.email?.message}
              {...register("email")}
            />
            <FormField
              label="전화번호"
              type="tel"
              required
              placeholder="010-1234-5678"
              hint="한국 전화번호 형식 (예: 010-1234-5678)"
              error={errors.phone?.message}
              {...register("phone", {
                onChange: (e) => {
                  const formatted = formatPhone(e.target.value);
                  setValue("phone", formatted, { shouldValidate: false });
                },
              })}
            />
            <TextareaField
              label="수강 동기"
              placeholder="수강 신청 동기를 자유롭게 작성해주세요. (선택)"
              rows={3}
              maxLength={300}
              currentLength={motivationValue.length}
              error={errors.motivation?.message}
              {...register("motivation")}
            />
          </div>
        </section>

        {/* 단체 정보 */}
        <section>
          <h3 className="mb-4 text-sm font-semibold text-gray-500 uppercase tracking-wider">
            단체 정보
          </h3>
          <div className="space-y-5">
            <FormField
              label="단체명"
              required
              placeholder="(주)회사명 또는 단체명"
              error={errors.organizationName?.message}
              {...register("organizationName")}
            />

            <div className="flex flex-col gap-1.5">
              <label htmlFor="headCount" className="text-sm font-medium text-gray-700">
                신청 인원수 <span className="text-red-500">*</span>
              </label>
              <Controller
                control={control}
                name="headCount"
                render={({ field }) => (
                  <input
                    {...field}
                    id="headCount"
                    type="number"
                    min={2}
                    max={10}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    aria-invalid={!!errors.headCount}
                    className={cn(
                      "w-32 rounded-lg border px-3.5 py-2.5 text-sm outline-none transition-colors",
                      "focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                      errors.headCount
                        ? "border-red-400 bg-red-50"
                        : "border-gray-300 bg-white hover:border-gray-400"
                    )}
                  />
                )}
              />
              {errors.headCount && (
                <p className="text-xs text-red-600" role="alert">
                  {errors.headCount.message}
                </p>
              )}
              <p className="text-xs text-gray-500">2명 이상 10명 이하</p>
            </div>

            <FormField
              label="담당자 연락처"
              type="tel"
              required
              placeholder="010-1234-5678"
              hint="단체 관련 문의를 받을 담당자 전화번호"
              error={errors.contactPerson?.message}
              {...register("contactPerson", {
                onChange: (e) => {
                  const formatted = formatPhone(e.target.value);
                  setValue("contactPerson", formatted, { shouldValidate: false });
                },
              })}
            />
          </div>
        </section>

        {/* 참가자 명단 */}
        <section>
          <h3 className="mb-1 text-sm font-semibold text-gray-500 uppercase tracking-wider">
            참가자 명단
          </h3>
          <p className="mb-4 text-xs text-gray-400">
            총 {headCount}명의 이름과 이메일을 입력해주세요.
          </p>

          {typeof errors.participants === "object" && !Array.isArray(errors.participants) && (
            <p className="mb-3 text-sm text-red-600" role="alert">
              {(errors.participants as { message?: string }).message}
            </p>
          )}

          <div className="space-y-3">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="rounded-xl border border-gray-200 bg-white p-4"
              >
                <p className="mb-3 text-xs font-semibold text-gray-500">
                  참가자 {index + 1}
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <FormField
                    label="이름"
                    required
                    placeholder="홍길동"
                    error={errors.participants?.[index]?.name?.message}
                    {...register(`participants.${index}.name`)}
                  />
                  <FormField
                    label="이메일"
                    type="email"
                    required
                    placeholder="example@email.com"
                    error={errors.participants?.[index]?.email?.message}
                    {...register(`participants.${index}.email`)}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <StepNavigation onPrev={prevStep} />
    </form>
  );
}

// ─── 공통 하단 버튼 ──────────────────────────────────────────────────────────

function StepNavigation({ onPrev }: { onPrev: () => void }) {
  return (
    <div className="mt-8 flex justify-between">
      <button
        type="button"
        onClick={onPrev}
        className="rounded-xl border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
      >
        ← 이전 단계
      </button>
      <button
        type="submit"
        className="rounded-xl bg-blue-600 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 active:bg-blue-800"
      >
        다음 단계 →
      </button>
    </div>
  );
}
