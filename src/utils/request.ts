import { refreshAccessToken } from "./tokenManager";

export const request = async (
  path: string,
  params?: Record<string, string> | Record<string, string>[],
  options: RequestInit = { method: "GET" }
) => {
  try {
    // 프록시 사용 시에는 상대 경로로 호출
    const url = new URL(path, window.location.origin);

    // Add params to the query string
    if (params) {
      if (Array.isArray(params)) {
        params.forEach((paramObj) => {
          Object.keys(paramObj).forEach((key) =>
            url.searchParams.append(key, paramObj[key])
          );
        });
      } else {
        Object.keys(params).forEach((key) =>
          url.searchParams.append(key, params[key])
        );
      }
    }

    const headers: Record<string, string> = {
      ...options.headers,
      system_code: import.meta.env.VITE_SYSTEM_CODE,
      user_Id: localStorage.getItem("authUserId") || "",
      wai_lang: localStorage.getItem("wai_lang") || "ko",
    } as Record<string, string>;

    // httpOnly 쿠키를 사용하므로 브라우저에서 토큰을 헤더에 추가하지 않음
    // 서버에서 자동으로 쿠키를 포함하도록 credentials 설정

    const requestOptions = {
      ...options,
      headers,
      credentials: "include" as RequestCredentials, // httpOnly 쿠키를 포함하도록 설정
    };

    const res = await fetch(url.toString(), requestOptions);

    // 401 에러 시 토큰 갱신 시도 (로그인 API 제외)
    // HTTP 상태 코드 또는 응답 본문의 status 필드를 확인
    let shouldRetryWithRefresh = false;

    if (res.status === 401 && !path.includes("/api/main/login")) {
      shouldRetryWithRefresh = true;
    } else if (!res.ok && !path.includes("/api/main/login")) {
      // HTTP 상태가 401이 아니어도 응답 본문에서 status 확인
      try {
        const responseClone = res.clone();
        const errorData = await responseClone.json();
        if (
          errorData.status === 401 ||
          errorData.response?.error_code === "SESSION_REQUIRED"
        ) {
          shouldRetryWithRefresh = true;
        }
      } catch (e) {
        // JSON 파싱 실패시 무시
        console.warn("응답 JSON 파싱 실패:", e);
      }
    }

    if (shouldRetryWithRefresh) {
      console.log("401/400 에러 발생, 토큰 갱신 시도...");
      const refreshSuccess = await refreshAccessToken();
      console.log("토큰 갱신 실패시 기존 토큰의 유효시간이 만료돼서안되는것");

      if (refreshSuccess) {
        console.log("토큰 갱신 성공, 원본 요청 재시도...");
        // 갱신된 토큰으로 재요청
        const retryOptions = {
          ...options,
          headers,
          credentials: "include" as RequestCredentials,
        };

        const retryRes = await fetch(url.toString(), retryOptions);
        console.log("재요청 결과:", retryRes.status, retryRes.statusText);
        if (!retryRes.ok) {
          let errorData;
          try {
            errorData = await retryRes.json();
          } catch {
            const errorResponse = {
              success: false,
              status: retryRes.status,
              message: retryRes.statusText,
              response: `{"detail":"${retryRes.statusText}"}`,
            };
            throw errorResponse;
          }

          const errorResponse = {
            success: false,
            status: retryRes.status,
            message:
              errorData.message || errorData.detail || retryRes.statusText,
            response: `{"detail":"${
              errorData.message || errorData.detail || retryRes.statusText
            }"}`,
          };
          throw errorResponse;
        }

        // 성공 시 표준화된 응답 형식으로 반환
        const successData = await retryRes.json();
        return {
          success: true,
          status: retryRes.status,
          message: successData.message || "Success",
          response: successData.response || successData,
        };
      }

      // 토큰 갱신 실패 시 로그인 페이지로 리다이렉트
      console.log("토큰 갱신 실패, 로그인 페이지로 리다이렉트");

      // Vue Router를 사용하여 로그인 페이지로 리다이렉트
      // window.location.href 대신 router.push 사용
      if (typeof window !== "undefined") {
        // 현재 라우터 인스턴스에 접근하기 위해 전역 변수나 이벤트를 사용
        window.dispatchEvent(new CustomEvent("token-expired"));
      }

      const errorResponse = {
        success: false,
        status: 401,
        message: "인증이 만료되었습니다. 다시 로그인해주세요.",
        response: '{"detail":"인증이 만료되었습니다. 다시 로그인해주세요."}',
      };
      throw errorResponse;
    }

    if (!res.ok) {
      // 백엔드 에러 응답 구조에 맞게 처리
      let errorData;
      try {
        errorData = await res.json();
      } catch (e) {
        console.log(`${res.status} 에러 - JSON 파싱 실패:`, e);
        const errorResponse = {
          success: false,
          status: res.status,
          message: res.statusText,
          response: `{"detail":"${res.statusText}"}`,
        };
        throw errorResponse;
      }

      console.log(`${res.status} 에러 - 서버 응답 데이터:`, errorData);
      console.log(`${res.status} 에러 - errorData.detail:`, errorData.detail);
      console.log(`${res.status} 에러 - errorData.message:`, errorData.message);
      console.log(`${res.status} 에러 - res.statusText:`, res.statusText);

      // 백엔드 응답 구조를 그대로 반환
      const errorResponse = {
        success: false,
        status: res.status,
        message: errorData.message || errorData.detail || res.statusText,
        response: `{"detail":"${
          errorData.message || errorData.detail || res.statusText
        }"}`,
      };
      console.log(`${res.status} 에러 - 최종 errorResponse:`, errorResponse);
      throw errorResponse;
    }

    // 성공 시 표준화된 응답 형식으로 반환
    const successData = await res.json();
    return {
      success: true,
      status: res.status,
      message: successData.message || "Success",
      response: successData.response || successData,
    };
  } catch (e) {
    if (e instanceof Error) {
      console.error(e.message);
      // Error 객체인 경우 백엔드 응답 구조로 변환
      const errorResponse = {
        success: false,
        status: 500,
        message: e.message,
        response: `{"detail":"${e.message}"}`,
      };
      throw errorResponse;
    } else {
      // 이미 백엔드 응답 구조인 경우 그대로 throw
      console.error(e);
      throw e;
    }
  }
};
