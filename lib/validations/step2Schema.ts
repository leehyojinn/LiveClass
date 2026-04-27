import { z } from "zod";

// 한국 전화번호 정규식: 010-XXXX-XXXX, 02-XXX-XXXX 등
const koreanPhoneRegex = /^(01[016789]{1}|02|0[3-9]{1}[0-9]{1})-?[0-9]{3,4}-?[0-9]{4}$/;

export const applicantSchema = z.object({
  name: z
    .string()
    .min(2, "이름은 2자 이상이어야 합니다.")
    .max(20, "이름은 20자 이하이어야 합니다."),
  email: z
    .string()
    .min(1, "이메일을 입력해주세요.")
    .email("올바른 이메일 형식을 입력해주세요."),
  phone: z
    .string()
    .min(1, "전화번호를 입력해주세요.")
    .regex(koreanPhoneRegex, "올바른 한국 전화번호 형식을 입력해주세요. (예: 010-1234-5678)"),
  motivation: z
    .string()
    .max(300, "수강 동기는 300자 이하이어야 합니다.")
    .optional()
    .or(z.literal("")),
});

const participantSchema = z.object({
  name: z.string().min(1, "참가자 이름을 입력해주세요."),
  email: z.string().min(1, "참가자 이메일을 입력해주세요.").email("올바른 이메일 형식을 입력해주세요."),
});

export const step2PersonalSchema = z.object({
  type: z.literal("personal"),
  ...applicantSchema.shape,
});

export const step2GroupSchema = z
  .object({
    type: z.literal("group"),
    ...applicantSchema.shape,
    organizationName: z.string().min(1, "단체명을 입력해주세요."),
    headCount: z
      .number({ invalid_type_error: "인원수를 입력해주세요." })
      .min(2, "단체 신청 인원은 최소 2명이어야 합니다.")
      .max(10, "단체 신청 인원은 최대 10명이어야 합니다."),
    participants: z
      .array(participantSchema)
      .min(1, "참가자 명단을 입력해주세요."),
    contactPerson: z
      .string()
      .min(1, "담당자 연락처를 입력해주세요.")
      .regex(koreanPhoneRegex, "올바른 한국 전화번호 형식을 입력해주세요."),
  })
  .superRefine((data, ctx) => {
    // 참가자 이메일 중복 검증
    const emails = data.participants.map((p) => p.email).filter(Boolean);
    const uniqueEmails = new Set(emails);
    if (emails.length !== uniqueEmails.size) {
      // 중복 이메일이 있는 인덱스 찾기
      const seen = new Set<string>();
      data.participants.forEach((p, idx) => {
        if (p.email && seen.has(p.email)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "참가자 이메일이 중복되었습니다.",
            path: ["participants", idx, "email"],
          });
        }
        if (p.email) seen.add(p.email);
      });
    }

    // 참가자 수와 headCount 일치 검증
    if (data.participants.length !== data.headCount) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `참가자 명단은 신청 인원(${data.headCount}명)과 일치해야 합니다.`,
        path: ["participants"],
      });
    }
  });

export const step2Schema = z.discriminatedUnion("type", [
  step2PersonalSchema,
  step2GroupSchema,
]);

export type Step2PersonalFormValues = z.infer<typeof step2PersonalSchema>;
export type Step2GroupFormValues = z.infer<typeof step2GroupSchema>;
export type Step2FormValues = z.infer<typeof step2Schema>;
