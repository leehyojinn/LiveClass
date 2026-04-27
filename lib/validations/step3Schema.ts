import { z } from "zod";

export const step3Schema = z.object({
  agreedToTerms: z.boolean().refine((val) => val === true, {
    message: "이용약관에 동의해주세요.",
  }),
});

export type Step3FormValues = z.infer<typeof step3Schema>;
