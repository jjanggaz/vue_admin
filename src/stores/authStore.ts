import { defineStore } from "pinia";
import {
  setTokenInfo,
  getTokenInfo,
  removeTokenInfo,
  removeUserInfo,
  type TokenInfo,
} from "../utils/cookies";
import { request } from "../utils/request";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    isLoggedIn: false,
    user: null as null | { username: string; role: string },
  }),
  actions: {
    // 로그인 처리
    async login(username: string, password: string) {
      try {
        // 로그인 API 호출 (request 함수 사용)
        const result = await request("/api/v1/auth/login", undefined, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: username,
            password: password,
          }),
        });

        if (result && result.access_token) {
          // 전체 토큰 정보를 쿠키에 저장
          const tokenInfo: TokenInfo = {
            access_token: result.access_token,
            refresh_token: result.refresh_token,
            token_type: result.token_type,
            expires_in: result.expires_in,
            scope: result.scope || "read",
          };
          setTokenInfo(tokenInfo);

          // 토큰으로 사용자 정보 조회
          await this.fetchUserInfo();
        } else {
          throw new Error("로그인 응답이 올바르지 않습니다.");
        }
      } catch (error) {
        console.error("로그인 실패:", error);
        throw error;
      }
    },

    // 사용자 정보 조회
    async fetchUserInfo() {
      try {
        // request 함수 사용 (JWT 토큰 자동 포함)
        const result = await request("/api/v1/auth/me", undefined, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (result) {
          const userInfo = {
            username: result.username,
            role: result.role,
          };

          // SessionStorage에 사용자 정보 저장
          sessionStorage.setItem("authName", userInfo.username);
          sessionStorage.setItem("authRole", userInfo.role);

          // 스토어 상태 업데이트
          this.isLoggedIn = true;
          this.user = userInfo;
        } else {
          throw new Error("사용자 정보 응답이 올바르지 않습니다.");
        }
      } catch (error) {
        console.error("사용자 정보 조회 실패:", error);
        throw error;
      }
    },

    // 로그아웃 처리
    logout() {
      this.isLoggedIn = false;
      this.user = null;

      // 모든 토큰 정보 쿠키 제거
      removeTokenInfo();

      // 사용자 정보 쿠키도 제거
      removeUserInfo();

      // SessionStorage에서 사용자 정보 제거
      sessionStorage.removeItem("authName");
      sessionStorage.removeItem("authRole");
    },

    // 새로고침 대비: 저장된 토큰 불러와서 로그인 상태 복구
    loadStoredToken() {
      const tokenInfo = getTokenInfo();
      const authName = sessionStorage.getItem("authName");
      const authRole = sessionStorage.getItem("authRole");

      if (tokenInfo && authName && authRole) {
        this.isLoggedIn = true;
        this.user = {
          username: authName,
          role: authRole,
        };
      }
    },
  },
});
