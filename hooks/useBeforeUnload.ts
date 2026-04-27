import { useEffect } from "react";

/**
 * 입력 중 페이지 이탈(새로고침/닫기) 시 확인 대화상자를 표시합니다.
 */
export function useBeforeUnload(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;

    function handleBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
      // Chrome 이하 버전 호환
      e.returnValue = "";
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [enabled]);
}

/**
 * 브라우저 뒤로가기 시 확인 대화상자를 표시합니다.
 * history.pushState로 더미 항목을 추가하고 popstate를 감지합니다.
 */
export function useBlockBackNavigation(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;

    // 현재 상태 위에 더미 히스토리 항목 추가 (뒤로가기 감지용)
    history.pushState(null, "", location.href);

    function handlePopState() {
      const confirmed = window.confirm(
        "작성 중인 내용이 있습니다. 페이지를 벗어나면 입력한 내용이 사라질 수 있습니다. 계속하시겠습니까?"
      );
      if (confirmed) {
        // 확인 → 실제로 뒤로 이동
        history.back();
      } else {
        // 취소 → 더미 항목 재추가로 차단 상태 유지
        history.pushState(null, "", location.href);
      }
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [enabled]);
}
