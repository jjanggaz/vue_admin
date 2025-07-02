<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-header">
        <h1 class="logo">
          <img src="/public/images/logo/logo_wai.svg" alt="">
        </h1>
        <p class="subtitle">수처리플랜트 설계를 위한 전문시스템</p>
      </div>
      
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <!-- <label for="username">사용자 ID</label> -->
          <input 
            id="username"
            v-model="loginForm.username"
            type="text"
            placeholder="아이디"
            required
          />
        </div>
        
        <div class="form-group">
          <!-- <label for="password">비밀번호</label> -->
          <input 
            id="password"
            v-model="loginForm.password"
            type="password"
            placeholder="비밀번호"
            required
          />
        </div>
        <div class="form-options">
          <label>
            <input type="checkbox" />
            아이디 기억하기
          </label>
          <a href="/forgot-password" class="forgot-password">비밀번호 찾기</a>
        </div>

        <button type="submit" class="btn btn-primary login-btn">
          로그인
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const loginForm = ref({
  username: '',
  password: ''
})

const handleLogin = async () => {
  // 로그인 로직 (임시)
  if (loginForm.value.username && loginForm.value.password) {
    localStorage.setItem('isAuthenticated', 'true')
    localStorage.setItem('username', loginForm.value.username)
    router.push('/dashboard')
  }
}
</script>

<style scoped lang="scss">
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: url(../assets/images/pages/login/bg_login.jpg) no-repeat center center /cover;
}

.login-container {
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
          background: $background-blue url(/public/images/icons/ico_check.svg) no-repeat center center;
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
</style>
