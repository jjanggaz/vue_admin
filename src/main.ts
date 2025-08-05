import { createApp } from "vue";
import router from "./router";
import "./style.scss";
import App from "./App.vue";
import { createPinia } from "pinia";
import i18n from "./i18n";

import { useAuthStore } from "./stores/authStore";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(i18n);
// 로그인 정보 체크 (토큰 유효성 검사 포함)
const authStore = useAuthStore();

// 사용자 정보 복구 및 기본 정보 확인
(async () => {
  await authStore.loadStoredToken();

  // localStorage에 사용자 정보가 있는지 확인 (토큰은 httpOnly 쿠키에 저장됨)
  if (authStore.isLoggedIn) {
    const authName = localStorage.getItem("authName");
    const authUsername = localStorage.getItem("authUsername");
    const authCodes = localStorage.getItem("authCodes");

    if (!authName || !authUsername || !authCodes) {
      console.log("localStorage에 사용자 정보가 없음, 로그아웃 처리");
      await authStore.logout();
    }
  }
})();

app.use(router);

// 토큰 만료 이벤트 리스너 추가
window.addEventListener("token-expired", async () => {
  const authStore = useAuthStore();
  await authStore.logout();
  router.push("/login");
});

app.mount("#app");
