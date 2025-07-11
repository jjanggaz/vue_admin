<template>
  <aside class="sidebar">
    <div class="sidebar-content">
      <img src="/public/images/logo/logo_wai_sd.svg" alt="" />

      <!-- Navigation Menu -->
      <nav class="nav-menu">
        <router-link to="/dashboard" class="nav-item">
          <span class="nav-icon">📊</span>
          <span class="nav-text">대시보드</span>
        </router-link>

        <router-link to="/project" class="nav-item">
          <span class="nav-icon">📁</span>
          <span class="nav-text">프로젝트 관리</span>
        </router-link>

        <router-link to="/asset" class="nav-item">
          <span class="nav-icon">⚙️</span>
          <span class="nav-text">유입종류 관리</span>
        </router-link>

        <router-link to="/process" class="nav-item">
          <span class="nav-icon">🏗️</span>
          <span class="nav-text">공정 관리</span>
        </router-link>

        <router-link to="/model" class="nav-item">
          <span class="nav-icon">📦</span>
          <span class="nav-text">3D모델 관리</span>
        </router-link>

        <router-link to="/machine" class="nav-item">
          <span class="nav-icon">🏭</span>
          <span class="nav-text">기기리스트 관리</span>
        </router-link>

        <router-link to="/user" class="nav-item">
          <span class="nav-icon">👥</span>
          <span class="nav-text">사용자 관리</span>
        </router-link>

        <router-link to="/code" class="nav-item">
          <span class="nav-icon">🔑</span>
          <span class="nav-text">코드 관리</span>
        </router-link>
      </nav>
    </div>
  </aside>
</template>

<script setup lang="ts">
// 라우터 활성 링크는 Vue Router가 자동으로 처리
</script>

<style scoped lang="scss">
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  width: 250px;
  height: 100vh;
  background-color: $background-darker;
  z-index: 100;

  .sidebar-content {
    height: 100%;
    display: flex;
    flex-direction: column;

    img {
      width: 220px;
      height: auto;
      margin: $spacing-lg auto;
      padding: 0 $spacing-lg;
      object-fit: contain;
    }
  }

  .nav-menu {
    flex: 1;
    padding: $spacing-lg 0;

    .nav-item {
      display: flex;
      align-items: center;
      padding: $spacing-md $spacing-lg;
      color: rgba($text-white, 0.7);
      text-decoration: none;
      cursor: pointer;
      transition: $transition-base;
      border-left: 3px solid transparent;

      &:hover {
        background-color: rgba(255, 255, 255, 0.05);
        color: $text-white;
      }

      &.router-link-active {
        background-color: rgba($primary-color, 0.1);
        color: $text-white;
        border-left-color: $primary-color;

        .nav-icon {
          color: $primary-color;
        }
      }

      .nav-icon {
        font-size: 18px;
        margin-right: $spacing-md;
        width: 24px;
        text-align: center;
      }

      .nav-text {
        font-size: $font-size-base;
        font-weight: $font-weight-md;
      }
    }
  }
}

@media (max-width: $breakpoint-lg) {
  .sidebar {
    transform: translateX(-100%);
    transition: transform 0.3s ease;

    &.open {
      transform: translateX(0);
    }
  }
}
</style>
