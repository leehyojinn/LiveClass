import { useMutation } from "@tanstack/react-query";
import type { EnrollmentRequest, EnrollmentResponse, ErrorResponse } from "@/types/enrollment";

async function submitEnrollment(data: EnrollmentRequest): Promise<EnrollmentResponse> {
  const response = await fetch("/api/enrollments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw error;
  }

  return response.json();
}

export function useEnrollmentMutation() {
  return useMutation({
    mutationFn: submitEnrollment,
  });
}
