import { defineStore } from "pinia";
import {
  setTokenInfo,
  getTokenInfo,
  removeTokenInfo,
  removeUserInfo,
  type TokenInfo,
} from "../utils/cookies";
import { request } from "../utils/request";
import { isCurrentTokenValid } from "../utils/tokenManager";

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
          // 전체 토큰 정보를 쿠키에 저장 (expires_in은 초 단위)
          const tokenInfo: TokenInfo = {
            access_token: result.access_token,
            refresh_token: result.refresh_token, // 30일 유효
            token_type: result.token_type,
            expires_in: result.expires_in, // 토큰 만료까지 남은 시간(초)
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
    async logout() {
      try {
        // 서버에 토큰 무효화 요청 (토큰이 있는 경우에만)
        const tokenInfo = getTokenInfo();
        if (tokenInfo && tokenInfo.access_token) {
          console.log("서버에 토큰 무효화 요청 중...");
          await request("/api/v1/auth/logout", undefined, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          });
          console.log("서버 토큰 무효화 완료");
        }
      } catch (error) {
        // 서버 요청 실패해도 클라이언트 측 정리는 진행
        console.warn(
          "서버 토큰 무효화 실패, 클라이언트 측 정리만 진행:",
          error
        );
      } finally {
        // 클라이언트 측 정리 (서버 요청 성공/실패와 관계없이)
        this.isLoggedIn = false;
        this.user = null;

        // 모든 토큰 정보 쿠키 제거
        removeTokenInfo();

        // 사용자 정보 쿠키도 제거
        removeUserInfo();

        // SessionStorage에서 사용자 정보 제거
        sessionStorage.removeItem("authName");
        sessionStorage.removeItem("authRole");

        console.log("클라이언트 측 로그아웃 정리 완료");
      }
    },

    // 새로고침 대비: 저장된 토큰 불러와서 로그인 상태 복구
    async loadStoredToken() {
      const tokenInfo = getTokenInfo();
      const authName = sessionStorage.getItem("authName");
      const authRole = sessionStorage.getItem("authRole");

      // 토큰이 있고 유효하며 사용자 정보도 있는 경우에만 로그인 상태 복구
      if (tokenInfo && authName && authRole && isCurrentTokenValid()) {
        this.isLoggedIn = true;
        this.user = {
          username: authName,
          role: authRole,
        };
        console.log("저장된 토큰으로 로그인 상태 복구 성공");
      } else {
        // 토큰이 유효하지 않으면 모든 정보 삭제
        if (tokenInfo && !isCurrentTokenValid()) {
          console.log("저장된 토큰이 유효하지 않음, 모든 인증 정보 삭제");
          await this.logout();
        }
      }
    },
  },
});
