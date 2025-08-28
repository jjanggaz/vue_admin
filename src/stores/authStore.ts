import { defineStore } from "pinia";
import { removeUserInfo } from "../utils/cookies";
import { request } from "../utils/request";
import { addRoleBasedRoutes } from "../router";
import {
  startAutoRefresh,
  stopAutoRefresh,
  isCurrentTokenValid,
} from "../utils/tokenManager";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    isLoggedIn: false,
    user: null as null | {
      username: string;
      fullName: string;
      roleName: string; // 사용자 역할명
      codes: string[]; // 사용자 접근 가능한 화면 코드 배열
    },
  }),
  actions: {
    // 로그인 처리
    async login(username: string, password: string, selectedLang?: string) {
      try {
        // 로그인 API 호출 (request 함수 사용)
        const result = await request("/api/main/login", undefined, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: username,
            password: password,
            system_code: import.meta.env.VITE_SYSTEM_CODE,
            language: selectedLang || "ko", // 선택된 언어 전송
          }),
        });

        if (result) {
          // 로그인 성공 시
          if (result.success && result.response) {
            const responseData = result.response;

            // WAI_WEB_ADMIN 시스템 코드의 메뉴들 필터링 START =======================
            const waiWebAdminMenus =
              responseData.menus?.filter(
                (menu: any) => menu.system_code === "WAI_WEB_ADMIN"
              ) || []; // WAI_WEB_ADMIN으로 된 코드만 필터
            const menuCodes = waiWebAdminMenus
              .map((menu: any) => menu.menu_code)
              .filter((code: string) => code.startsWith("WEB")); // WEB으로 시작하는 코드만 필터
            // WAI_WEB_ADMIN 시스템 코드의 메뉴들 필터링 END =======================

            // 메뉴 접근 권한 확인
            if (!responseData.menus || responseData.menus.length === 0) {
              throw new Error("메뉴 접근 권한이 없습니다.");
            }

            // 로그인 응답에서 사용자 정보 처리
            if (responseData.user_info) {
              // 역할 정보 추출
              const roleName =
                responseData.user_info.roles?.[0]?.role_name || "";

              const userInfo = {
                username: responseData.user_info.username,
                fullName: responseData.user_info.full_name,
                roleName: roleName,
                codes: menuCodes || [], // 서버에서 받은 코드 배열 (테스트 하기 위해서 모든 코드 추가)
              };

              // LocalStorage에 사용자 정보 저장 (새창 공유용)
              localStorage.setItem("authName", userInfo.fullName);
              localStorage.setItem("authUsername", userInfo.username);
              localStorage.setItem("authRoleName", userInfo.roleName);
              localStorage.setItem("authCodes", JSON.stringify(userInfo.codes));
              localStorage.setItem(
                "authUserId",
                responseData.user_info.user_id
              );

              // 스토어 상태 업데이트
              this.isLoggedIn = true;
              this.user = userInfo;

              // 코드 기반 라우트 동적 추가
              addRoleBasedRoutes(userInfo.codes);

              // 자동 토큰 갱신 시작
              startAutoRefresh();
            }
          } else {
            // 로그인 실패 시 - 상태 코드별 에러 처리
            if (result.status === 401) {
              // 인증 실패 (아이디/비밀번호 오류)
              throw new Error(
                result.message || "아이디 또는 비밀번호가 올바르지 않습니다."
              );
            } else if (result.status === 403) {
              // 메뉴 접근 권한 없음
              throw new Error(result.message || "메뉴 접근 권한이 없습니다.");
            } else {
              // 기타 오류
              throw new Error(result.message || "로그인에 실패했습니다.");
            }
          }
        } else {
          throw new Error("서버 응답이 없습니다.");
        }
      } catch (error) {
        console.error("로그인 실패:", error);
        throw error;
      }
    },

    // 로그아웃 처리
    async logout() {
      try {
        // 서버에 토큰 무효화 요청
        console.log("서버에 토큰 무효화 요청 중...");
        await request("/api/main/logout", undefined, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            system_code: import.meta.env.VITE_SYSTEM_CODE,
          }),
        });
        console.log("서버 토큰 무효화 완료");
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

        // 사용자 정보 쿠키 제거
        removeUserInfo();

        // LocalStorage에서 사용자 정보 제거
        localStorage.removeItem("authName");
        localStorage.removeItem("authUsername");
        localStorage.removeItem("authRoleName");
        localStorage.removeItem("authCodes");
        localStorage.removeItem("authUserId");

        // 자동 토큰 갱신 중지
        stopAutoRefresh();

        console.log("클라이언트 측 로그아웃 정리 완료");
      }
    },

    // 새로고침 대비: 저장된 사용자 정보로 로그인 상태 복구
    async loadStoredToken() {
      // localStorage에서 사용자 정보 확인
      const authName = localStorage.getItem("authName");
      const authCodesStr = localStorage.getItem("authCodes");
      const authRoleName = localStorage.getItem("authRoleName");
      const authUsername = localStorage.getItem("authUsername");

      // 사용자 정보가 있는 경우에만 로그인 상태 복구
      if (authName && authCodesStr) {
        const authCodes = JSON.parse(authCodesStr);

        this.isLoggedIn = true;
        this.user = {
          username: authUsername || authName,
          fullName: authName,
          roleName: authRoleName || "",
          codes: authCodes,
        };

        // 코드 기반 라우트 동적 추가
        addRoleBasedRoutes(authCodes);

        // 자동 토큰 갱신 시작
        startAutoRefresh();

        console.log("저장된 사용자 정보로 로그인 상태 복구 성공");
      }
    },

    // 토큰 유효성 확인 (새창에서 로그인 상태 확인용)
    async checkTokenValidity(): Promise<boolean> {
      try {
        console.log("토큰 유효성 확인 시작...");
        const isValid = await isCurrentTokenValid();
        console.log("토큰 유효성 확인 결과:", isValid);

        if (isValid) {
          // 토큰이 유효하면 localStorage에서 사용자 정보 복구
          console.log("토큰이 유효하므로 사용자 정보 복구 시도...");
          await this.loadStoredToken();
          console.log("사용자 정보 복구 완료, isLoggedIn:", this.isLoggedIn);
        } else {
          // 토큰이 무효하면 로그인 상태를 false로 설정하고 localStorage 정리
          console.log(
            "토큰이 무효하므로 로그인 상태를 false로 설정하고 localStorage 정리"
          );
          this.isLoggedIn = false;
          this.user = null;

          // localStorage 정리 (중요!)
          localStorage.removeItem("authName");
          localStorage.removeItem("authUsername");
          localStorage.removeItem("authRoleName");
          localStorage.removeItem("authCodes");
          localStorage.removeItem("authUserId");
        }
        return this.isLoggedIn; // 실제 스토어 상태를 반환
      } catch (error) {
        console.error("토큰 유효성 확인 실패:", error);
        // 에러 발생 시에도 로그인 상태를 false로 설정하고 localStorage 정리
        this.isLoggedIn = false;
        this.user = null;

        // localStorage 정리 (중요!)
        localStorage.removeItem("authName");
        localStorage.removeItem("authUsername");
        localStorage.removeItem("authRoleName");
        localStorage.removeItem("authCodes");
        localStorage.removeItem("authUserId");

        return false;
      }
    },
  },
});
