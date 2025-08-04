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
  removeUserInfo();
};
