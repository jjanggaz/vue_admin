<template>
  <div class="login-page">
    <div class="login-container">
      <div class="lang-select-wrap abs-lang-select">
        <span class="lang-icon">🌐</span>
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
            v-model="loginForm.username"
            type="text"
            :placeholder="t('placeholder.loginUsername')"
            @invalid="handleInvalid($event, 'username')"
            @input="($event.target as HTMLInputElement).setCustomValidity('')"
            required
          />
        </div>

        <div class="form-group">
          <input
            id="password"
            v-model="loginForm.password"
            type="password"
            :placeholder="t('placeholder.loginPassword')"
            @invalid="handleInvalid($event, 'password')"
            @input="($event.target as HTMLInputElement).setCustomValidity('')"
            required
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

const handleInvalid = (event: Event, fieldType: string) => {
  const input = event.target as HTMLInputElement;

  if (input.validity.valueMissing) {
    if (fieldType === "username") {
      input.setCustomValidity(t("validation.usernameRequired"));
    } else if (fieldType === "password") {
      input.setCustomValidity(t("validation.passwordRequired"));
    }
  } else {
    input.setCustomValidity("");
  }
};

const handleLogin = async () => {
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
    router.push("/dashboard");
  } catch (error: any) {
    // 백엔드 에러 응답 구조에 맞게 처리
    console.log("로그인 에러 객체:", error);
    console.log("에러 타입:", typeof error);
    console.log("에러 message:", error?.message);
    console.log("에러 전체 구조:", JSON.stringify(error, null, 2));

    const errorMessage = error?.message || t("messages.error.loginFail");
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
  top: 24px;
  right: 32px;
  z-index: 10;
}
.login-container {
  position: relative;
  width: 100%;
  max-width: 500px;
  background: $background-color;
  padding: $spacing-xxl;
  padding-bottom: 120px;
  border-radius: $border-radius-lg;
  box-shadow: $shadow-xl;
}

.login-header {
  text-align: center;
  margin: 80px 0;

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
    margin: 0;
    font-size: $font-size-lg;
    font-weight: $font-weight-md;
    letter-spacing: -1px;
    color: $text-blue;
  }
}

.login-form {
  .form-group {
    margin-bottom: $spacing-md;

    input {
      height: 50px;
    }
  }
  .form-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-lg;

    label {
      display: flex;
      align-items: center;
      font-size: $font-size-sm;
      color: $text-color;
      cursor: pointer;
      input[type="checkbox"] {
        width: 20px;
        height: 20px;
        border: 1px solid $border-color;
        border-radius: $border-radius-sm;
        appearance: none;
        cursor: pointer;
        &:checked {
          background: $background-blue url(/process/images/icons/ico_check.svg)
            no-repeat center center;
          border-color: $primary-color;
          accent-color: $background-blue;
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
    width: 100%;
    height: 60px;
    font-size: $font-size-base;
  }
}

.lang-select-wrap {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-top: 10px;
  .lang-icon {
    margin-right: 6px;
    font-size: 18px;
  }
  .lang-select {
    padding: 4px 12px;
    border-radius: 4px;
    border: 1px solid #ddd;
    font-size: 15px;
    outline: none;
  }
}
</style>
