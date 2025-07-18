import { createApp } from "vue";
import router from "./router";
import "./style.scss";
import App from "./App.vue";
import { createPinia } from "pinia";
import i18n from "./i18n";

import { useAuthStore } from "./stores/authStore";
import { isCurrentTokenValid } from "./utils/tokenManager";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(i18n);
// 로그인 정보 체크 (토큰 유효성 검사 포함)
const authStore = useAuthStore();

// 토큰 상태 복구 및 유효성 검사
(async () => {
  await authStore.loadStoredToken();

  // 토큰이 유효하지 않으면 로그아웃 처리
  if (authStore.isLoggedIn && !isCurrentTokenValid()) {
    console.log("저장된 토큰이 유효하지 않음, 로그아웃 처리");
    await authStore.logout();
  }
})();

app.use(router);

app.mount("#app");
