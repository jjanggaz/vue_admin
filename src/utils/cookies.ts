// 쿠키 관리 유틸리티 함수들

// 쿠키 설정 (보안 강화)
export const setCookie = (name: string, value: string, days: number = 7) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);

  // 보안 속성 추가
  const secure = window.location.protocol === "https:" ? ";Secure" : "";
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict${secure}`;
};

// 쿠키 가져오기
export const getCookie = (name: string): string | null => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

// 쿠키 삭제 (보안 강화)
export const deleteCookie = (name: string) => {
  const secure = window.location.protocol === "https:" ? ";Secure" : "";
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Strict${secure}`;
};

// 토큰 정보 인터페이스
export interface TokenInfo {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

// JWT 토큰 관련 쿠키 관리
export const setAuthToken = (token: string, expiresInSeconds: number) => {
  // expires_in이 초 단위이므로 일 단위로 변환 (최소 1일)
  const days = Math.max(1, Math.ceil(expiresInSeconds / (24 * 60 * 60)));
  setCookie("auth_token", token, days);
};

export const getAuthToken = (): string | null => {
  return getCookie("auth_token");
};

export const removeAuthToken = () => {
  deleteCookie("auth_token");
};

// Refresh Token 관련 쿠키 관리 (30일 고정)
export const setRefreshToken = (token: string) => {
  setCookie("refresh_token", token, 30); // 30일간 유효
};

export const getRefreshToken = (): string | null => {
  return getCookie("refresh_token");
};

export const removeRefreshToken = () => {
  deleteCookie("refresh_token");
};

// 토큰 타입 관리
export const setTokenType = (tokenType: string) => {
  setCookie("token_type", tokenType, 1);
};

export const getTokenType = (): string | null => {
  return getCookie("token_type");
};

export const removeTokenType = () => {
  deleteCookie("token_type");
};

// 토큰 만료 시간 관리 (초 단위 저장)
export const setTokenExpiresIn = (expiresIn: number) => {
  setCookie("token_expires_in", expiresIn.toString(), 1);
};

export const getTokenExpiresIn = (): number | null => {
  const expiresIn = getCookie("token_expires_in");
  return expiresIn ? parseInt(expiresIn) : null;
};

export const removeTokenExpiresIn = () => {
  deleteCookie("token_expires_in");
};

// 토큰 스코프 관리
export const setTokenScope = (scope: string) => {
  setCookie("token_scope", scope, 1);
};

export const getTokenScope = (): string | null => {
  return getCookie("token_scope");
};

export const removeTokenScope = () => {
  deleteCookie("token_scope");
};

// 전체 토큰 정보 저장
export const setTokenInfo = (tokenInfo: TokenInfo) => {
  setAuthToken(tokenInfo.access_token, tokenInfo.expires_in);
  setRefreshToken(tokenInfo.refresh_token);
  setTokenType(tokenInfo.token_type);
  setTokenExpiresIn(tokenInfo.expires_in);
  setTokenScope(tokenInfo.scope);
};

// 전체 토큰 정보 가져오기
export const getTokenInfo = (): TokenInfo | null => {
  const access_token = getAuthToken();
  const refresh_token = getRefreshToken();
  const token_type = getTokenType();
  const expires_in = getTokenExpiresIn();
  const scope = getTokenScope();

  if (
    access_token &&
    refresh_token &&
    token_type &&
    expires_in !== null &&
    scope
  ) {
    return {
      access_token,
      refresh_token,
      token_type,
      expires_in,
      scope,
    };
  }
  return null;
};

// 전체 토큰 정보 제거
export const removeTokenInfo = () => {
  removeAuthToken();
  removeRefreshToken();
  removeTokenType();
  removeTokenExpiresIn();
  removeTokenScope();
};

// 사용자 정보 쿠키 관리
export const setUserInfo = (user: {
  username: string;
  name: string;
  role: string;
}) => {
  setCookie("username", user.username, 7);
  setCookie("user_name", user.name, 7);
  setCookie("user_role", user.role, 7);
};

export const getUserInfo = (): {
  username: string;
  name: string;
  role: string;
} | null => {
  const username = getCookie("username");
  const name = getCookie("user_name");
  const role = getCookie("user_role");

  if (username && name && role) {
    return { username, name, role };
  }
  return null;
};

export const removeUserInfo = () => {
  deleteCookie("username");
  deleteCookie("user_name");
  deleteCookie("user_role");
};

// 모든 인증 관련 쿠키 제거
export const clearAuthCookies = () => {
  removeTokenInfo();
  removeUserInfo();
};
