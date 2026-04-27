import { useMutation } from "@tanstack/react-query";
import type { EnrollmentRequest, EnrollmentResponse, ErrorResponse } from "@/types/enrollment";

/**
 * 비즈니스 에러 (서버가 명시적으로 반환한 오류 코드)
 * 네트워크 에러(fetch 자체 실패)와 구분하기 위해 별도 클래스로 래핑
 */
export class BusinessError extends Error {
  constructor(public readonly payload: ErrorResponse) {
    super(payload.message);
    this.name = "BusinessError";
  }
}

async function submitEnrollment(data: EnrollmentRequest): Promise<EnrollmentResponse> {
  let response: Response;

  try {
    response = await fetch("/api/enrollments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  } catch {
    // fetch 자체 실패 = 네트워크 에러 (오프라인, DNS 실패 등)
    throw new Error("네트워크 연결을 확인해주세요.");
  }

  if (!response.ok) {
    let payload: ErrorResponse;
    try {
      payload = await response.json();
    } catch {
      throw new Error("서버 응답을 처리할 수 없습니다. 잠시 후 다시 시도해주세요.");
    }
    throw new BusinessError(payload);
  }

  return response.json();
}

export function useEnrollmentMutation() {
  return useMutation({
    mutationFn: submitEnrollment,
  });
}
