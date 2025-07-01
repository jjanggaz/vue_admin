<template>
  <header class="app-header">
    <div class="header-content">
      <!-- Logo -->
      <div class="logo-section">
        <h1 class="logo">WAI<span class="logo-sub">DESIGN</span></h1>
      </div>
      
      <!-- User Section -->
      <div class="user-section">
        <span class="user-id">idAdmin250222</span>
        <button class="logout-btn" @click="handleLogout">LOGOUT</button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const handleLogout = () => {
  localStorage.removeItem('isAuthenticated')
  localStorage.removeItem('username')
  router.push('/login')
}
</script>

<style scoped lang="scss">
.app-header {
  position: fixed;
  top: 0;
  left: 250px;
  right: 0;
  height: 70px;
  background-color: $background-color;
  border-bottom: 1px solid $border-color;
  z-index: 90;
  
  .header-content {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 $spacing-xl;
  }
  
  .logo-section {
    .logo {
      font-size: $font-size-xl;
      font-weight: $font-weight-bold;
      color: $text-color;
      margin: 0;
      
      .logo-sub {
        font-weight: $font-weight-normal;
      }
    }
  }
  
  .user-section {
    display: flex;
    align-items: center;
    gap: $spacing-lg;
    
    .user-id {
      color: $text-light;
      font-size: $font-size-small;
    }
    
    .logout-btn {
      padding: $spacing-xs $spacing-md;
      background-color: transparent;
      border: 1px solid $border-color;
      border-radius: $border-radius-sm;
      color: $text-light;
      font-size: $font-size-small;
      cursor: pointer;
      transition: $transition-base;
      
      &:hover {
        background-color: $background-light;
        border-color: $primary-color;
        color: $primary-color;
      }
    }
  }
}

@media (max-width: $breakpoint-lg) {
  .app-header {
    left: 0;
  }
}
</style>
