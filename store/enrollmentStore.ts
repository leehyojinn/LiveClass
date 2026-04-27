import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  FormStep,
  Step1Data,
  Step2Data,
  Step3Data,
  EnrollmentFormState,
  EnrollmentResponse,
} from "@/types/enrollment";

interface EnrollmentStore extends EnrollmentFormState {
  // Step navigation
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: FormStep) => void;

  // Data setters
  setStep1Data: (data: Step1Data) => void;
  setStep2Data: (data: Step2Data) => void;
  setStep3Data: (data: Partial<Step3Data>) => void;
  setSubmittedEnrollment: (data: EnrollmentResponse) => void;

  // Reset
  reset: () => void;
}

const initialState: EnrollmentFormState = {
  currentStep: 1,
  step1: null,
  step2: null,
  step3: { agreedToTerms: false },
  submittedEnrollment: null,
};

export const useEnrollmentStore = create<EnrollmentStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      nextStep: () => {
        const { currentStep } = get();
        if (currentStep < 3) {
          set({ currentStep: (currentStep + 1) as FormStep });
        }
      },

      prevStep: () => {
        const { currentStep } = get();
        if (currentStep > 1) {
          set({ currentStep: (currentStep - 1) as FormStep });
        }
      },

      goToStep: (step: FormStep) => {
        set({ currentStep: step });
      },

      setStep1Data: (data: Step1Data) => {
        const prev = get().step1;
        // 신청 유형이 변경된 경우 step2 데이터 초기화
        if (prev && prev.enrollmentType !== data.enrollmentType) {
          set({ step1: data, step2: null });
        } else {
          set({ step1: data });
        }
      },

      setStep2Data: (data: Step2Data) => {
        set({ step2: data });
      },

      setStep3Data: (data: Partial<Step3Data>) => {
        set((state) => ({
          step3: { ...state.step3, ...data },
        }));
      },

      setSubmittedEnrollment: (data: EnrollmentResponse) => {
        set({ submittedEnrollment: data });
      },

      reset: () => {
        set(initialState);
      },
    }),
    {
      name: "enrollment-form-storage",
      // 완료된 신청 정보는 저장하지 않음
      partialize: (state) => ({
        currentStep: state.currentStep,
        step1: state.step1,
        step2: state.step2,
        step3: state.step3,
      }),
    }
  )
);
