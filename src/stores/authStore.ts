import { defineStore } from "pinia";
import { request } from "../utils/request";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    isLoggedIn: false,
    user: null as null | { user_id: string; name: string; role: string },
  }),
  actions: {
    // 로그인 처리
    async login(username: string, password: string) {
      try {
        console.log("[stores/authStore.ts] login() 입력한 ID/패스워드 id >> ", username ,", password >> ",password);

        // const result = await request("/admin/userLogin", {
        //   user_id: username,
        //   password: password,
        // });
        // if (result && result.data) {
        //   const data = result.data;
        //   console.log(
        //     "[stores/authStore.ts] login() 로그인 성공 " +
        //       data.user_id +
        //       ", " +
        //       data.name +
        //       ", " +
        //       data.role
        //   );

        //   this.isLoggedIn = true;
        //   this.user = {
        //     user_id: data.user_id,
        //     name: data.name,
        //     role: data.role,
        //   };

        //   sessionStorage.setItem("authUserId", data.user_id);
        //   sessionStorage.setItem("authName", data.name);
        //   sessionStorage.setItem("authRole", data.role);
        // } else {
        //   throw new Error("아이디 또는 비밀번호가 올바르지 않습니다.");
        // }

        user_id: "seoyun";
        name: "배서윤";
        role: "admin";

        this.isLoggedIn = true;
        this.user = {
          user_id: "seoyun",
          name: "배서윤",
          role: "admin",
        };

        sessionStorage.setItem("authUserId", "seoyun");
        sessionStorage.setItem("authName", "배서윤");
        sessionStorage.setItem("authRole", "admin");
      } catch (error) {
        console.error("로그인 실패:", error);
        throw error;
      }
    },

    // 로그아웃 처리
    logout() {
      console.log("[stores/authStore.ts] logout() 실행완료");

      this.isLoggedIn = false;
      this.user = null;

      // 저장된 토큰 삭제
      sessionStorage.removeItem("authUserId");
      sessionStorage.removeItem("authName");
      sessionStorage.removeItem("authRole");
    },

    // 새로고침 대비: 저장된 토큰 불러와서 로그인 상태 복구
    loadStoredToken() {
      const authUserId = sessionStorage.getItem("authUserId");
      const authName = sessionStorage.getItem("authName");
      const authRole = sessionStorage.getItem("authRole");

      console.log(
        "[stores/authStore.ts] 새로고침 대비 loadStoredToken() authUserId : " +
          authUserId
      );

      if (authUserId && authName && authRole) {
        this.isLoggedIn = true;
        this.user = {
          user_id: authUserId as string,
          name: authName as string,
          role: authRole as string,
        };
      }
    },
  },
});
