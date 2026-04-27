// ─── Course Types ──────────────────────────────────────────────────────────

export type CourseCategory = "development" | "design" | "marketing" | "business";

export interface Course {
  id: string;
  title: string;
  description: string;
  category: CourseCategory;
  price: number;
  maxCapacity: number;
  currentEnrollment: number;
  startDate: string; // ISO 8601
  endDate: string;   // ISO 8601
  instructor: string;
}

export interface CourseListResponse {
  courses: Course[];
  categories: CourseCategory[];
}

// ─── Enrollment Types ──────────────────────────────────────────────────────

export type EnrollmentType = "personal" | "group";

export interface Applicant {
  name: string;
  email: string;
  phone: string;
  motivation?: string;
}

export interface GroupInfo {
  organizationName: string;
  headCount: number;
  participants: Array<{ name: string; email: string }>;
  contactPerson: string;
}

export interface PersonalEnrollmentRequest {
  courseId: string;
  type: "personal";
  applicant: Applicant;
  agreedToTerms: boolean;
}

export interface GroupEnrollmentRequest {
  courseId: string;
  type: "group";
  applicant: Applicant;
  group: GroupInfo;
  agreedToTerms: boolean;
}

export type EnrollmentRequest = PersonalEnrollmentRequest | GroupEnrollmentRequest;

export interface EnrollmentResponse {
  enrollmentId: string;
  status: "confirmed" | "pending";
  enrolledAt: string;
}

// ─── Error Types ────────────────────────────────────────────────────────────

export type ErrorCode =
  | "COURSE_FULL"
  | "DUPLICATE_ENROLLMENT"
  | "INVALID_INPUT"
  | "INTERNAL_ERROR";

export interface ErrorResponse {
  code: ErrorCode;
  message: string;
  details?: Record<string, string>;
}

// ─── Form State Types ───────────────────────────────────────────────────────

export type FormStep = 1 | 2 | 3;

export interface Step1Data {
  courseId: string;
  enrollmentType: EnrollmentType;
}

export interface Step2PersonalData {
  name: string;
  email: string;
  phone: string;
  motivation: string;
}

export interface Step2GroupData extends Step2PersonalData {
  organizationName: string;
  headCount: number;
  participants: Array<{ name: string; email: string }>;
  contactPerson: string;
}

export type Step2Data =
  | ({ type: "personal" } & Step2PersonalData)
  | ({ type: "group" } & Step2GroupData);

export interface Step3Data {
  agreedToTerms: boolean;
}

export interface EnrollmentFormState {
  currentStep: FormStep;
  step1: Step1Data | null;
  step2: Step2Data | null;
  step3: Step3Data;
  submittedEnrollment: EnrollmentResponse | null;
}
