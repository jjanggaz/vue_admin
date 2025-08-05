// httpOnly 쿠키를 사용하므로 토큰 관련 로직이 단순화됨
// 토큰 갱신은 서버에서 자동으로 처리됨

// 토큰 갱신 함수 (서버에서 자동 처리되므로 단순화)
export const refreshAccessToken = async (): Promise<boolean> => {
  try {
    console.log("토큰 갱신 시도...");

    const response = await fetch("/api/main/refresh", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // httpOnly 쿠키 포함
    });

    console.log("토큰 갱신 응답 상태:", response.status, response.statusText);

    if (!response.ok) {
      console.error("토큰 갱신 실패:", response.status, response.statusText);

      // 응답 내용도 확인
      try {
        const errorData = await response.json();
        console.error("토큰 갱신 실패 상세:", errorData);
      } catch (e) {
        console.error("토큰 갱신 실패 응답 파싱 실패:", e);
      }

      return false;
    }

    // 성공 응답 내용도 확인
    try {
      const successData = await response.json();
      console.log("토큰 갱신 성공 응답:", successData);
    } catch (e) {
      console.log("토큰 갱신 성공 (응답 내용 없음)");
    }

    console.log("토큰 갱신 성공");
    return true;
  } catch (error) {
    console.error("토큰 갱신 중 네트워크 오류:", error);
    return false;
  }
};

// 토큰 유효성 검사 (httpOnly 쿠키는 JavaScript에서 접근 불가)
// 서버에서 토큰 유효성을 검사하므로 클라이언트에서는 단순히 true 반환
export const isTokenValid = (token: string): boolean => {
  // httpOnly 쿠키는 JavaScript에서 접근할 수 없으므로
  // 서버에서 토큰 유효성을 검사함
  return true;
};

// 현재 토큰이 유효한지 확인 (localStorage 기반)
export const isCurrentTokenValid = async (): Promise<boolean> => {
  try {
    // localStorage에서 사용자 정보 확인
    const authName = localStorage.getItem("authName");
    const authUsername = localStorage.getItem("authUsername");
    const authCodes = localStorage.getItem("authCodes");

    if (!authName || !authUsername || !authCodes) {
      console.log("localStorage에 사용자 정보가 없음");
      return false;
    }

    // httpOnly 쿠키는 JavaScript에서 접근할 수 없으므로
    // 실제 토큰 유효성은 API 호출 시 401 에러로 확인됨
    // 여기서는 localStorage에 사용자 정보가 있는지만 확인
    console.log(
      "localStorage에 사용자 정보 존재 (토큰은 httpOnly 쿠키에 저장됨)"
    );
    return true;
  } catch (error) {
    console.error("토큰 유효성 검사 중 오류:", error);
    return false;
  }
};

// 자동 토큰 갱신 인터벌 ID
let autoRefreshInterval: number | null = null;

// 자동 토큰 갱신 시작 (23시간마다 갱신)
export const startAutoRefresh = () => {
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval);
  }

  console.log("자동 토큰 갱신 시작 (23시간마다)");
  autoRefreshInterval = setInterval(async () => {
    console.log("자동 토큰 갱신 실행...");
    const success = await refreshAccessToken();
    if (!success) {
      console.error("자동 토큰 갱신 실패");
      stopAutoRefresh();
    }
  }, 23 * 60 * 60 * 1000); // 23시간마다 갱신 (23 * 60 * 60 * 1000ms)
};

// 자동 토큰 갱신 중지
export const stopAutoRefresh = () => {
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval);
    autoRefreshInterval = null;
    console.log("자동 토큰 갱신 중지");
  }
};

// 쿠키 삭제 함수
export const deleteCookie = (name: string, path: string = "/") => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path};`;
};

// 모든 토큰 제거 (HttpOnly가 false인 경우 클라이언트에서도 삭제)
export const clearAllTokens = () => {
  // wai_access과 wai_refresh 쿠키 삭제
  deleteCookie("wai_access");
  deleteCookie("wai_refresh");
  deleteCookie("wai_session");
  console.log("토큰 쿠키 삭제 완료");
};
