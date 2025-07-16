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
// 로그인 정보 체크
const authStore = useAuthStore();
authStore.loadStoredToken();

app.use(router);

app.mount("#app");
