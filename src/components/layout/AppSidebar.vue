<template>
  <aside class="sidebar">
    <div class="sidebar-content">
      <!-- <img src="/public/images/logo/logo_wai_sd.svg" alt="" /> -->
      <img :src="logoWaiSd" alt="WAI SD Logo" />

      <!-- Navigation Menu -->
      <nav class="nav-menu">
        <router-link to="/dashboard" class="nav-item">
          <span class="nav-icon">📊</span>
          <span class="nav-text">{{ t("sidebar.dashboard") }}</span>
        </router-link>

        <router-link to="/project" class="nav-item">
          <span class="nav-icon">📁</span>
          <span class="nav-text">{{ t("sidebar.project") }}</span>
        </router-link>

        <router-link to="/asset" class="nav-item">
          <span class="nav-icon">⚙️</span>
          <span class="nav-text">{{ t("sidebar.asset") }}</span>
        </router-link>

        <router-link to="/process" class="nav-item">
          <span class="nav-icon">🏗️</span>
          <span class="nav-text">{{ t("sidebar.process") }}</span>
        </router-link>

        <router-link to="/model" class="nav-item">
          <span class="nav-icon">📦</span>
          <span class="nav-text">{{ t("sidebar.model") }}</span>
        </router-link>

        <router-link to="/machine" class="nav-item">
          <span class="nav-icon">🏭</span>
          <span class="nav-text">{{ t("sidebar.machine") }}</span>
        </router-link>

        <router-link to="/user" class="nav-item">
          <span class="nav-icon">👥</span>
          <span class="nav-text">{{ t("sidebar.user") }}</span>
        </router-link>

        <router-link to="/code" class="nav-item">
          <span class="nav-icon">🔑</span>
          <span class="nav-text">{{ t("sidebar.code") }}</span>
        </router-link>
      </nav>
    </div>
  </aside>
</template>

<script setup lang="ts">
import logoWaiSd from "@/assets/images/logo/logo_wai_sd.svg";
import { useI18n } from "vue-i18n";
const { t } = useI18n();
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
