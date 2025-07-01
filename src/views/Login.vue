<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-header">
        <h1 class="logo">WAI<span class="logo-sub">DESIGN</span></h1>
        <p class="subtitle">관리자 로그인</p>
      </div>
      
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="username">사용자 ID</label>
          <input 
            id="username"
            v-model="loginForm.username"
            type="text"
            placeholder="사용자 ID를 입력하세요"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="password">비밀번호</label>
          <input 
            id="password"
            v-model="loginForm.password"
            type="password"
            placeholder="비밀번호를 입력하세요"
            required
          />
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-container {
  background: $background-color;
  padding: $spacing-xxl;
  border-radius: $border-radius-xl;
  box-shadow: $shadow-xl;
  width: 100%;
  max-width: 400px;
}

.login-header {
  text-align: center;
  margin-bottom: $spacing-xl;
  
  .logo {
    font-size: $font-size-xxl;
    font-weight: $font-weight-bold;
    color: $primary-color;
    margin: 0 0 $spacing-sm 0;
    
    .logo-sub {
      font-weight: $font-weight-normal;
    }
  }
  
  .subtitle {
    color: $text-light;
    margin: 0;
  }
}

.login-form {
  .form-group {
    margin-bottom: $spacing-lg;
  }
  
  .login-btn {
    width: 100%;
    padding: $spacing-md;
    font-size: $font-size-base;
  }
}
</style>
