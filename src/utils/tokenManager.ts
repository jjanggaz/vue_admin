import {
  getTokenInfo,
  setTokenInfo,
  removeTokenInfo,
  type TokenInfo,
} from "./cookies";

// 토큰 갱신 함수
export const refreshAccessToken = async (): Promise<boolean> => {
  try {
    const tokenInfo = getTokenInfo();

    if (!tokenInfo || !tokenInfo.refresh_token) {
      console.error("Refresh token이 없습니다.");
      return false;
    }

    // 디버깅을 위한 토큰 정보 로그 (실제 운영에서는 제거)
    console.log("토큰 갱신 시도:", {
      refresh_token_length: tokenInfo.refresh_token.length,
      refresh_token_preview: tokenInfo.refresh_token.substring(0, 20) + "...",
      token_type: tokenInfo.token_type,
      expires_in: tokenInfo.expires_in,
    });

    const requestBody = {
      refresh_token: tokenInfo.refresh_token,
    };

    console.log("토큰 갱신 요청 본문:", requestBody);

    const response = await fetch("/api/v1/auth/refresh", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    console.log("토큰 갱신 응답 상태:", response.status, response.statusText);

    if (!response.ok) {
      // 상세한 에러 정보 수집
      let errorMessage = `토큰 갱신 실패: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        console.error("토큰 갱신 에러 상세:", errorData);
        if (errorData.detail) {
          errorMessage += ` - ${errorData.detail}`;
        }
      } catch (parseError) {
        console.error("에러 응답 파싱 실패:", parseError);
      }

      console.error(errorMessage);
      return false;
    }

    const result = await response.json();
    console.log("토큰 갱신 응답:", result);

    if (result && result.access_token) {
      // 새로운 토큰 정보 저장 (expires_in은 초 단위)
      const newTokenInfo: TokenInfo = {
        access_token: result.access_token,
        refresh_token: result.refresh_token || tokenInfo.refresh_token, // refresh_token은 30일 유효
        token_type: result.token_type || tokenInfo.token_type,
        expires_in: result.expires_in || tokenInfo.expires_in, // 초 단위
        scope: result.scope || tokenInfo.scope,
      };
      setTokenInfo(newTokenInfo);

      console.log("토큰 갱신 성공");
      return true;
    } else {
      console.error("토큰 갱신 응답이 올바르지 않습니다:", result);
      return false;
    }
  } catch (error) {
    console.error("토큰 갱신 중 오류:", error);
    return false;
  }
};

// 토큰 유효성 검사 (간단한 JWT 구조 검사)
export const isTokenValid = (token: string): boolean => {
  if (!token) return false;

  try {
    // JWT는 3개의 부분으로 구성: header.payload.signature
    const parts = token.split(".");
    if (parts.length !== 3) return false;

    // payload 부분을 디코드하여 만료 시간 확인
    const payload = JSON.parse(atob(parts[1]));
    const currentTime = Math.floor(Date.now() / 1000);

    // exp (만료 시간)가 현재 시간보다 크면 유효
    return payload.exp > currentTime;
  } catch (error) {
    console.error("토큰 유효성 검사 중 오류:", error);
    return false;
  }
};

// 현재 access_token이 유효한지 확인
export const isCurrentTokenValid = (): boolean => {
  const tokenInfo = getTokenInfo();
  return tokenInfo ? isTokenValid(tokenInfo.access_token) : false;
};

// 토큰 만료 시간까지 남은 시간 (초)
export const getTokenExpiryTime = (token: string): number => {
  try {
    const parts = token.split(".");
    const payload = JSON.parse(atob(parts[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp - currentTime;
  } catch (error) {
    return 0;
  }
};

// 자동 토큰 갱신 (만료 5분 전에 갱신)
export const shouldRefreshToken = (): boolean => {
  const tokenInfo = getTokenInfo();
  if (!tokenInfo) return false;

  const timeUntilExpiry = getTokenExpiryTime(tokenInfo.access_token);
  return timeUntilExpiry < 300; // 5분 (300초) 전에 갱신
};

// 모든 토큰 제거
export const clearAllTokens = () => {
  removeTokenInfo();
};
