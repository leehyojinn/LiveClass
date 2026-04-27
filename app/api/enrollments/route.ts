import { NextRequest, NextResponse } from "next/server";
import type { EnrollmentRequest, EnrollmentResponse, ErrorResponse } from "@/types/enrollment";

// 중복 신청 체크를 위한 인메모리 저장소 (실제 환경에서는 DB 사용)
const enrollmentRecord = new Set<string>(); // "courseId:email" 형태로 저장

export async function POST(request: NextRequest) {
  // 실제 API 시뮬레이션을 위한 지연
  await new Promise((resolve) => setTimeout(resolve, 800));

  let body: EnrollmentRequest;
  try {
    body = await request.json();
  } catch {
    const error: ErrorResponse = {
      code: "INVALID_INPUT",
      message: "요청 형식이 올바르지 않습니다.",
    };
    return NextResponse.json(error, { status: 400 });
  }

  // 강의 ID 검증
  if (!body.courseId) {
    const error: ErrorResponse = {
      code: "INVALID_INPUT",
      message: "강의를 선택해주세요.",
      details: { courseId: "강의 선택은 필수입니다." },
    };
    return NextResponse.json(error, { status: 422 });
  }

  // 이미 정원이 찬 강의 시뮬레이션 (design-002)
  if (body.courseId === "design-002") {
    const error: ErrorResponse = {
      code: "COURSE_FULL",
      message: "해당 강의는 정원이 초과되었습니다. 다른 강의를 선택해주세요.",
    };
    return NextResponse.json(error, { status: 409 });
  }

  // 중복 신청 체크
  const enrollmentKey = `${body.courseId}:${body.applicant.email}`;
  if (enrollmentRecord.has(enrollmentKey)) {
    const error: ErrorResponse = {
      code: "DUPLICATE_ENROLLMENT",
      message: "이미 해당 강의에 신청하셨습니다.",
    };
    return NextResponse.json(error, { status: 409 });
  }

  // 약관 동의 검증
  if (!body.agreedToTerms) {
    const error: ErrorResponse = {
      code: "INVALID_INPUT",
      message: "이용약관에 동의해주세요.",
      details: { agreedToTerms: "이용약관 동의는 필수입니다." },
    };
    return NextResponse.json(error, { status: 422 });
  }

  // 단체 신청 검증
  if (body.type === "group") {
    if (!body.group || body.group.headCount < 2 || body.group.headCount > 10) {
      const error: ErrorResponse = {
        code: "INVALID_INPUT",
        message: "단체 신청 인원은 2명 이상 10명 이하여야 합니다.",
        details: { headCount: "신청 인원은 2~10명이어야 합니다." },
      };
      return NextResponse.json(error, { status: 422 });
    }

    if (body.group.participants.length !== body.group.headCount) {
      const error: ErrorResponse = {
        code: "INVALID_INPUT",
        message: "참가자 명단 수가 신청 인원과 일치하지 않습니다.",
        details: { participants: "참가자 명단을 모두 입력해주세요." },
      };
      return NextResponse.json(error, { status: 422 });
    }
  }

  // 신청 저장 (중복 방지용)
  enrollmentRecord.add(enrollmentKey);

  const response: EnrollmentResponse = {
    enrollmentId: `ENR-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    status: "confirmed",
    enrolledAt: new Date().toISOString(),
  };

  return NextResponse.json(response, { status: 201 });
}
