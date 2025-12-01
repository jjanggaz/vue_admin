<template>
  <div class="login-page">
    <div class="login-container">
      <div class="lang-select-wrap abs-lang-select">
        <select
          v-model="selectedLang"
          @change="changeLang"
          class="lang-select"
          ref="langSelectRef"
        >
          <option value="ko">한국어</option>
          <option value="en">English</option>
        </select>
      </div>
      <div class="login-header">
        <h1 class="logo">
          <img :src="logoWai" alt="WAI Logo" />
        </h1>
        <p class="subtitle">{{ t("login.subtitle") }}</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <input
            id="username"
            ref="usernameRef"
            v-model="loginForm.username"
            type="text"
            :placeholder="t('placeholder.loginUsername')"
          />
        </div>

        <div class="form-group">
          <input
            id="password"
            ref="passwordRef"
            v-model="loginForm.password"
            type="password"
            :placeholder="t('placeholder.loginPassword')"
          />
        </div>
        <div class="form-options">
          <label>
            <input type="checkbox" v-model="rememberUsername" />
            {{ t("login.rememberId") }}
          </label>
        </div>

        <button type="submit" class="btn btn-primary login-btn">
          {{ t("login.loginBtn") }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/authStore";
import { useI18n } from "vue-i18n";
import logoWai from "@/assets/images/logo/logo_wai.svg";

const { t, locale } = useI18n();
const router = useRouter();
const authStore = useAuthStore();

const loginForm = ref({ username: "", password: "" });
const rememberUsername = ref(false);

const selectedLang = ref(
  localStorage.getItem("wai_lang") || locale.value || "ko"
);
const langSelectRef = ref();
const usernameRef = ref<HTMLInputElement>();
const passwordRef = ref<HTMLInputElement>();

const loadSavedUsername = () => {
  const savedUsername = localStorage.getItem("rememberedUsername");
  if (savedUsername) {
    loginForm.value.username = savedUsername;
    rememberUsername.value = true;
  }
};

onMounted(() => {
  loadSavedUsername();
  // 언어 select가 mount되면 바로 펼쳐지도록 포커스
  if (langSelectRef.value) {
    langSelectRef.value.blur(); // 자동으로 펼치지 않으려면 주석처리
  }
});

const changeLang = () => {
  locale.value = selectedLang.value;
  localStorage.setItem("wai_lang", selectedLang.value);
};

const handleLogin = async () => {
  // 입력값 검증
  if (!loginForm.value.username) {
    alert(t("validation.usernameRequired"));
    usernameRef.value?.focus();
    return;
  }
  if (!loginForm.value.password) {
    alert(t("validation.passwordRequired"));
    passwordRef.value?.focus();
    return;
  }

  try {
    // 기존 토큰이 있다면 먼저 삭제
    if (authStore.isLoggedIn) {
      console.log("기존 로그인 상태 감지, 토큰 삭제 후 재로그인");
      await authStore.logout();
    }

    await authStore.login(
      loginForm.value.username,
      loginForm.value.password,
      selectedLang.value
    );
    if (rememberUsername.value) {
      localStorage.setItem("rememberedUsername", loginForm.value.username);
    } else {
      localStorage.removeItem("rememberedUsername");
    }
    router.push("/code");
  } catch (error: any) {
    // 백엔드 에러 응답 구조에 맞게 처리
    console.log("로그인 에러 객체:", error);
    console.log("에러 타입:", typeof error);
    console.log("에러 message:", error?.message);
    console.log("에러 전체 구조:", JSON.stringify(error, null, 2));

    // 에러 메시지가 다국어 키인 경우 다국어 처리, 아니면 그대로 사용
    let errorMessage = error?.message || t("messages.error.loginFail");
    // messages.error.로 시작하는 경우 다국어 키로 인식
    if (errorMessage.startsWith("messages.error.")) {
      errorMessage = t(errorMessage);
    }
    alert(errorMessage);
  }
};
</script>

<style scoped lang="scss">
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: url(../../assets/images/pages/login/bg_login.jpg) no-repeat center
    center / cover;
}

.abs-lang-select {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 10;
}

.login-container {
  position: relative;
  width: 100%;
  max-width: 500px;
  min-height: 700px;
  padding: 0 40px;
  padding-bottom: 175px;
  background: $background-color;
  border-radius: $border-radius-lg;
  box-shadow: $shadow-xl;
}

.login-header {
  text-align: center;
  margin: 145px 0 80px;

  .logo {
    font-size: $font-size-xxl;
    font-weight: $font-weight-bold;
    color: $primary-color;
    margin: 0 0 $spacing-sm 0;
    img {
      display: block;
      margin: 0 auto;
    }

    .logo-sub {
      font-weight: $font-weight-normal;
    }
  }

  .subtitle {
    font-size: $font-size-lg;
    font-weight: 600;
    letter-spacing: -1px;
    color: $text-blue;
  }
}

.login-form {
  .form-group {
    margin-bottom: $spacing-md;

    input {
      height: 50px;
      font-weight: 500;
    }
  }
  .form-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 40px;

    label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 15px;
      color: #888888;
      font-weight: 600;
      cursor: pointer;

      input[type="checkbox"] {
        appearance: none;
        width: 20px;
        height: 20px;
        border: none;
        background-color: transparent;
        background: url(../../assets/icons/ico_check-off.svg) no-repeat center /
          20px auto;
        background-repeat: no-repeat;
        background-position: center;
        background-size: 20px auto;
        cursor: pointer;

        &:checked {
          background-image: url(../../assets/icons/ico_login-check-on.svg);
        }
      }
    }

    .forgot-password {
      color: $text-sky;
      text-decoration: none;
      font-size: $font-size-sm;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  .login-btn {
    justify-content: center;
    width: 100%;
    height: 60px;
    padding: 10px 0;
    font-size: 20px;
    font-weight: 700;
  }
}

.lang-select-wrap {
  display: flex;
  align-items: center;
  justify-content: flex-end;

  .lang-select {
    position: relative;
    appearance: none;
    width: 80px;
    height: 26px;
    padding: 0 10px;
    border-radius: 4px;
    border: 1px solid #707489;
    font-size: 12px;
    font-weight: 400;
    background-image: url(../../assets/icons/ico_select-down.svg);
    background-repeat: no-repeat;
    background-position: right 10px center;
    background-size: 12px auto;

    &:focus {
      background-image: url(../../assets/icons/ico_select-up.svg);
    }
  }
}
</style>
