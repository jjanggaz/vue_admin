import { getTokenInfo } from "./cookies";
import { refreshAccessToken, shouldRefreshToken } from "./tokenManager";

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

    // JWT 토큰을 헤더에 자동으로 추가
    let tokenInfo = getTokenInfo();
    const headers: Record<string, string> = {
      ...options.headers,
    } as Record<string, string>;

    // 토큰이 있고 만료가 임박하면 자동 갱신
    if (tokenInfo && shouldRefreshToken()) {
      console.log("토큰 만료 임박, 자동 갱신 시도...");
      const refreshSuccess = await refreshAccessToken();
      if (refreshSuccess) {
        tokenInfo = getTokenInfo(); // 갱신된 토큰 정보 가져오기
      }
    }

    if (tokenInfo) {
      headers[
        "Authorization"
      ] = `${tokenInfo.token_type} ${tokenInfo.access_token}`;
    }

    const requestOptions = {
      ...options,
      headers,
    };

    const res = await fetch(url.toString(), requestOptions);

    // 401 에러 시 토큰 갱신 시도
    if (res.status === 401 && tokenInfo) {
      console.log("401 에러 발생, 토큰 갱신 시도...");
      const refreshSuccess = await refreshAccessToken();

      if (refreshSuccess) {
        // 갱신된 토큰으로 재요청
        const newTokenInfo = getTokenInfo();
        if (newTokenInfo) {
          headers[
            "Authorization"
          ] = `${newTokenInfo.token_type} ${newTokenInfo.access_token}`;
          const retryOptions = {
            ...options,
            headers,
          };

          const retryRes = await fetch(url.toString(), retryOptions);
          if (!retryRes.ok) {
            throw new Error(`API Call Fail: ${retryRes.statusText}`);
          }
          return await retryRes.json();
        }
      }

      // 토큰 갱신 실패 시 로그인 페이지로 리다이렉트
      throw new Error("인증이 만료되었습니다. 다시 로그인해주세요.");
    }

    if (!res.ok) {
      // 422 오류 등 상세한 에러 정보를 위해 응답 본문도 포함
      let errorMessage = `API Call Fail: ${res.status} ${res.statusText}`;
      try {
        const errorData = await res.json();
        if (errorData.detail) {
          // detail이 배열인 경우 (422 validation error)
          if (Array.isArray(errorData.detail)) {
            const messages = errorData.detail
              .map((item: any) => item.msg)
              .filter(Boolean);
            if (messages.length > 0) {
              errorMessage = messages.join("\n");
            }
          } else {
            // detail이 문자열인 경우
            errorMessage = errorData.detail;
          }
        }
      } catch (e) {
        // JSON 파싱 실패 시 기본 메시지 사용
      }
      throw new Error(errorMessage);
    }
    return await res.json();
  } catch (e) {
    if (e instanceof Error) {
      console.error(e.message);
      throw e; // 에러를 다시 throw해서 호출하는 곳에서 처리할 수 있도록
    } else {
      const error = new Error("An unexpected error occurred");
      console.error(error.message);
      throw error;
    }
  }
};
